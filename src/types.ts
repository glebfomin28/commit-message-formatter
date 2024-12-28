export type TTaskManager =
  | "kaiten"
  | "yandexTracker"
  | "jira"
  | "trello"
  | "youTrack"
  | "gitHub";

export interface ITaskCustom {
    name?: string;
    pattern: RegExp | string;
}

export type TTaskManagerItem = TTaskManager | ITaskCustom

export type TMessagePatternConfig =  string | "in-scope";

export type TTaskManagerConfig = TTaskManagerItem | Array<TTaskManagerItem>;

export interface ISettingsConfig {
    messagePattern?: TMessagePatternConfig;
    taskManager?: TTaskManagerConfig;
    ignoredMessagePattern?: string;
    ignoredBranchesPattern?: string;
    isRequiredTaskIdInBranches?: boolean;
}

// export type TTrackerPatterns = Array<TTracker | ITicketCustom>;
//
// export type TTicketRegexConfig = Record<TTracker, RegExp>
