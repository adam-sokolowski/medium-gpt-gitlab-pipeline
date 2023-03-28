# GPT code review
Automated GPT based code review. 
Script `codeReview` takes three parameters: `projectId`, `query` and `token` and can be used with any language

`- node dist/codeReview --projectId=${CI_PROJECT_ID} --query="${REVIEW_QUERY}" --token=${REVIEW_TOKEN}`

Where: CI_PROJECT_ID, REVIEW_QUERY and REVIEW_TOKEN are CI variables for the project.

Requires gitlab tokem with writing privileges.

## Reviewing script
Script executes three steps:
- retrieves all open merge requests in the given project (`projectId="..."`) using the gitlab token (`--token="..."`)
- builds a GPT prompt from a query and additional information included in `gpt-config.json`
- for each detected change in the merge request, runs a query (`--query="..."`) to GPT API and comments in the merge request.

Additional information, language and extra rules can included in optional `gpt-config.json` and will be included in thr GPT prompt.

## Custom JSON
JSON file the tool relies on can provide additional context for GPT.
Consists of two sections, first of which specifies language, framewort or simply the context, second, is a set of additional rules to consider.
Both sections become a part of GPT prompt. 

```
{
  "language": "TypeScript and JavaScript",
  "rules": [
    [ "object constants", "should have UPPER_SNAKE_CASE name with members in camelCase"],
    [ "functions", "should have a JSDoc format comment and return type"],
    [ "JSON files", "you should ignore changes" ]
  ]
}
```

File has to have a name `gpt-config.json` and be placed in the root folder of your project