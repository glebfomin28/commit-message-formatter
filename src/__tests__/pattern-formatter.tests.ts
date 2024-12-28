import { formatCommitMessage } from '../partials';
import { IFormatCommitMessage } from "../partials/pattern-formatter";

const initParams = {
  commitMessage: 'feat: message',
  taskId: 'DEV-123',
  messagePattern: '[$T] $M'
}

const setup = (params: Partial<IFormatCommitMessage> = {}) => (
  formatCommitMessage({ ...initParams, ...params })
);

describe('commit-message-formatter/partials/formatCommitMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })
  afterEach(() => {
    jest.clearAllMocks();
  })

  test('should return the commit message if taskId is already in commitMessage', () => {
    const result = setup({ commitMessage: 'feat: DEV-123 message' });
    expect(result).toBe('feat: DEV-123 message');
  });

  test('should replace $T and $M with taskId and commitMessage if valid placeholders', () => {
    expect(setup({ messagePattern: '[$T] $M' })).toBe('[DEV-123] feat: message');
    expect(setup({ messagePattern: '$M [$T]' })).toBe('feat: message [DEV-123]');
    expect(setup({ messagePattern: '--$T--$M--' })).toBe('--DEV-123--feat: message--');
  });

  test('should return commitMessage if placeholders are not valid', () => {
    expect(setup({ messagePattern: '$T $M $T' })).toBe('feat: message');
    expect(setup({ messagePattern: '$T $M $M' })).toBe('feat: message');
    expect(setup({ messagePattern: '$T' })).toBe('feat: message');
    expect(setup({ messagePattern: '$M' })).toBe('feat: message');
  });

  test('should format message with scope if messagePattern is "in-scope"', () => {
    expect(setup({
      commitMessage: 'feat: message',
      messagePattern: 'in-scope',
    })).toBe('feat(DEV-123): message');

    expect(setup({
      commitMessage: 'feat!: message',
      messagePattern: 'in-scope',
    })).toBe('feat(DEV-123)!: message');

    expect(setup({
      commitMessage: 'feat(scope): message',
      messagePattern: 'in-scope',
    })).toBe('feat(DEV-123/scope): message');

    expect(setup({
      commitMessage: 'feat(scope)!: message',
      messagePattern: 'in-scope',
    })).toBe('feat(DEV-123/scope)!: message');
  });
});

