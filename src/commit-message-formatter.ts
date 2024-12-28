import { readFileSync, writeFileSync } from 'fs';
import process from 'process';
import { execSync } from "child_process";
import { cosmiconfig, defaultLoadersSync } from "cosmiconfig";
import { ISettingsConfig, TMessagePatternConfig } from "./types";
import { defaultSettingsConfig, MODULE_NAME, searchPlacesConfig, validateRegexConfig } from "./config";
import { formatCommitMessage, extractTaskId, createRegExp } from "./partials";

class CommitMessageFormatter {
  private readonly commitMessageFilePath: string;

  constructor() {
    this.commitMessageFilePath = process.argv[2];

    if (!this.commitMessageFilePath) {
      console.error('Error: Commit message file path is not provided.');
      process.exit(1);
    }
  }

  /** Метод для загрузки конфигурации */
  private async loadConfig(): Promise<ISettingsConfig> {
    const config = defaultSettingsConfig;
    const projectRoot = process.cwd();
    const explorer = cosmiconfig(MODULE_NAME, {
      searchStrategy: "global",
      searchPlaces: searchPlacesConfig,
      loaders: defaultLoadersSync,
    });
    const result = await explorer.search(projectRoot);

    if (result && result.config) {
      Object.assign(defaultSettingsConfig, result.config);
    }

    return config;
  }

  /** Метод для получения имени текущей ветки */
  private getBranchName(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD')
        .toString()
        .trim();
    } catch (error) {
      console.error('Error: Failed to get branch name:', (error as Record<string, string>).message);
      process.exit(1);
    }
  }

  /** Метод для получения текста коммита */
  private getCommitMessage(): string {
    try {
      return readFileSync(this.commitMessageFilePath, 'utf-8');
    } catch (error) {
      console.error('Error:', (error as Record<string, string>)?.message);
      process.exit(1);
    }
  }

  /** Проверка, содержит ли commitMessage в игноре */
  private hasCommitMessageIgnored(commitMessage: string, ignoredMessagePattern?: string): boolean {
    return ignoredMessagePattern
      ? createRegExp(ignoredMessagePattern, 'i').test(commitMessage)
      : false;
  };

  /** Валидация commitMessage */
  private hasValidCommitMessage(commitMessage: string, messagePattern?: TMessagePatternConfig): boolean{
    const validate = (messagePattern && validateRegexConfig[messagePattern]) || validateRegexConfig.default;
    return validate.test(commitMessage.toLowerCase());
  }

  /** Проверка, содержит ли ветка в taskId */
  private hasBranchContainTaskId(
    branchName: string,
    taskId?: string | null,
    isRequiredTaskIdInBranches?: boolean,
    ignoredBranchesPattern?: RegExp | string,
  ): boolean {
    const isIgnoreBranchName = ignoredBranchesPattern && createRegExp(ignoredBranchesPattern).test(branchName)
    if (!isRequiredTaskIdInBranches || isIgnoreBranchName) return true;

    return Boolean(taskId && createRegExp(taskId).test(branchName));
  }

  public async runCommitProcessing(): Promise<void> {
    console.log('SCRIPT START');

    const config = await this.loadConfig();
    const commitMessage = this.getCommitMessage();
    const branchName = this.getBranchName();
     const currentTaskId = extractTaskId(branchName, config?.taskManager);

    console.log("config", config);
    console.log("commitMessage", commitMessage);
    console.log("branchName", branchName);
    console.log("currentTaskId", currentTaskId);

    /** Проверка на игнор */
    if (this.hasCommitMessageIgnored(commitMessage, config?.ignoredMessagePattern)) {
      console.warn('Ignored this commit message:', commitMessage);
      process.exit(0);
    }

    /** Проверка валидности commitMessage */
    if (!this.hasValidCommitMessage(commitMessage, config?.messagePattern)) {
      console.error('Error: Invalid commit message:', commitMessage);
      process.exit(1);
    }

    /** Проверка есть ли в названии ветки taskId */
    if (!this.hasBranchContainTaskId(
      branchName,
      currentTaskId,
      config?.isRequiredTaskIdInBranches,
      config?.ignoredBranchesPattern
    )) {
      console.error(`Error: branch name not contain task id.`);
      process.exit(1);
    }

    /** Форматирование коммита, если есть currentTaskID */
    if (commitMessage && currentTaskId) {
      const newMessage = formatCommitMessage({
          commitMessage,
          taskId: currentTaskId,
          messagePattern: config?.messagePattern,
      });

      console.log('newMessage:', newMessage);
      writeFileSync(this.commitMessageFilePath, newMessage);
    }

    process.exit(0);
  }
}

export const runCommitProcessing = () => {
  return new CommitMessageFormatter().runCommitProcessing()
}
