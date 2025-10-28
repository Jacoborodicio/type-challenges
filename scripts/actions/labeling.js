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
const action = (github, context, core) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = context.payload;
    const issue = payload.issue;
    if (!issue)
        return;
    const labels = (issue.labels || [])
        .map((i) => i && i.name)
        .filter(Boolean);
    if (labels.includes('answer')) {
        const match = issue.title.match(/^(\d+) - /);
        if (match && match[1]) {
            const no = Number(match[1]);
            if (Number.isNaN(no))
                return;
            const name = no.toString();
            if (labels.includes('trigger-bot')) {
                yield github.rest.issues.removeLabel({
                    issue_number: context.issue.number,
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    name: 'trigger-bot',
                });
            }
            if (labels.includes(name))
                return;
            try {
                yield github.rest.issues.getLabel({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    name,
                });
            }
            catch (_a) {
                yield github.rest.issues.createLabel({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    name,
                    color: 'ffffff',
                });
            }
            yield github.rest.issues.addLabels({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                labels: [name],
            });
        }
    }
    else {
        core.info('No matched labels, skipped');
    }
});
exports.default = action;
