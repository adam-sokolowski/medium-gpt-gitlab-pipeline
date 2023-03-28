"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.review = void 0;
const tslib_1 = require("tslib");
const isEmpty_1 = tslib_1.__importDefault(require("lodash/isEmpty"));
const map_1 = tslib_1.__importDefault(require("lodash/map"));
const first_1 = tslib_1.__importDefault(require("lodash/first"));
const get_1 = tslib_1.__importDefault(require("lodash/get"));
const last_1 = tslib_1.__importDefault(require("lodash/last"));
const openai_1 = require("openai");
const config_1 = require("./config/config");
const readConfigSync_1 = require("./readConfigSync/readConfigSync");
const gitlabUtils_1 = require("./gitlab/gitlabUtils");
const yargs = require('yargs');
const args = yargs(process.argv).argv;
/**
 * CLI running GPT for code analysis
 * @param projectId - built-in gitlab variable identifyying the project
 * @param query - Prompt for GPT
 * @param token - Gitlab token with permissions to write
 * @returns Promise<void>
 */
async function review() {
    const { projectId, query, token, } = args;
    if (!projectId) {
        console.error('Missing or unreadable gitlab project ID');
        return;
    }
    if (!query) {
        console.error('Missing or unreadable query for GPT, plese provide one, until then - quitting');
        return;
    }
    const gitlabToken = token || config_1.GITLAB.privateToken;
    const mergeRequests = await (0, gitlabUtils_1.getOpenMergeRequests)(projectId, gitlabToken);
    if ((0, isEmpty_1.default)(mergeRequests)) {
        console.error('No open merge requests. Aborting');
        return;
    }
    else {
        console.error(`Found ${mergeRequests && mergeRequests.length} Merge request(s)`);
    }
    const configuration = new openai_1.Configuration({
        apiKey: config_1.OPEN_AI.gptKey,
    });
    const openai = new openai_1.OpenAIApi(configuration);
    let customConfig = {};
    try {
        customConfig = (0, readConfigSync_1.readConfigSync)('./');
    }
    catch (_a) {
        console.error('Unable to read custom cofnig, using default instead');
    }
    const hasLanguagesSpecified = customConfig.language && customConfig.language.length;
    const languagePrompt = `${hasLanguagesSpecified ? `Consider good practices for ${customConfig.language}.` : '.'}`;
    const additionalRules = customConfig.rules && customConfig.rules.length
        ? (0, map_1.default)(customConfig.rules, rule => ` For ${(0, first_1.default)(rule)} consider that ${(0, last_1.default)(rule)}`)
        : [];
    (0, map_1.default)(mergeRequests, async (item) => {
        const mergeRequestChanges = await (0, gitlabUtils_1.getChanges)(projectId, item.iid, gitlabToken) || [];
        (0, map_1.default)(mergeRequestChanges, change => {
            const prompt = `${query} ${languagePrompt}${additionalRules}. The code changes are in gitlab diff notation, lines starting with minus sign are deleted, lines starting with plus sign are added. You will find the changes in \n ${change.diff}`;
            console.info(`GPT prompt: ${prompt}`);
            openai.createCompletion({
                model: config_1.OPEN_AI.model,
                max_tokens: config_1.OPEN_AI.maxTokens,
                prompt,
            }).then(result => {
                const comment = result.data.choices && (0, first_1.default)(result.data.choices) && (0, get_1.default)((0, first_1.default)(result.data.choices), 'text') || '';
                if (!comment) {
                    return;
                }
                (0, gitlabUtils_1.addComment)(projectId, item.iid, `🤖 Automated comment: ${comment}`, gitlabToken);
            });
        });
    });
}
exports.review = review;
review();
