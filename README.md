# commit-message-formatter

The `commit-message-formatter` library is designed to format commit messages based on predefined patterns and task IDs extracted from branch names. 
It ensures that commit messages are consistent and informative, making it easier to track changes and understand the context of each commit. 
This library is particularly useful when used in conjunction with `husky` for Git hooks and optionally with `commitlint` for linting commit messages.

## Installation
To install the commit message formatter, follow these steps:

1. Install the required packages:
```sh
npm install commit-message-formatter husky @commitlint/config-conventional @commitlint/cli --save-dev
```

2. Initialize Husky in your project:
```sh
npx husky
```
 
3. Configure commitlint to use conventional config
- create `.commitlintrc.cjs`
- add `module.exports = { extends: ['@commitlint/config-conventional'] };`

4. Add a commit message hook to format the commit message:

- Create a file named `commit-msg` in the `.husky` directory. 
- Add the following content to the commit-msg file: `npx commit-message-formatter $1`

5. Add a prepare commit message hook to lint the commit message:
- Create a file named `prepare-commit-msg` in the `.husky` directory.
- Add the following content to the prepare-commit-msg file: `npx --no-install commitlint --edit`

## Configuration

The `commit-message-formatter` can be configured using a configuration file. The following configuration file formats are supported:

- `package.json`
- `commit-message-formatter.json`
- `.commit-message-formatterrc.json`
- `.commit-message-formatterrc.js`
- `.commit-message-formatterrc.cjs`
- `.commit-message-formatterrc.mjs`
- `commit-message-formatter.config.js`
- `commit-message-formatter.config.cjs`
- `commit-message-formatter.config.mjs`

### Example Configuration File

Here is an example configuration file:

```javascript
// .commit-message-formatterrc.js
/** @type {import('commit-message-formatter/src/types.ts').ISettingsConfig} */
module.exports = {
  messagePattern: '[$T] $M',
  taskManager: 'jira',
  ignoredMessagePattern: '^mearge',
}
```

## Configuration Options

### 1. Option `messagePattern`
#### 1.1 Placeholders `$T $M`

- `$T` is the task ID extracted from the branch name.
- `$M` is the commit message.

Example:
```javascript
module.exports = {
  messagePattern: "[$T] $M"
}
```
      
If the branch name is `feat/DEV-123` and the commit message is `Add new feature`, the formatted commit message will be `[DEV-123] Add new feature`.

### 1.2 `"in-scope"`

This format includes the task id within the scope of the branch name.

Examples:
```javascript
module.exports = {
  messagePattern: "in-scope"
}
```

Results:
```
feat(shared): Add new feature => feat(DEV-123/shared): Add new feature
feat!: Add new feature => feat(DEV-123)!: Add new feature
feat(scope): Add new feature => feat(DEV-123/scope): Add new feature
feat(scope)!: Add new feature => feat(DEV-123/scope)!: Add new feature
```
      

### 2. Option `taskManager`

The taskManager option specifies the task id patterns to extract from the branch name. The following formats are supported:

| Tracker         | Pattern           | Example                  |
|-----------------|-------------------|--------------------------|
| `kaiten`        | `/#[0-9]+/`       | #123                     |
| `gitHub`        | `/#[0-9]+/`       | #456                     |
| `trello`        | `/[0-9a-f]{24}/`  | 5d5d5d5d5d5d5d5d5d5d5d5d |
| `jira`          | `/[A-Z]+-[0-9]+/` | JIRA-123                 |
| `yandexTracker` | `/[A-Z]+-[0-9]+/` | YT-456                   |
| `youTrack`      | `/[A-Z]+-[0-9]+/` | YT-789                   |


You can also specify custom tracker patterns.

Example:
```javascript
module.exports = {
  taskManager: [
    { 
      name: "customTracker",
      pattern: /CUSTOM-[0-9]+/ 
    }
  ]
}
```

### 3. Option `ignoredMessagePattern`

The ignore option specifies an array of regex patterns to ignore certain commit messages.

```javascript
module.exports = {
  ignoredMessagePattern: "^(merge|WIP)"
}
```

### 4. Option `isRequiredTaskIdInBranches`
The `isRequiredTaskIdInBranches` option specifies whether the task ID is required in the branch names.
If set to `true`, the commit message will be ignored if the branch name does not contain a valid task id.

### 5. Option `ignoredBranchesPattern`
The `ignoredBranchesPattern` option specifies a regex pattern to ignore certain branches. If a branch name matches this pattern, the commit message will be ignored.

```javascript
module.exports = {
  ignoredBranchesPattern: "^(main|master)$"
}
```

### Default configuration
```javascript
module.exports = {
  messagePattern: '[$T] $M',
  taskManager: ['jira', 'youTrack', 'trello'],
  ignoredMessagePattern: '^mearge',
  isRequiredTaskIdInBranches: true,
  ignoredBranchesPattern: "^(master|main|dev|develop|development|release)$",
}
```

