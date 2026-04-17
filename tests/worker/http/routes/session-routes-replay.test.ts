import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { Request, Response } from 'express';

import { logger } from '../../../../src/utils/logger.js';
import { SettingsDefaultsManager } from '../../../../src/shared/SettingsDefaultsManager.js';
import { PrivacyCheckValidator } from '../../../../src/services/worker/validation/PrivacyCheckValidator.js';
import { SessionRoutes } from '../../../../src/services/worker/http/routes/SessionRoutes.js';

function createMockReqRes({
  body = {},
  query = {},
  params = {},
}: {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
}) {
  const jsonSpy = mock(() => {});
  const statusSpy = mock(() => ({ json: jsonSpy }));
  return {
    req: {
      body,
      query,
      params,
      path: '/test',
    } as Partial<Request>,
    res: {
      json: jsonSpy,
      status: statusSpy,
      headersSent: false,
    } as unknown as Partial<Response>,
    jsonSpy,
    statusSpy,
  };
}

describe('SessionRoutes replay controls', () => {
  let loggerSpies: ReturnType<typeof spyOn>[] = [];
  let settingsSpy: ReturnType<typeof spyOn>;
  let privacySpy: ReturnType<typeof spyOn>;

  let queueObservation: ReturnType<typeof mock>;
  let queueSummarize: ReturnType<typeof mock>;
  let getSession: ReturnType<typeof mock>;
  let getPendingCount: ReturnType<typeof mock>;

  let createSDKSession: ReturnType<typeof mock>;
  let getSessionById: ReturnType<typeof mock>;
  let getPromptNumberFromUserPrompts: ReturnType<typeof mock>;
  let saveUserPrompt: ReturnType<typeof mock>;
  let getSessionByContentSessionId: ReturnType<typeof mock>;
  let getLatestUserPrompt: ReturnType<typeof mock>;
  let countObservationsByMemorySessionId: ReturnType<typeof mock>;
  let countSummariesByMemorySessionId: ReturnType<typeof mock>;
  let hasSummaryForPrompt: ReturnType<typeof mock>;

  let ensureGeneratorRunning: ReturnType<typeof mock>;
  let routes: SessionRoutes;
  let handlers: Record<string, (req: Request, res: Response) => void>;

  beforeEach(() => {
    loggerSpies = [
      spyOn(logger, 'info').mockImplementation(() => {}),
      spyOn(logger, 'debug').mockImplementation(() => {}),
      spyOn(logger, 'warn').mockImplementation(() => {}),
      spyOn(logger, 'error').mockImplementation(() => {}),
      spyOn(logger, 'failure').mockImplementation(() => {}),
    ];
    settingsSpy = spyOn(SettingsDefaultsManager, 'loadFromFile').mockReturnValue({
      CLAUDE_MEM_SKIP_TOOLS: '',
    } as any);
    privacySpy = spyOn(
      PrivacyCheckValidator,
      'checkUserPromptPrivacy',
    ).mockReturnValue('user prompt');

    queueObservation = mock(() => {});
    queueSummarize = mock(() => {});
    getSession = mock(() => undefined);
    getPendingCount = mock(() => 0);

    createSDKSession = mock(() => 7);
    getSessionById = mock(() => ({
      id: 7,
      content_session_id: 'content-1',
      memory_session_id: null,
      project: 'testbed',
      platform_source: 'claude',
      user_prompt: 'prompt',
      custom_title: null,
    }));
    getPromptNumberFromUserPrompts = mock(() => 0);
    saveUserPrompt = mock(() => 1);
    getSessionByContentSessionId = mock(() => null);
    getLatestUserPrompt = mock(() => undefined);
    countObservationsByMemorySessionId = mock(() => 0);
    countSummariesByMemorySessionId = mock(() => 0);
    hasSummaryForPrompt = mock(() => false);

    const sessionManager = {
      getSession,
      queueObservation,
      queueSummarize,
      getPendingMessageStore: () => ({
        getPendingCount,
      }),
    };
    const sessionStore = {
      createSDKSession,
      getSessionById,
      getPromptNumberFromUserPrompts,
      saveUserPrompt,
      getSessionByContentSessionId,
      getLatestUserPrompt,
      countObservationsByMemorySessionId,
      countSummariesByMemorySessionId,
      hasSummaryForPrompt,
    };
    const dbManager = {
      getSessionStore: () => sessionStore,
    };
    const eventBroadcaster = {
      broadcastObservationQueued: mock(() => {}),
      broadcastSummarizeQueued: mock(() => {}),
      broadcastSessionStarted: mock(() => {}),
      broadcastSessionCompleted: mock(() => {}),
    };

    routes = new SessionRoutes(
      sessionManager as any,
      dbManager as any,
      {} as any,
      {} as any,
      {} as any,
      eventBroadcaster as any,
      {} as any,
    );
    ensureGeneratorRunning = mock(() => {});
    (routes as any).ensureGeneratorRunning = ensureGeneratorRunning;

    handlers = {};
    routes.setupRoutes({
      get: mock((path: string, fn: any) => {
        handlers[`GET ${path}`] = fn;
      }),
      post: mock((path: string, fn: any) => {
        handlers[`POST ${path}`] = fn;
      }),
      delete: mock(() => {}),
    } as any);
  });

  afterEach(() => {
    for (const spy of loggerSpies) spy.mockRestore();
    settingsSpy.mockRestore();
    privacySpy.mockRestore();
    mock.restore();
  });

  it('keeps /api/sessions/init as persistent-state setup during deferred replay', () => {
    const { req, res, jsonSpy } = createMockReqRes({
      body: {
        contentSessionId: 'content-1',
        project: 'testbed',
        prompt: 'Repository: owner/repo',
        deferProcessing: true,
      },
    });

    handlers['POST /api/sessions/init'](req as Request, res as Response);

    expect(createSDKSession).toHaveBeenCalledWith(
      'content-1',
      'testbed',
      'Repository: owner/repo',
      undefined,
      'claude',
    );
    expect(saveUserPrompt).toHaveBeenCalledWith(
      'content-1',
      1,
      'Repository: owner/repo',
    );
    expect(ensureGeneratorRunning).not.toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith({
      sessionDbId: 7,
      promptNumber: 1,
      skipped: false,
      contextInjected: false,
    });
  });

  it('queues observations without auto-start when deferProcessing is true', () => {
    const { req, res, jsonSpy } = createMockReqRes({
      body: {
        contentSessionId: 'content-1',
        tool_name: 'read_file',
        tool_input: { path: 'foo.py' },
        tool_response: 'contents',
        cwd: '/workspace/testbed',
        deferProcessing: true,
      },
    });

    handlers['POST /api/sessions/observations'](req as Request, res as Response);

    expect(queueObservation).toHaveBeenCalled();
    expect(ensureGeneratorRunning).not.toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith({ status: 'queued' });
  });

  it('preserves normal observation auto-start when deferProcessing is absent', () => {
    const { req, res } = createMockReqRes({
      body: {
        contentSessionId: 'content-1',
        tool_name: 'read_file',
        tool_input: { path: 'foo.py' },
        tool_response: 'contents',
        cwd: '/workspace/testbed',
      },
    });

    handlers['POST /api/sessions/observations'](req as Request, res as Response);

    expect(queueObservation).toHaveBeenCalled();
    expect(ensureGeneratorRunning).toHaveBeenCalledWith(7, 'observation');
  });

  it('queues summarize without auto-start when deferProcessing is true', () => {
    const { req, res, jsonSpy } = createMockReqRes({
      body: {
        contentSessionId: 'content-1',
        last_assistant_message: 'summary',
        deferProcessing: true,
      },
    });

    handlers['POST /api/sessions/summarize'](req as Request, res as Response);

    expect(queueSummarize).toHaveBeenCalledWith(7, 'summary');
    expect(ensureGeneratorRunning).not.toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith({ status: 'queued' });
  });

  it('preserves normal summarize auto-start when deferProcessing is absent', () => {
    const { req, res } = createMockReqRes({
      body: {
        contentSessionId: 'content-1',
        last_assistant_message: 'summary',
      },
    });

    handlers['POST /api/sessions/summarize'](req as Request, res as Response);

    expect(queueSummarize).toHaveBeenCalledWith(7, 'summary');
    expect(ensureGeneratorRunning).toHaveBeenCalledWith(7, 'summarize');
  });

  it('returns DB-backed materialization counts when session is no longer active in memory', () => {
    getSessionByContentSessionId.mockReturnValue({
      id: 7,
      content_session_id: 'content-1',
      memory_session_id: 'memory-1',
      project: 'testbed',
      status: 'active',
      started_at_epoch: 1000,
    });
    getPendingCount.mockReturnValue(0);
    countObservationsByMemorySessionId.mockReturnValue(2);
    countSummariesByMemorySessionId.mockReturnValue(1);
    getLatestUserPrompt.mockReturnValue({
      prompt_number: 3,
    });
    hasSummaryForPrompt.mockReturnValue(true);

    const { req, res, jsonSpy } = createMockReqRes({
      query: {
        contentSessionId: 'content-1',
      },
    });

    handlers['GET /api/sessions/status'](req as Request, res as Response);

    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
        activeInMemory: false,
        sessionDbId: 7,
        project: 'testbed',
        memorySessionId: 'memory-1',
        queueLength: 0,
        observationCount: 2,
        summaryCount: 1,
        summaryStored: true,
      }),
    );
  });

  it('does not report summaryStored from an older prompt after the active session is gone', () => {
    getSessionByContentSessionId.mockReturnValue({
      id: 7,
      content_session_id: 'content-1',
      memory_session_id: 'memory-1',
      project: 'testbed',
      status: 'completed',
      started_at_epoch: 1000,
    });
    getPendingCount.mockReturnValue(0);
    countObservationsByMemorySessionId.mockReturnValue(2);
    countSummariesByMemorySessionId.mockReturnValue(1);
    getLatestUserPrompt.mockReturnValue({
      prompt_number: 4,
    });
    hasSummaryForPrompt.mockReturnValue(false);

    const { req, res, jsonSpy } = createMockReqRes({
      query: {
        contentSessionId: 'content-1',
      },
    });

    handlers['GET /api/sessions/status'](req as Request, res as Response);

    expect(hasSummaryForPrompt).toHaveBeenCalledWith('memory-1', 4);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        activeInMemory: false,
        summaryCount: 1,
        summaryStored: false,
      }),
    );
  });
});
