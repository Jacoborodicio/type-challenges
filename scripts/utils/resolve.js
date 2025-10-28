"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFilePath = resolveFilePath;
const locales_1 = require("../locales");
function resolveFilePath(dir, name, ext, locale) {
    if (locale === locales_1.defaultLocale)
        return `${dir}/${name}.${ext}`;
    else
        return `${dir}/${name}.${locale}.${ext}`;
}
