/**
 * Tests for SessionStore in-memory database operations
 *
 * Mock Justification: NONE (0% mock code)
 * - Uses real SQLite with ':memory:' - tests actual SQL and schema
 * - All CRUD operations are tested against real database behavior
 * - Timestamp handling and FK relationships are validated
 *
 * Value: Validates core persistence layer without filesystem dependencies
 */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SessionStore } from '../src/services/sqlite/SessionStore.js';

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore(':memory:');
  });

  afterEach(() => {
    store.close();
  });

  it('should correctly count user prompts', () => {
    const claudeId = 'claude-session-1';
    store.createSDKSession(claudeId, 'test-project', 'initial prompt');
    
    // Should be 0 initially
    expect(store.getPromptNumberFromUserPrompts(claudeId)).toBe(0);

    // Save prompt 1
    store.saveUserPrompt(claudeId, 1, 'First prompt');
    expect(store.getPromptNumberFromUserPrompts(claudeId)).toBe(1);

    // Save prompt 2
    store.saveUserPrompt(claudeId, 2, 'Second prompt');
    expect(store.getPromptNumberFromUserPrompts(claudeId)).toBe(2);

    // Save prompt for another session
    store.createSDKSession('claude-session-2', 'test-project', 'initial prompt');
    store.saveUserPrompt('claude-session-2', 1, 'Other prompt');
    expect(store.getPromptNumberFromUserPrompts(claudeId)).toBe(2);
  });

  it('should store observation with timestamp override', () => {
    const claudeId = 'claude-sess-obs';
    const memoryId = 'memory-sess-obs';
    const sdkId = store.createSDKSession(claudeId, 'test-project', 'initial prompt');

    // Set the memory_session_id before storing observations
    // createSDKSession now initializes memory_session_id = NULL
    store.updateMemorySessionId(sdkId, memoryId);

    const obs = {
      type: 'discovery',
      title: 'Test Obs',
      subtitle: null,
      facts: [],
      narrative: 'Testing',
      concepts: [],
      files_read: [],
      files_modified: []
    };

    const pastTimestamp = 1600000000000; // Some time in the past

    const result = store.storeObservation(
      memoryId, // Use memorySessionId for FK reference
      'test-project',
      obs,
      1,
      0,
      pastTimestamp
    );

    expect(result.createdAtEpoch).toBe(pastTimestamp);

    const stored = store.getObservationById(result.id);
    expect(stored).not.toBeNull();
    expect(stored?.created_at_epoch).toBe(pastTimestamp);

    // Verify ISO string matches
    expect(new Date(stored!.created_at).getTime()).toBe(pastTimestamp);
  });

  it('should store summary with timestamp override', () => {
    const claudeId = 'claude-sess-sum';
    const memoryId = 'memory-sess-sum';
    const sdkId = store.createSDKSession(claudeId, 'test-project', 'initial prompt');

    // Set the memory_session_id before storing summaries
    store.updateMemorySessionId(sdkId, memoryId);

    const summary = {
      request: 'Do something',
      investigated: 'Stuff',
      learned: 'Things',
      completed: 'Done',
      next_steps: 'More',
      notes: null
    };

    const pastTimestamp = 1650000000000;

    const result = store.storeSummary(
      memoryId, // Use memorySessionId for FK reference
      'test-project',
      summary,
      1,
      0,
      pastTimestamp
    );

    expect(result.createdAtEpoch).toBe(pastTimestamp);

    const stored = store.getSummaryForSession(memoryId);
    expect(stored).not.toBeNull();
    expect(stored?.created_at_epoch).toBe(pastTimestamp);
  });

  it('should preserve imported row ids when requested', () => {
    const session = store.importSdkSession({
      id: 101,
      content_session_id: 'import-content-1',
      memory_session_id: 'import-memory-1',
      project: 'testbed',
      platform_source: 'claude',
      user_prompt: 'Fix the issue',
      started_at: '2026-04-23T00:00:00.000Z',
      started_at_epoch: 1,
      completed_at: null,
      completed_at_epoch: null,
      status: 'completed',
    }, { preserveId: true });
    expect(session.id).toBe(101);

    const observation = store.importObservation({
      id: 202,
      memory_session_id: 'import-memory-1',
      project: 'testbed',
      text: null,
      type: 'discovery',
      title: 'Preserved observation',
      subtitle: null,
      facts: null,
      narrative: 'Useful historical context',
      concepts: null,
      files_read: null,
      files_modified: null,
      prompt_number: 1,
      discovery_tokens: 10,
      created_at: '2026-04-23T00:00:01.000Z',
      created_at_epoch: 2,
    }, { preserveId: true });
    expect(observation.id).toBe(202);

    const summary = store.importSessionSummary({
      id: 303,
      memory_session_id: 'import-memory-1',
      project: 'testbed',
      request: 'Fix the issue',
      investigated: null,
      learned: null,
      completed: null,
      next_steps: null,
      files_read: null,
      files_edited: null,
      notes: null,
      prompt_number: 1,
      discovery_tokens: 20,
      created_at: '2026-04-23T00:00:02.000Z',
      created_at_epoch: 3,
    }, { preserveId: true });
    expect(summary.id).toBe(303);

    const prompt = store.importUserPrompt({
      id: 404,
      content_session_id: 'import-content-1',
      prompt_number: 1,
      prompt_text: 'Fix the issue',
      created_at: '2026-04-23T00:00:03.000Z',
      created_at_epoch: 4,
    }, { preserveId: true });
    expect(prompt.id).toBe(404);
  });

  it('should reject preserve id conflicts during import', () => {
    store.importSdkSession({
      id: 101,
      content_session_id: 'import-content-1',
      memory_session_id: 'import-memory-1',
      project: 'testbed',
      platform_source: 'claude',
      user_prompt: 'Fix the issue',
      started_at: '2026-04-23T00:00:00.000Z',
      started_at_epoch: 1,
      completed_at: null,
      completed_at_epoch: null,
      status: 'completed',
    }, { preserveId: true });

    expect(() => store.importSdkSession({
      id: 102,
      content_session_id: 'import-content-1',
      memory_session_id: 'import-memory-1',
      project: 'testbed',
      platform_source: 'claude',
      user_prompt: 'Fix the issue',
      started_at: '2026-04-23T00:00:00.000Z',
      started_at_epoch: 1,
      completed_at: null,
      completed_at_epoch: null,
      status: 'completed',
    }, { preserveId: true })).toThrow(/Cannot preserve sdk_sessions id 102/);
  });
});
