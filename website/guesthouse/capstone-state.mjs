// Local, authored training scenario. These checks do not evaluate free text.
export const CAPSTONE_VERSION = 1;
export const CAPSTONE_SCENARIO = 'next-shift-2026-10-02';
export const MAX_DRAFT_LENGTH = 2000;
export const CAPSTONE_SOURCE_IDS = Object.freeze(['brief', 'rooms', 'archive', 'draft']);
export const CAPSTONE_DECISIONS = Object.freeze({
  source: Object.freeze({ options: ['confirmed', 'archive', 'latest'], correct: 'confirmed', sources: ['brief', 'archive', 'draft'] }),
  availability: Object.freeze({ options: ['candidate', 'available', 'fallback'], correct: 'candidate', sources: ['brief', 'rooms'] }),
  repair: Object.freeze({ options: ['replace', 'time-only', 'polish'], correct: 'replace', sources: ['brief', 'rooms', 'draft'] }),
  scope: Object.freeze({ options: ['proceed', 'ask-everything', 'send'], correct: 'proceed', sources: ['brief'] }),
});
export const CAPSTONE_DECISION_IDS = Object.freeze(Object.keys(CAPSTONE_DECISIONS));

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const uniqueAllowed = (value, allowed) => Array.isArray(value) ? allowed.filter(id => value.includes(id)) : [];
const cleanDraft = value => typeof value === 'string' ? value.slice(0, MAX_DRAFT_LENGTH).replace(/[\uD800-\uDBFF]$/, '') : '';

export function createCapstoneState() {
  return {
    version: CAPSTONE_VERSION,
    scenario: CAPSTONE_SCENARIO,
    opened: [],
    choices: Object.fromEntries(CAPSTONE_DECISION_IDS.map(id => [id, null])),
    submitted: [],
    draft: '',
    selfReviewed: false,
  };
}

// Accept only this scenario's authored IDs and bounded learner text.
// Do not restore completion flags or unknown properties supplied by storage.
export function sanitizeCapstoneState(value) {
  const state = createCapstoneState();
  if (!record(value) || value.version !== CAPSTONE_VERSION || value.scenario !== CAPSTONE_SCENARIO) return state;
  state.opened = uniqueAllowed(value.opened, CAPSTONE_SOURCE_IDS);
  state.submitted = uniqueAllowed(value.submitted, CAPSTONE_DECISION_IDS);
  if (record(value.choices)) {
    for (const id of CAPSTONE_DECISION_IDS) {
      if (CAPSTONE_DECISIONS[id].options.includes(value.choices[id])) state.choices[id] = value.choices[id];
    }
  }
  state.draft = cleanDraft(value.draft);
  state.selfReviewed = value.selfReviewed === true && state.draft.trim().length > 0;
  return state;
}

export function assessDecision(value, id) {
  const state = sanitizeCapstoneState(value);
  if (!CAPSTONE_DECISION_IDS.includes(id)) return { ok: false, kind: 'invalid-decision', missingSources: [] };
  const decision = CAPSTONE_DECISIONS[id];
  const missingSources = decision.sources.filter(source => !state.opened.includes(source));
  if (missingSources.length) return { ok: false, kind: 'inspect-sources', missingSources };
  if (state.choices[id] === null) return { ok: false, kind: 'choose', missingSources: [] };
  if (state.choices[id] !== decision.correct) return { ok: false, kind: state.choices[id], missingSources: [] };
  return { ok: true, kind: 'correct', missingSources: [] };
}

export function assessCapstone(value) {
  const state = sanitizeCapstoneState(value);
  const decisions = Object.fromEntries(CAPSTONE_DECISION_IDS.map(id => [id, state.submitted.includes(id) && assessDecision(state, id).ok]));
  const checked = Object.values(decisions).filter(Boolean).length;
  return { complete: checked === CAPSTONE_DECISION_IDS.length, checked, total: CAPSTONE_DECISION_IDS.length, selfReviewed: state.selfReviewed, decisions };
}

// Pure reducer: callers may save the returned object locally, but this module
// itself performs no storage, network requests, booking, or messaging.
export function capstoneReducer(value, action) {
  const state = sanitizeCapstoneState(value);
  if (!record(action)) return state;
  const id = action.id;
  if (action.type === 'reset') return createCapstoneState();
  if (action.type === 'open-source' && CAPSTONE_SOURCE_IDS.includes(id) && !state.opened.includes(id)) {
    state.opened = uniqueAllowed([...state.opened, id], CAPSTONE_SOURCE_IDS);
    // Opening a missing record is not itself checking a previously submitted answer.
    state.submitted = state.submitted.filter(decision => !CAPSTONE_DECISIONS[decision].sources.includes(id));
  }
  if (action.type === 'choose' && CAPSTONE_DECISION_IDS.includes(id) && CAPSTONE_DECISIONS[id].options.includes(action.value)) {
    if (state.choices[id] !== action.value) {
      state.choices[id] = action.value;
      state.submitted = state.submitted.filter(decision => decision !== id);
    }
  }
  if (action.type === 'check' && CAPSTONE_DECISION_IDS.includes(id)) {
    state.submitted = uniqueAllowed([...state.submitted, id], CAPSTONE_DECISION_IDS);
  }
  if (action.type === 'draft' && typeof action.value === 'string') {
    const draft = cleanDraft(action.value);
    if (draft !== state.draft) state.selfReviewed = false;
    state.draft = draft;
  }
  if (action.type === 'self-review' && typeof action.value === 'boolean') state.selfReviewed = action.value && state.draft.trim().length > 0;
  return state;
}
