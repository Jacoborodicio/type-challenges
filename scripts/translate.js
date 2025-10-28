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
exports.translateQuizByNo = translateQuizByNo;
exports.translateQuiz = translateQuiz;
exports.translateMarkdown = translateMarkdown;
exports.translateAllQuizzes = translateAllQuizzes;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const google_translate_api_1 = require("@vitalets/google-translate-api");
const loader_1 = require("./loader");
const resolve_1 = require("./utils/resolve");
const locales_1 = require("./locales");
function translateQuizByNo(no, from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const quiz = yield (0, loader_1.loadQuizByNo)(no);
        if (!quiz)
            throw new Error(`Quiz #${no} not founded`);
        return yield translateQuiz(quiz, from, to);
    });
}
function translateQuiz(quiz, from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        let translatedReadme = yield translateMarkdown(quiz.readme[from], from, to);
        if (!translatedReadme)
            throw new Error(`Quiz #${quiz.no} empty translation`);
        translatedReadme = `> ${(0, locales_1.t)(to, 'readme.google-translated')}\n\n${translatedReadme.trim()}`;
        const readmePath = (0, resolve_1.resolveFilePath)(node_path_1.default.join(loader_1.QUIZ_ROOT, quiz.path), 'README', 'md', to);
        yield fs_extra_1.default.writeFile(readmePath, translatedReadme, 'utf-8');
        console.log(`Translated [${quiz.no}] ${from} → ${to} | saved to ${readmePath}`);
    });
}
function translateMarkdown(code, from, to) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const { text } = yield (0, google_translate_api_1.translate)(source, {
            from,
            to,
        });
        if (!text)
            return;
        const result = text.replace(/__\s*?(\d+?)\s*?__/g, (_, i) => codeBlocks[+i]);
        return result;
    });
}
function translateAllQuizzes(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const quizzes = yield (0, loader_1.loadQuizzes)();
        for (const quiz of quizzes) {
            if (quiz.readme[to] || !quiz.readme[from]) {
                console.log(`Skipped #${quiz.no}`);
                continue;
            }
            console.log(`Translating #${quiz.no} to ${to}`);
            yield translateQuiz(quiz, from, to);
        }
    });
}
