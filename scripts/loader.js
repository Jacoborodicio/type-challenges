"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUIZ_ROOT = void 0;
exports.loadFile = loadFile;
exports.loadLocaleVariations = loadLocaleVariations;
exports.readmeCleanUp = readmeCleanUp;
exports.loadInfo = loadInfo;
exports.loadQuizzes = loadQuizzes;
exports.loadQuiz = loadQuiz;
exports.loadQuizByNo = loadQuizByNo;
exports.resolveInfo = resolveInfo;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const locales_1 = require("./locales");
function loadFile(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_extra_1.default.existsSync(filepath))
            return yield fs_extra_1.default.readFile(filepath, 'utf-8');
        return undefined;
    });
}
function loadLocaleVariations(filepath_1) {
    return __awaiter(this, arguments, void 0, function* (filepath, preprocessor = s => s) {
        const { ext, dir, name } = node_path_1.default.parse(filepath);
        const data = {};
        for (const locale of locales_1.supportedLocales) {
            const file = preprocessor((yield loadFile(node_path_1.default.join(dir, `${name}.${locale}${ext}`))) || '');
            if (file)
                data[locale] = file;
        }
        if (!data[locales_1.defaultLocale]) {
            // default version
            const file = preprocessor((yield loadFile(filepath)) || '');
            if (file)
                data[locales_1.defaultLocale] = file;
        }
        return data;
    });
}
function readmeCleanUp(text) {
    return text
        .replace(/<!--info-header-start-->[\s\S]*<!--info-header-end-->/, '')
        .replace(/<!--info-footer-start-->[\s\S]*<!--info-footer-end-->/, '')
        .trim();
}
function loadInfo(s) {
    const object = js_yaml_1.default.load(s);
    if (!object)
        return undefined;
    const arrayKeys = ['tags', 'related'];
    for (const key of arrayKeys) {
        if (object[key]) {
            object[key] = (object[key] || '')
                .toString()
                .split(',')
                .map((i) => i.trim())
                .filter(Boolean);
        }
        else {
            object[key] = undefined;
        }
    }
    return object;
}
exports.QUIZ_ROOT = node_path_1.default.resolve(__dirname, '../questions');
function loadQuizzes() {
    return __awaiter(this, void 0, void 0, function* () {
        const folders = yield (0, fast_glob_1.default)('{0..9}*-*', {
            onlyDirectories: true,
            cwd: exports.QUIZ_ROOT,
        });
        const quizzes = yield Promise.all(folders.map((dir) => __awaiter(this, void 0, void 0, function* () { return loadQuiz(dir); })));
        return quizzes;
    });
}
function loadQuiz(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            no: Number(dir.replace(/^(\d+)-.*/, '$1')),
            difficulty: dir.replace(/^\d+-(.+?)-.*$/, '$1'),
            path: dir,
            info: yield loadLocaleVariations(node_path_1.default.join(exports.QUIZ_ROOT, dir, 'info.yml'), loadInfo),
            readme: yield loadLocaleVariations(node_path_1.default.join(exports.QUIZ_ROOT, dir, 'README.md'), readmeCleanUp),
            template: (yield loadFile(node_path_1.default.join(exports.QUIZ_ROOT, dir, 'template.ts'))) || '',
            tests: yield loadFile(node_path_1.default.join(exports.QUIZ_ROOT, dir, 'test-cases.ts')),
        };
    });
}
function loadQuizByNo(no) {
    return __awaiter(this, void 0, void 0, function* () {
        const folders = yield (0, fast_glob_1.default)(`${no}-*`, {
            onlyDirectories: true,
            cwd: exports.QUIZ_ROOT,
        });
        if (folders.length)
            return yield loadQuiz(folders[0]);
        return undefined;
    });
}
function resolveInfo(quiz, locale = locales_1.defaultLocale) {
    var _a, _b, _c, _d;
    const info = Object.assign(Object.assign({}, quiz.info[locales_1.defaultLocale]), quiz.info[locale]);
    info.tags = ((_a = quiz.info[locale]) === null || _a === void 0 ? void 0 : _a.tags) || ((_b = quiz.info[locales_1.defaultLocale]) === null || _b === void 0 ? void 0 : _b.tags) || [];
    info.related = ((_c = quiz.info[locale]) === null || _c === void 0 ? void 0 : _c.related) || ((_d = quiz.info[locales_1.defaultLocale]) === null || _d === void 0 ? void 0 : _d.related) || [];
    if (typeof info.tags === 'string')
        // @ts-expect-error
        info.tags = info.tags.split(',').map(i => i.trim()).filter(Boolean);
    return info;
}
