import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapstoneState, sanitizeCapstoneState, capstoneReducer, assessDecision, assessCapstone, CAPSTONE_SOURCE_IDS, MAX_DRAFT_LENGTH } from './capstone-state.mjs';
import { createCapstoneReceipt } from './capstone.mjs';

const answers = { source: 'confirmed', availability: 'candidate', repair: 'replace', scope: 'proceed' };
const dispatch = (state, type, id, value) => capstoneReducer(state, { type, id, value });
function inspect(state = createCapstoneState()) {
  return CAPSTONE_SOURCE_IDS.reduce((current, id) => dispatch(current, 'open-source', id), state);
}
function complete() {
  let state = inspect();
  for (const [id, choice] of Object.entries(answers)) {
    state = dispatch(state, 'choose', id, choice);
    state = dispatch(state, 'check', id);
  }
  return state;
}

test('a guessed correct choice cannot pass without the required records and an explicit check', () => {
  let state = dispatch(createCapstoneState(), 'choose', 'availability', 'candidate');
  state = dispatch(state, 'check', 'availability');
  assert.deepEqual(assessDecision(state, 'availability'), { ok: false, kind: 'inspect-sources', missingSources: ['brief', 'rooms'] });
  assert.equal(assessCapstone(state).checked, 0);
  state = inspect(state);
  assert.equal(assessDecision(state, 'availability').ok, true);
  assert.equal(assessCapstone(state).checked, 0, 'opening records alone must not validate an earlier answer');
  state = dispatch(state, 'check', 'availability');
  assert.equal(assessCapstone(state).checked, 1);
});

test('a wrong choice gives a specific error code and can be corrected without resetting the task', () => {
  let state = inspect();
  state = dispatch(state, 'choose', 'source', 'latest');
  state = dispatch(state, 'check', 'source');
  assert.equal(assessDecision(state, 'source').kind, 'latest');
  assert.equal(assessCapstone(state).checked, 0);
  state = dispatch(state, 'choose', 'source', 'confirmed');
  assert.equal(state.submitted.includes('source'), false);
  state = dispatch(state, 'check', 'source');
  assert.equal(assessCapstone(state).checked, 1);
  assert.equal(state.opened.length, 4);
});

test('all four objective checks complete without requiring learner prose or a self-assessment', () => {
  const state = complete();
  assert.deepEqual(assessCapstone(state), {
    complete: true, checked: 4, total: 4, selfReviewed: false,
    decisions: { source: true, availability: true, repair: true, scope: true },
  });
  assert.equal(state.draft, '');
  assert.equal(createCapstoneReceipt(createCapstoneState()), '');
  assert.match(createCapstoneReceipt(state), /Objective decisions checked: 4\/4/);
  assert.match(createCapstoneReceipt(state), /No draft entered/);
});

test('changing a passed choice invalidates completion and hides the completion receipt until rechecked', () => {
  const original = complete();
  let state = dispatch(original, 'choose', 'scope', 'send');
  assert.equal(assessCapstone(state).complete, false);
  assert.equal(assessCapstone(state).checked, 3);
  assert.equal(createCapstoneReceipt(state), '');
  state = dispatch(state, 'choose', 'scope', 'proceed');
  assert.equal(assessCapstone(state).complete, false);
  state = dispatch(state, 'check', 'scope');
  assert.equal(assessCapstone(state).complete, true);
  assert.equal(assessCapstone(original).complete, true, 'the reducer must not mutate its input');
});

test('reopening an inspected source preserves a completed decision', () => {
  const state = complete();
  assert.deepEqual(dispatch(state, 'open-source', 'brief'), state);
});

test('self-review is optional, cannot apply to blank text, and resets whenever the draft changes', () => {
  let state = complete();
  state = dispatch(state, 'self-review', undefined, true);
  assert.equal(state.selfReviewed, false);
  state = dispatch(state, 'draft', undefined, '101 is a candidate; availability is unverified.');
  state = dispatch(state, 'self-review', undefined, true);
  assert.equal(state.selfReviewed, true);
  assert.match(createCapstoneReceipt(state), /marked reviewed by learner/);
  assert.match(createCapstoneReceipt(state), /has not been automatically validated/);
  state = dispatch(state, 'draft', undefined, 'Unverified and not booked.');
  assert.equal(state.selfReviewed, false);
  assert.equal(assessCapstone(state).complete, true);
  state = dispatch(state, 'draft', undefined, '   ');
  state = dispatch(state, 'self-review', undefined, true);
  assert.equal(state.selfReviewed, false);
});

test('persisted data is restricted to authored identifiers and bounded text, not supplied completion claims', () => {
  const stored = {
    ...createCapstoneState(),
    opened: ['brief', 'brief', 'rooms', 'remote-file', 'draft'],
    choices: { source: 'confirmed', availability: 'invented', repair: 'replace', scope: 'proceed', external: 'secret' },
    submitted: ['source', 'availability', 'repair', 'scope', 'fake'],
    draft: 'x'.repeat(3000), selfReviewed: 'yes', complete: true, unknown: { secret: 'discard' },
  };
  const state = sanitizeCapstoneState(stored);
  assert.deepEqual(state.opened, ['brief', 'rooms', 'draft']);
  assert.equal(state.choices.availability, null);
  assert.equal(state.draft.length, MAX_DRAFT_LENGTH);
  assert.equal(state.selfReviewed, false);
  assert.equal('unknown' in state, false);
  assert.equal('external' in state.choices, false);
  assert.equal(assessCapstone(state).complete, false);
  assert.equal(assessCapstone(state).decisions.source, false, 'the archive must also be inspected for the source decision');
});

test('invalid state, actions, unknown choices and old scenarios cannot create progress', () => {
  const initial = createCapstoneState();
  for (const value of [null, undefined, false, [], 'bad', 42, { ...initial, version: 0 }, { ...initial, scenario: 'other' }]) {
    assert.deepEqual(sanitizeCapstoneState(value), initial);
  }
  for (const action of [null, [], 'check', { type: 'unknown' }, { type: 'check', id: '__proto__' }, { type: 'choose', id: 'scope', value: 'invalid' }, { type: 'open-source', id: 'remote' }, { type: 'draft', value: {} }, { type: 'self-review', value: 'true' }]) {
    assert.deepEqual(capstoneReducer(initial, action), initial);
  }
  assert.equal(assessDecision(initial, '__proto__').kind, 'invalid-decision');
  assert.equal(assessDecision(inspect(), 'repair').kind, 'choose');
});

test('draft bounds avoid splitting a surrogate pair and reset discards prior choices and prose', () => {
  let state = dispatch(complete(), 'draft', undefined, 'x'.repeat(MAX_DRAFT_LENGTH - 1) + '\uD83D\uDE00');
  assert.equal(state.draft.length, MAX_DRAFT_LENGTH - 1);
  assert.deepEqual(dispatch(state, 'reset'), createCapstoneState());
});

test('both receipts distinguish checked choices from self-review and Thai remains intact', () => {
  const state = complete();
  const english = createCapstoneReceipt(state, 'en');
  const thai = createCapstoneReceipt(state, 'th');
  assert.match(english, /No booking or message actually occurred/);
  assert.match(english, /not live AI output/);
  assert.equal((thai.match(/[\u0E00-\u0E7F]/g) || []).length > 250, true);
  assert.equal(thai.includes('\uFFFD'), false);
  assert.match(thai, /4\/4/);
});
