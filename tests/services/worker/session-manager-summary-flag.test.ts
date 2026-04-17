import { describe, expect, it, mock } from 'bun:test';

import type { ActiveSession } from '../../../src/services/worker-types.js';
import { SessionManager } from '../../../src/services/worker/SessionManager.js';

describe('SessionManager summarize status tracking', () => {
  it('resets lastSummaryStored when a new summarize request is queued', () => {
    const session = {
      sessionDbId: 7,
      contentSessionId: 'content-1',
      memorySessionId: 'memory-1',
      project: 'testbed',
      platformSource: 'claude',
      userPrompt: 'prompt',
      pendingMessages: [],
      abortController: new AbortController(),
      generatorPromise: null,
      lastPromptNumber: 1,
      startTime: Date.now(),
      cumulativeInputTokens: 0,
      cumulativeOutputTokens: 0,
      earliestPendingTimestamp: null,
      conversationHistory: [],
      currentProvider: null,
      consecutiveRestarts: 0,
      lastGeneratorActivity: Date.now(),
      processingMessageIds: [],
      lastSummaryStored: true,
    } satisfies ActiveSession;

    const emit = mock(() => {});
    const enqueue = mock(() => 101);
    const getPendingCount = mock(() => 1);

    SessionManager.prototype.queueSummarize.call(
      {
        sessions: new Map([[7, session]]),
        initializeSession: mock(() => session),
        getPendingStore: () => ({
          enqueue,
          getPendingCount,
        }),
        sessionQueues: new Map([[7, { emit }]]),
      },
      7,
      'assistant summary',
    );

    expect(enqueue).toHaveBeenCalledWith(
      7,
      'content-1',
      expect.objectContaining({
        type: 'summarize',
        last_assistant_message: 'assistant summary',
      }),
    );
    expect(session.lastSummaryStored).toBe(false);
    expect(emit).toHaveBeenCalledWith('message');
  });
});
