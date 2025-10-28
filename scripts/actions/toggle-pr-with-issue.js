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
    const payload = context.payload || {};
    const issue = payload.issue;
    if (!issue)
        return;
    const labels = (issue.labels || [])
        .map((i) => i && i.name)
        .filter(Boolean);
    if (!labels.includes('new-challenge'))
        return;
    // close pull request
    // Leave a message: close by issue
    const no = issue.number;
    const action = payload.action;
    core.info(`action: ${action}`);
    // action: reopened
    // action: closed
    // find pull request
    const { data: pulls } = yield github.rest.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: action === 'closed' ? 'open' : 'closed',
    });
    core.info(`pulls.length ${pulls.length}`);
    core.info(JSON.stringify(pulls));
    const existing_pull = pulls.find(i => {
        var _a;
        return ((_a = i.user) === null || _a === void 0 ? void 0 : _a.login) === 'github-actions[bot]'
            && i.title.startsWith(`#${no} `);
    });
    if (!existing_pull) {
        core.info('existing_pull not exist');
        return;
    }
    core.info(JSON.stringify(context));
    if (context.payload.action === 'reopened') {
        yield github.rest.pulls.update(Object.assign(Object.assign({}, context.repo), { pull_number: existing_pull.number, state: 'open' }));
    }
    else {
        // close
        yield github.rest.pulls.update(Object.assign(Object.assign({}, context.repo), { pull_number: existing_pull.number, state: 'closed' }));
    }
});
exports.default = action;
