import { readFileSync, writeFileSync } from 'fs';
import process from 'process';
import { execSync } from "child_process";
import {formatCommitMessage, extractTaskId, createRegExp} from "../partials";
import { runCommitProcessing } from '../commit-message-formatter';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('cosmiconfig', () => ({
  cosmiconfig: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue({ config: {} }),
  })),
  defaultLoadersSync: {},
}));

jest.mock('../partials', () => ({
  formatCommitMessage: jest.fn(),
  extractTaskId: jest.fn(),
  createRegExp: jest.fn().mockImplementation((pattern, flags) => new RegExp(pattern, flags)),
}));

jest.mock('../config', () => ({
  MODULE_NAME: 'commit-message-formatter',
  defaultSettingsConfig: {
    messagePattern: '[$T] $M',
    taskManager: ['jira', 'youTrack', 'trello'],
    ignoredMessagePattern: '^mearge',
    isRequiredTaskIdInBranches: true,
    ignoredBranchesPattern: "^(master|main|dev|develop|development|release)$",
  },
  searchPlacesConfig: [],
  validateRegexConfig: {
    "default": /^(?!\s).+/,
    "in-scope": /^(?!\s)[A-Za-z]+(\([^()\s]*[^()\s]\))?(!)?: .+/,
  },
}));

describe('commit-message-formatter/runCommitProcessing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit called with code ${code}`);
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should load config and process commit message', async () => {
    (readFileSync as jest.Mock).mockReturnValue('feat: some message');
    (execSync as jest.Mock).mockReturnValue('features/DEV-123/some');
    (extractTaskId as jest.Mock).mockReturnValue('DEV-123');
    (formatCommitMessage as jest.Mock).mockReturnValue('[DEV-123] feat: some message');

    await expect(runCommitProcessing()).rejects.toThrow('process.exit called with code 0');

    expect(readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf-8');
    expect(execSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD');
    expect(formatCommitMessage).toHaveBeenCalledWith({
      commitMessage: 'feat: some message',
      taskId: 'DEV-123',
      messagePattern: '[$T] $M',
    });
    expect(writeFileSync).toHaveBeenCalledWith(expect.any(String), '[DEV-123] feat: some message');
  });

  test('should ignore commit message if it matches ignored pattern', async () => {
    (readFileSync as jest.Mock).mockReturnValue('Mearge feat: some message');
    (execSync as jest.Mock).mockReturnValue('master');
    (createRegExp as jest.Mock).mockReturnValueOnce(/^mearge/i);

    await expect(runCommitProcessing()).rejects.toThrow('process.exit called with code 0');

    expect(console.warn).toHaveBeenCalledWith('Ignored this commit message:', 'Mearge feat: some message');
  });

  test('should exit with error if commit message is invalid', async () => {
    (readFileSync as jest.Mock).mockReturnValue('  feat: some message');
    (execSync as jest.Mock).mockReturnValue('master');

    await expect(runCommitProcessing()).rejects.toThrow('process.exit called with code 1');

    expect(console.error).toHaveBeenCalledWith('Error: Invalid commit message:', '  feat: some message');
  });

  test('should exit with error if branch name does not contain task id', async () => {
    (readFileSync as jest.Mock).mockReturnValue('feat: some message');
    (execSync as jest.Mock).mockReturnValue('branch-name');
    (extractTaskId as jest.Mock).mockReturnValue(null);

    await expect(runCommitProcessing()).rejects.toThrow('process.exit called with code 1');

    expect(console.error).toHaveBeenCalledWith('Error: branch name not contain task id.');
  });
});
