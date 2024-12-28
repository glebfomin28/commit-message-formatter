import { TMessagePatternConfig } from "../types";
import { formatScopeRegexConfig } from "../config";

export interface IFormatCommitMessage {
  commitMessage: string;
  taskId: string;
  messagePattern?: TMessagePatternConfig;
}

class PatternFormatter {
  commitMessage: string;
  taskId: string;
  messagePattern: TMessagePatternConfig;

  constructor(
    commitMessage: string,
    taskId: string,
    messagePattern: TMessagePatternConfig = ''
  ) {
    this.commitMessage = commitMessage;
    this.taskId = taskId;
    this.messagePattern = messagePattern;
  }

  private hasContainTaskId() {
    return new RegExp(this.taskId, 'i').test(this.commitMessage);
  }

  private hasValidPlaceholders(): boolean {
    const tCount = (this.messagePattern.match(/\$T/g) || []).length;
    const mCount = (this.messagePattern.match(/\$M/g) || []).length;

    return tCount === 1 && mCount === 1;
  }

  private replacePlaceholders(): string {
    if (this.hasContainTaskId() || !this.hasValidPlaceholders()) {
      return this.commitMessage;
    }

    return this.messagePattern
      .replace("$T", this.taskId)
      .replace("$M", this.commitMessage.trim())
      .trim();
  }

  private formattedWithScope(scopeContent: string): string {
    const typeMatch = this.commitMessage.match(formatScopeRegexConfig.SCOPE_TYPE);
    const subjectMatch = this.commitMessage.match(formatScopeRegexConfig.SCOPE_SUBJECT);
    const type = typeMatch?.[0].trim();
    const subject = subjectMatch?.[0].trim();

    if (!type || !subject) return this.commitMessage;

    return `${type}(${this.taskId}/${scopeContent})${subject}`;
  };

  private formattedWithoutScope(): string {
    const type = this.commitMessage.replace(formatScopeRegexConfig.NO_SCOPE_TYPE, '').trim();
    const subject = this.commitMessage.replace(formatScopeRegexConfig.NO_SCOPE_SUBJECT, '').trim();

    if (this.commitMessage.includes('!:')) {
      const typeForBreakingChange = this.commitMessage.replace(formatScopeRegexConfig.NO_SCOPE_TYPE_BEFORE_BREAKING_CHANGE, '').trim();
      return `${typeForBreakingChange}(${this.taskId})!: ${subject}`;
    }

    return `${type}(${this.taskId}): ${subject}`;
  };

  private formatInScope(): string {
    if (this.hasContainTaskId()) {
      return this.commitMessage;
    }

    const scopeContentMatch = this.commitMessage.match(formatScopeRegexConfig.CONTAINS_SCOPE);
    const scopeContent = scopeContentMatch ? scopeContentMatch[1] : null;

    return scopeContent
      ? this.formattedWithScope(scopeContent)
      : this.formattedWithoutScope();
  }

  public format(): string {
    if (this.messagePattern === "in-scope") {
      return this.formatInScope()
    }
    return this.replacePlaceholders();
  }
}

export const formatCommitMessage = ({ messagePattern, taskId, commitMessage }: IFormatCommitMessage ): string => {
  const formatter = new PatternFormatter(commitMessage, taskId, messagePattern);
  return formatter.format();
};
