"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateAllQuizzes = exports.translateMarkdown = exports.translateQuiz = exports.translateQuizByNo = void 0;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const google_translate_api_1 = require("@vitalets/google-translate-api");
const loader_1 = require("./loader");
const resolve_1 = require("./utils/resolve");
const locales_1 = require("./locales");
async function translateQuizByNo(no, from, to) {
    const quiz = await (0, loader_1.loadQuizByNo)(no);
    if (!quiz)
        throw new Error(`Quiz #${no} not founded`);
    return await translateQuiz(quiz, from, to);
}
exports.translateQuizByNo = translateQuizByNo;
async function translateQuiz(quiz, from, to) {
    let translatedReadme = await translateMarkdown(quiz.readme[from], from, to);
    if (!translatedReadme)
        throw new Error(`Quiz #${quiz.no} empty translation`);
    translatedReadme = `> ${(0, locales_1.t)(to, 'readme.google-translated')}\n\n${translatedReadme.trim()}`;
    const readmePath = (0, resolve_1.resolveFilePath)(node_path_1.default.join(loader_1.QUIZ_ROOT, quiz.path), 'README', 'md', to);
    await fs_extra_1.default.writeFile(readmePath, translatedReadme, 'utf-8');
    console.log(`Translated [${quiz.no}] ${from} → ${to} | saved to ${readmePath}`);
}
exports.translateQuiz = translateQuiz;
async function translateMarkdown(code, from, to) {
    // to replace the code blocks intro a placeholder then feed it into translator
    // then replace back for the results
    const codeBlocks = [];
    const source = code
        .replace(/```[\s\S\n]+?```/g, (v) => {
        const placeholder = `__${codeBlocks.length}__`;
        codeBlocks.push(v);
        return placeholder;
    })
        .replace(/`[\s\S\n]+?`/g, (v) => {
        const placeholder = `__${codeBlocks.length}__`;
        codeBlocks.push(v);
        return placeholder;
    });
    const { text } = await (0, google_translate_api_1.translate)(source, {
        from,
        to,
    });
    if (!text)
        return;
    const result = text.replace(/__\s*?(\d+?)\s*?__/g, (_, i) => codeBlocks[+i]);
    return result;
}
exports.translateMarkdown = translateMarkdown;
async function translateAllQuizzes(from, to) {
    const quizzes = await (0, loader_1.loadQuizzes)();
    for (const quiz of quizzes) {
        if (quiz.readme[to] || !quiz.readme[from]) {
            console.log(`Skipped #${quiz.no}`);
            continue;
        }
        console.log(`Translating #${quiz.no} to ${to}`);
        await translateQuiz(quiz, from, to);
    }
}
exports.translateAllQuizzes = translateAllQuizzes;
