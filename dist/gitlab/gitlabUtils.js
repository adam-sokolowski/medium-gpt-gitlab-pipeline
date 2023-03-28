"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.getChanges = exports.getOpenMergeRequests = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const baseUrl = 'https://gitlab.emobg.io/api/v4';
function getOpenMergeRequests(projectId, token) {
    return axios_1.default.get(`${baseUrl}/projects/${projectId}/merge_requests?state=opened`, {
        headers: { 'PRIVATE-TOKEN': token },
    })
        .then(result => result.data)
        .catch(error => console.error(`Error fetching project Merge Requests: ${error}`));
}
exports.getOpenMergeRequests = getOpenMergeRequests;
function getChanges(projectId, iid, token) {
    return axios_1.default.get(`${baseUrl}/projects/${projectId}/merge_requests/${iid}/changes`, {
        headers: { 'PRIVATE-TOKEN': token },
    })
        .then(result => result.data && result.data.changes)
        .catch(error => console.error(`Error fetching project Merge Request changes: ${error}`));
}
exports.getChanges = getChanges;
function addComment(projectId, iid, comment, token) {
    return axios_1.default.post(`${baseUrl}/projects/${projectId}/merge_requests/${iid}/notes`, { body: comment }, {
        headers: { 'PRIVATE-TOKEN': token },
    });
}
exports.addComment = addComment;
