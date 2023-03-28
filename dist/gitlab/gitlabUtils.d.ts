export declare function getOpenMergeRequests(projectId: number, token: string): Promise<any>;
export declare function getChanges(projectId: number, iid: number, token: string): Promise<any>;
export declare function addComment(projectId: number, iid: number, comment: string, token: string): Promise<import("axios").AxiosResponse<any, any>>;
