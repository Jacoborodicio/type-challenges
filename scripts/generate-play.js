"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const ansis_1 = __importDefault(require("ansis"));
const prompts_1 = __importDefault(require("prompts"));
const formatToCode_1 = require("./actions/utils/formatToCode");
const loader_1 = require("./loader");
const locales_1 = require("./locales");
const issue_pr_1 = require("./actions/issue-pr");
function calculateFileHash(filePathFull) {
    return new Promise((resolve, reject) => {
        const hash = node_crypto_1.default.createHash('sha1');
        const fileStream = fs_extra_1.default.createReadStream(filePathFull);
        fileStream.on('data', (data) => {
            hash.update(data);
        });
        fileStream.on('end', () => {
            hash.update(filePathFull);
            resolve(hash.digest('hex'));
        });
        fileStream.on('error', (err) => {
            reject(err);
        });
    });
}
async function takeSnapshot(quizzesPath) {
    let snapshot = {};
    const files = fs_extra_1.default.readdirSync(quizzesPath);
    for (const file of files) {
        // Might be a file, or a folder
        const fPath = node_path_1.default.join(quizzesPath, file);
        const fStats = fs_extra_1.default.statSync(fPath);
        if (fStats.isDirectory()) {
            snapshot = Object.assign(Object.assign({}, snapshot), (await takeSnapshot(fPath)));
        }
        else {
            snapshot[file] = await calculateFileHash(fPath);
        }
    }
    return snapshot;
}
function readPlaygroundCache(playgroundCachePath) {
    if (!fs_extra_1.default.existsSync(playgroundCachePath))
        return {};
    try {
        const rawCacheContent = fs_extra_1.default.readFileSync(playgroundCachePath);
        return JSON.parse(rawCacheContent.toString());
    }
    catch (err) {
        console.log(ansis_1.default.red('Playground cache corrupted. '
            + 'Cannot generate playground without keeping your changes intact'));
        console.log(ansis_1.default.cyan('Please ensure you have run this: "pnpm generate"'));
        node_process_1.default.exit(1);
    }
}
function calculateOverridableFiles(cache, snapshot) {
    const result = {};
    for (const quizName in snapshot) {
        if (snapshot[quizName] === cache[quizName])
            result[quizName] = snapshot[quizName];
    }
    return result;
}
function isQuizWritable(quizFileName, overridableFiles, playgroundSnapshot) {
    return !!(overridableFiles[quizFileName]
        || (!overridableFiles[quizFileName] && !playgroundSnapshot[quizFileName]));
}
async function generatePlayground() {
    const playgroundPath = node_path_1.default.join(__dirname, '../playground');
    const playgroundCachePath = node_path_1.default.join(__dirname, '../.playgroundcache');
    let locale = locales_1.supportedLocales.find(locale => locale === node_process_1.default.argv[2]);
    console.log(ansis_1.default.bold.cyan('Generating local playground...\n'));
    let overridableFiles;
    let keepChanges = false;
    const currentPlaygroundCache = readPlaygroundCache(playgroundCachePath);
    let playgroundSnapshot;
    if (node_process_1.default.argv.length === 3 && (node_process_1.default.argv[2] === '--keep-changes' || node_process_1.default.argv[2] === '-K')) {
        console.log(ansis_1.default.bold.cyan('We will keep your changes while generating.\n'));
        keepChanges = true;
        playgroundSnapshot = await takeSnapshot(playgroundPath);
        overridableFiles = calculateOverridableFiles(currentPlaygroundCache, playgroundSnapshot);
    }
    else if (fs_extra_1.default.existsSync(playgroundPath)) {
        const result = await (0, prompts_1.default)([{
                name: 'confirm',
                type: 'confirm',
                initial: false,
                message: 'The playground directory already exists, it may contains the answers you did. Do you want to override it?',
            }]);
        if (!(result === null || result === void 0 ? void 0 : result.confirm))
            return console.log(ansis_1.default.yellow('Skipped.'));
    }
    if (!locale) {
        const result = await (0, prompts_1.default)([{
                name: 'locale',
                type: 'select',
                message: 'Select language:',
                choices: locales_1.supportedLocales.map(i => ({
                    title: i,
                    value: i,
                })),
            }]);
        if (!result)
            return console.log(ansis_1.default.yellow('Skipped.'));
        locale = result.locale;
    }
    if (!keepChanges) {
        await fs_extra_1.default.remove(playgroundPath);
        await fs_extra_1.default.ensureDir(playgroundPath);
    }
    const quizzes = await (0, loader_1.loadQuizzes)();
    const incomingQuizzesCache = {};
    for (const quiz of quizzes) {
        const { difficulty, title } = (0, loader_1.resolveInfo)(quiz, locale);
        const code = (0, formatToCode_1.formatToCode)(quiz, locale);
        if (difficulty === undefined || title === undefined) {
            console.log(ansis_1.default.yellow `${quiz.no} has no ${locale.toUpperCase()} version. Skipping`);
            continue;
        }
        const quizzesPathByDifficulty = node_path_1.default.join(playgroundPath, difficulty);
        const quizFileName = `${(0, issue_pr_1.getQuestionFullName)(quiz.no, difficulty, title)}.ts`;
        const quizPathFull = node_path_1.default.join(quizzesPathByDifficulty, quizFileName);
        if (!keepChanges || (keepChanges && isQuizWritable(quizFileName, overridableFiles, playgroundSnapshot))) {
            if (!fs_extra_1.default.existsSync(quizzesPathByDifficulty))
                fs_extra_1.default.mkdirSync(quizzesPathByDifficulty);
            await fs_extra_1.default.writeFile(quizPathFull, code, 'utf-8');
            incomingQuizzesCache[quizFileName] = await calculateFileHash(quizPathFull);
        }
    }
    fs_extra_1.default.writeFile(playgroundCachePath, JSON.stringify(Object.assign(Object.assign({}, currentPlaygroundCache), incomingQuizzesCache)));
    console.log();
    console.log(ansis_1.default.bold.green('Local playground generated at: ') + ansis_1.default.dim(playgroundPath));
    console.log();
}
generatePlayground();
