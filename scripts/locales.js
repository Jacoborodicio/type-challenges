"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.supportedLocales = exports.defaultLocale = void 0;
exports.t = t;
exports.f = f;
exports.defaultLocale = 'en';
exports.supportedLocales = ['en', 'zh-CN', 'ja', 'ko', 'pt-BR'];
exports.messages = {
    'en': require('./locales/en.json'),
    'zh-CN': require('./locales/zh-CN.json'),
    'ja': require('./locales/ja.json'),
    'ko': require('./locales/ko.json'),
    'pt-BR': require('./locales/pt-BR.json'),
};
function t(locale, key) {
    const result = (exports.messages[locale] && exports.messages[locale][key]) || exports.messages[exports.defaultLocale][key];
    if (!result)
        throw new Error(`Missing message for key "${key}"`);
    return result;
}
function f(name, locale, ext) {
    if (locale === exports.defaultLocale)
        return `${name}.${ext}`;
    return `${name}.${locale}.${ext}`;
}
