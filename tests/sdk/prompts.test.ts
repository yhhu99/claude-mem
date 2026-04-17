import { describe, expect, it } from 'bun:test';

import { buildObservationPrompt, buildReplayObservationBatchPrompt } from '../../src/sdk/prompts.js';

describe('buildObservationPrompt', () => {
  it('instructs the observer to avoid prose skip responses', () => {
    const prompt = buildObservationPrompt({
      id: 1,
      tool_name: 'exec_command',
      tool_input: JSON.stringify({ cmd: 'pwd' }),
      tool_output: JSON.stringify({ output: '/repo' }),
      created_at_epoch: Date.now(),
      cwd: '/repo',
    });

    expect(prompt).toContain('Return either one or more <observation>...</observation> blocks, or an empty response');
    expect(prompt).toContain('Concrete debugging findings from logs, queue state, database rows, session routing, or code-path inspection');
    expect(prompt).toContain('Never reply with prose such as "Skipping", "No substantive tool executions"');
  });
});

describe('buildReplayObservationBatchPrompt', () => {
  it('forces replay materialization to emit observation XML only', () => {
    const prompt = buildReplayObservationBatchPrompt('testbed', 'Fix the failing test', [
      {
        tool_name: 'read_file',
        tool_input: { path: 'app.py' },
        tool_output: 'contents',
        cwd: '/workspace/testbed',
      },
    ]);

    expect(prompt).toContain('REPLAY MATERIALIZATION: OBSERVATION EXTRACTION');
    expect(prompt).toContain('Do NOT output <summary> tags');
    expect(prompt).toContain('Never reply with prose such as "Skipping"');
    expect(prompt).toContain('<replayed_primary_session_tool_events>');
    expect(prompt).toContain('<tool_name>read_file</tool_name>');
  });
});
