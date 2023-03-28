import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import first from 'lodash/first';
import get from 'lodash/get';
import last from 'lodash/last';

import { Configuration, OpenAIApi } from 'openai';

import { OPEN_AI, GITLAB } from './config/config';
import { readConfigSync } from './readConfigSync/readConfigSync';
import { GPTConfig } from './interfaces/gptConfig.interface';
import { addComment, getChanges, getOpenMergeRequests } from './gitlab/gitlabUtils';

const yargs = require('yargs');
const args = yargs(process.argv).argv;

/**
 * CLI running GPT for code analysis
 * @param projectId - built-in gitlab variable identifyying the project
 * @param query - Prompt for GPT
 * @param token - Gitlab token with permissions to write
 * @returns Promise<void>
 */
export async function review() {

  const {
    projectId,
    query,
    token,
  } = args;

  if (!projectId) {
    console.error('Missing or unreadable gitlab project ID');
    return;
  }

  if (!query) {
    console.error('Missing or unreadable query for GPT, plese provide one, until then - quitting');
    return;
  }
  const gitlabToken = token || GITLAB.privateToken;
  const mergeRequests = await getOpenMergeRequests(projectId, gitlabToken);

  if (isEmpty(mergeRequests)) {
    console.error('No open merge requests. Aborting');
    return;
  } else {
    console.error(`Found ${mergeRequests && mergeRequests.length} Merge request(s)`);
  }

  const configuration = new Configuration({
    apiKey: OPEN_AI.gptKey,
  });

  const openai = new OpenAIApi(configuration);
  let customConfig = {} as GPTConfig;

  try {
    customConfig = readConfigSync<GPTConfig>('./');
  } catch {
    console.error('Unable to read custom cofnig, using default instead');
  }

  const hasLanguagesSpecified = customConfig.language && customConfig.language.length;
  const languagePrompt = `${hasLanguagesSpecified ? `Consider good practices for ${customConfig.language}.` : '.'}`;

  const additionalRules = customConfig.rules && customConfig.rules.length
    ? map(customConfig.rules, rule => ` For ${first(rule)} consider that ${last(rule)}`)
    : [];

  map(mergeRequests, async item => {
    const mergeRequestChanges = await getChanges(projectId, item.iid, gitlabToken) || [];

    map(mergeRequestChanges, change => {
      const prompt = `${query} ${languagePrompt}${additionalRules}. The code changes are in gitlab diff notation, lines starting with minus sign are deleted, lines starting with plus sign are added. You will find the changes in \n ${change.diff}`;

      console.info(`GPT prompt: ${prompt}`);

      openai.createCompletion({
        model: OPEN_AI.model,
        max_tokens: OPEN_AI.maxTokens,
        prompt,
      }).then(result => {
        const comment = result.data.choices && first(result.data.choices) && get(first(result.data.choices), 'text') || '';
        if (!comment) {
          return;
        }
        addComment(projectId, item.iid, `🤖 Automated comment: ${comment}`, gitlabToken);
      });
    });

  });
}
review();
