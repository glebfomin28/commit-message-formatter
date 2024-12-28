import { extractTaskId } from '../partials';
import {TTaskManagerConfig} from "../types";

describe('commit-message-formatter/partials/extractTaskId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return null if branchName is empty', () => {
    expect(extractTaskId('', 'jira')).toBeNull();
    expect(extractTaskId('features/some', 'jira')).toBeNull();
  });

  test('should return null if taskManager is empty', () => {
    expect(extractTaskId('features/DEV-123', undefined)).toBeNull();
    expect(extractTaskId('features/DEV-123', [])).toBeNull();
    expect(extractTaskId('features/DEV-123', '' as TTaskManagerConfig)).toBeNull();
    expect(extractTaskId('features/DEV-123', [null, '', 0, undefined, {}] as TTaskManagerConfig)).toBeNull();
  });


  test('should return taskId if branchName contains a valid taskId', () => {
    expect(extractTaskId('features/DEV-123-some-text', ['jira'])).toBe('DEV-123');
    expect(extractTaskId('features/DEV-123-some-text', 'jira')).toBe('DEV-123');
  });

  test('should return taskId for kaiten', () => {
    expect(extractTaskId('features/#123456/some', 'kaiten')).toBe('#123456');
  });

  test('should return taskId for gitHub', () => {
    expect(extractTaskId('features/#123456/some', 'gitHub')).toBe('#123456');
  });

  test('should return taskId for trello', () => {
    expect(
      extractTaskId('features/5e9f8bcd9e9f8bcd9e9f8bcd/some', 'trello')
    ).toBe('5e9f8bcd9e9f8bcd9e9f8bcd');
  });

  test('should return taskId for yandexTracker', () => {
    expect(extractTaskId('features/YT-101/some', 'yandexTracker')).toBe('YT-101');
  });

  test('should return taskId for youTrack', () => {
    expect(extractTaskId('features/YT-202/some', 'youTrack')).toBe('YT-202');
  });

  test('should return taskId if branchName contains a valid taskId from custom pattern', () => {
    expect(
      extractTaskId('features/TEST-111/some', { pattern: 'TEST-\\d+' })
    ).toBe('TEST-111');
  });

  test('should return taskId if branchName contains multiple valid taskIds', () => {
    expect(extractTaskId(
      'features/DEV-123/TEST-456',
      ['jira', { pattern: 'TEST-\\d+' }]
    )).toBe('DEV-123');

    expect(extractTaskId(
      'features/TEST-456/DEV-123',
      ['jira', { pattern: 'TEST-\\d+' }]
    )).toBe('TEST-456');

    expect(extractTaskId(
      'features/TEST-456/DEV-123',
      ['jira', { pattern: 'TEST-\\d+' }]
    )).toBe('TEST-456');

    expect(
      extractTaskId('features/DEV-123', [null, 'jira', null, undefined, {}] as TTaskManagerConfig)
    ).toBe('DEV-123');
  });
});
