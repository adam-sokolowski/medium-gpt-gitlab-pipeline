/**
 * CLI running GPT for code analysis
 * @param projectId - built-in gitlab variable identifyying the project
 * @param query - Prompt for GPT
 * @param token - Gitlab token with permissions to write
 * @returns Promise<void>
 */
export declare function review(): Promise<void>;
