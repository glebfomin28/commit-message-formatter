import { TTaskManagerConfig, TTaskManagerItem } from "../types";
import { ticketRegexConfig } from "../config";
import { createRegExp } from "./utilities";

export class TaskIdExtractor {
  private normalizeTaskManagerList(taskManager?: TTaskManagerConfig): Array<TTaskManagerItem> {
    return Array.isArray(taskManager)
      ? taskManager
      : [taskManager].filter(Boolean) as Array<TTaskManagerItem>;
  }

  private getCurrentPatternList(taskManagerList: Array<TTaskManagerItem>): Array<RegExp> {
    const regExpList: Array<RegExp> = [];

    taskManagerList?.forEach((taskManager) => {
      if (typeof taskManager === "string" && ticketRegexConfig[taskManager]) {
        regExpList.push(ticketRegexConfig[taskManager]);
      }
      if (typeof taskManager === "object" && taskManager?.pattern) {
          regExpList.push(createRegExp(taskManager.pattern));
      }
    });
    return regExpList;
  }

  public extract(branchName: string, taskManager?: TTaskManagerConfig): string | null {
    const taskManagerList = this.normalizeTaskManagerList(taskManager);

    if (!branchName || !taskManagerList?.length) return null;

    const patternList = this.getCurrentPatternList(taskManagerList);

    for (const regex of patternList) {
      const match = branchName.match(regex);
      if (match && match[0]) {
        return match[0];
      }
    }

    return null;
  }
}

export const extractTaskId = (branchName: string, taskManager?: TTaskManagerConfig) => {
  return new TaskIdExtractor().extract(branchName, taskManager)
};
