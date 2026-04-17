/**
 * Summarize Handler - Stop
 *
 * Runs in the Stop hook (120s timeout, not capped like SessionEnd).
 * This is the ONLY place where we can reliably wait for async work.
 *
 * Flow:
 * 1. Run isolated summarize request on worker
 * 2. Call /api/sessions/complete to clean up session
 *
 * SessionEnd (1.5s cap from Claude Code) is just a lightweight fallback —
 * all real work must happen here in Stop.
 */

import type { EventHandler, NormalizedHookInput, HookResult } from '../types.js';
import { ensureWorkerRunning, workerHttpRequest } from '../../shared/worker-utils.js';
import { logger } from '../../utils/logger.js';
import { extractLastMessage } from '../../shared/transcript-parser.js';
import { HOOK_EXIT_CODES, HOOK_TIMEOUTS, getTimeout } from '../../shared/hook-constants.js';
import { normalizePlatformSource } from '../../shared/platform-source.js';

const SUMMARIZE_TIMEOUT_MS = getTimeout(HOOK_TIMEOUTS.DEFAULT);

export const summarizeHandler: EventHandler = {
  async execute(input: NormalizedHookInput): Promise<HookResult> {
    // Ensure worker is running before any other logic
    const workerReady = await ensureWorkerRunning();
    if (!workerReady) {
      // Worker not available - skip summary gracefully
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    const { sessionId, transcriptPath } = input;

    // Validate required fields before processing
    if (!transcriptPath) {
      // No transcript available - skip summary gracefully (not an error)
      logger.debug('HOOK', `No transcriptPath in Stop hook input for session ${sessionId} - skipping summary`);
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    // Extract last assistant message from transcript (the work Claude did)
    // Note: "user" messages in transcripts are mostly tool_results, not actual user input.
    // The user's original request is already stored in user_prompts table.
    let lastAssistantMessage = '';
    try {
      lastAssistantMessage = extractLastMessage(transcriptPath, 'assistant', true);
    } catch (err) {
      logger.warn('HOOK', `Stop hook: failed to extract last assistant message for session ${sessionId}: ${err instanceof Error ? err.message : err}`);
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    // Skip summary if transcript has no assistant message (prevents repeated
    // empty summarize requests that pollute logs — upstream bug)
    if (!lastAssistantMessage || !lastAssistantMessage.trim()) {
      logger.debug('HOOK', 'No assistant message in transcript - skipping summary', {
        sessionId,
        transcriptPath
      });
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    logger.dataIn('HOOK', 'Stop: Requesting summary', {
      hasLastAssistantMessage: !!lastAssistantMessage
    });

    const platformSource = normalizePlatformSource(input.platform);

    // 1. Run isolated summarize request — worker does the summary extraction synchronously.
    const response = await workerHttpRequest('/api/sessions/summarize-isolated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentSessionId: sessionId,
        last_assistant_message: lastAssistantMessage,
        platformSource
      }),
      timeoutMs: SUMMARIZE_TIMEOUT_MS
    });

    if (!response.ok) {
      return { continue: true, suppressOutput: true };
    }

    const payload = await response.json() as {
      status?: string;
      reason?: string;
      summaryStored?: boolean | null;
      summaryCount?: number;
    };

    if (payload.status === 'completed') {
      logger.info('HOOK', 'Isolated summary complete', {
        summaryStored: payload.summaryStored ?? null,
        summaryCount: payload.summaryCount ?? 0,
      });
      if (payload.summaryStored === false) {
        logger.warn('HOOK', 'Summary was not stored: LLM response likely lacked valid <summary> tags (#1633)', {
          sessionId,
        });
      }
    } else {
      logger.debug('HOOK', 'Isolated summary skipped', {
        sessionId,
        status: payload.status ?? 'unknown',
        reason: payload.reason ?? 'unspecified',
      });
    }

    // 2. Complete the session — clean up active sessions map.
    //    This runs here in Stop (120s timeout) instead of SessionEnd (1.5s cap)
    //    so it reliably fires after summary work is done.
    try {
      await workerHttpRequest('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentSessionId: sessionId }),
        timeoutMs: 10_000
      });
      logger.info('HOOK', 'Session completed in Stop hook', { contentSessionId: sessionId });
    } catch (err) {
      logger.warn('HOOK', `Stop hook: session-complete failed: ${err instanceof Error ? err.message : err}`);
    }

    return { continue: true, suppressOutput: true };
  }
};
