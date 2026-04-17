import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { claudeCodeAdapter } from '../../src/cli/adapters/claude-code.js';

let rawInput: Record<string, unknown> | undefined;
let executeCalls = 0;
let handlerResult: Record<string, unknown> = {};

mock.module('../../src/cli/stdin-reader.js', () => ({
  readJsonFromStdin: () => Promise.resolve(rawInput),
}));

mock.module('../../src/cli/adapters/index.js', () => ({
  getPlatformAdapter: () => claudeCodeAdapter,
}));

mock.module('../../src/cli/handlers/index.js', () => ({
  getEventHandler: () => ({
    execute: async () => {
      executeCalls += 1;
      return handlerResult;
    },
  }),
}));

mock.module('../../src/shared/paths.js', () => ({
  OBSERVER_SESSIONS_DIR: '/tmp/observer-sessions',
}));

mock.module('../../src/utils/logger.js', () => ({
  logger: {
    debug: () => {},
    warn: () => {},
    error: () => {},
  },
}));

describe('observer hook guard', () => {
  let consoleLogSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    rawInput = undefined;
    executeCalls = 0;
    handlerResult = { continue: true, suppressOutput: true };
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    mock.restore();
  });

  it('short-circuits observation hooks before handler execution for observer cwd', async () => {
    rawInput = {
      sessionId: 'observer-session',
      cwd: '/tmp/observer-sessions/nested',
    };

    const { hookCommand } = await import('../../src/cli/hook-command.js');
    const exitCode = await hookCommand('claude-code', 'observation', { skipExit: true });

    expect(exitCode).toBe(0);
    expect(executeCalls).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({}));
  });

  it('returns an empty SessionStart payload for observer context hooks', async () => {
    rawInput = {
      sessionId: 'observer-session',
      cwd: '/tmp/observer-sessions',
    };

    const { hookCommand } = await import('../../src/cli/hook-command.js');
    const exitCode = await hookCommand('claude-code', 'context', { skipExit: true });

    expect(exitCode).toBe(0);
    expect(executeCalls).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: '',
        },
      }),
    );
  });

  it('still executes the real handler path for non-observer cwd', async () => {
    rawInput = {
      sessionId: 'normal-session',
      cwd: '/tmp/testbed',
    };

    const { hookCommand } = await import('../../src/cli/hook-command.js');
    const exitCode = await hookCommand('claude-code', 'observation', { skipExit: true });

    expect(exitCode).toBe(0);
    expect(executeCalls).toBe(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({}));
  });
});
