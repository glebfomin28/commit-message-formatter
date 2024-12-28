import { ISettingsConfig, TMessagePatternConfig } from "./types";

export const MODULE_NAME = 'commit-message-formatter';

export const searchPlacesConfig = [
  'package.json',
  `${MODULE_NAME}.json`,
  `.${MODULE_NAME}rc.json`,
  `.${MODULE_NAME}rc.js`,
  `.${MODULE_NAME}rc.cjs`,
  `.${MODULE_NAME}rc.mjs`,
  `${MODULE_NAME}.config.js`,
  `${MODULE_NAME}.config.cjs`,
  `${MODULE_NAME}.config.mjs`,
];

export const ticketRegexConfig = {
  kaiten: /#[0-9]+/,
  gitHub: /#[0-9]+/,
  trello: /[0-9a-f]{24}/,
  jira: /[A-Z]+-[0-9]+/,
  yandexTracker: /[A-Z]+-[0-9]+/,
  youTrack: /[A-Z]+-[0-9]+/,
}

export const defaultSettingsConfig: ISettingsConfig = {
  messagePattern: '[$T] $M',
  taskManager: ['jira', 'kaiten', 'trello'],
  ignoredMessagePattern: '^mearge',
  isRequiredTaskIdInBranches: true,
  ignoredBranchesPattern: "^(master|main|dev|develop|development|release)$",
}

export const validateRegexConfig: Record<TMessagePatternConfig, RegExp> = {
  "default": /^(?!\s).+/,
  "in-scope": /^(?!\s)[A-Za-z]+(\([^()\s]*[^()\s]\))?(!)?: .+/,
}

export const formatScopeRegexConfig = {
  CONTAINS_SCOPE: /\(([^)]*)\)(!?):/,
  SCOPE_TYPE: /^[^(]+/,
  SCOPE_SUBJECT: /(!?):(.*)/,
  NO_SCOPE_TYPE_BEFORE_BREAKING_CHANGE: /!.*/,
  NO_SCOPE_TYPE: /:.*/,
  NO_SCOPE_SUBJECT: /.*: /,
};

