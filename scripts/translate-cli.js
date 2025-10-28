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
Object.defineProperty(exports, "__esModule", { value: true });
const readme_1 = require("./readme");
const translate_1 = require("./translate");
const locales_1 = require("./locales");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'zh-CN');
        yield (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'ja');
        yield (0, translate_1.translateAllQuizzes)(locales_1.defaultLocale, 'pt-BR');
        yield (0, readme_1.updateREADMEs)();
    });
}
run();
