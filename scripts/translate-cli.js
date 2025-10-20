"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readme_1 = require("./readme");
const translate_1 = require("./translate");
const locales_1 = require("./locales");
async function run() {
    await (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'zh-CN');
    await (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'ja');
    await (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'pt-BR');
    await (0, readme_1.updateREADMEs)();
}
run();
