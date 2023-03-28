import axios from 'axios';

const baseUrl = 'https://gitlab.emobg.io/api/v4';

export function getOpenMergeRequests(projectId: number, token: string) {
  return axios.get(`${baseUrl}/projects/${projectId}/merge_requests?state=opened`, {
    headers: { 'PRIVATE-TOKEN': token },
  })
    .then(result => result.data)
    .catch(error => console.error(`Error fetching project Merge Requests: ${error}`));
}

export function getChanges(projectId: number, iid: number, token: string) {
  return axios.get(`${baseUrl}/projects/${projectId}/merge_requests/${iid}/changes`, {
    headers: { 'PRIVATE-TOKEN': token },
  })
    .then(result => result.data && result.data.changes)
    .catch(error => console.error(`Error fetching project Merge Request changes: ${error}`));
}

export function addComment(projectId: number, iid: number, comment: string, token: string) {
  return axios.post(`${baseUrl}/projects/${projectId}/merge_requests/${iid}/notes`, { body: comment }, {
    headers: { 'PRIVATE-TOKEN': token },
  });
}
