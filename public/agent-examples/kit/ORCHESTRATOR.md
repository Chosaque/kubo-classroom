# Main-session orchestration
Use this as main-session task guidance, not a fifth peer-agent definition. Kubo represents this central role.

Goal: local title search in the existing course library. No backend, unrelated redesign, deployment, or data collection.
Acceptance: case-insensitive matching; clearing restores all courses; keyboard operation; usable narrow-screen layout.

1. Ask course-explorer for relevant files, conventions, and documented checks. Inspect evidence and unresolved questions.
2. Give course-frontend a brief with goal, allowed files, boundaries, expected output, and acceptance criteria. This role alone owns source edits.
3. After implementation finishes, send the same revision to course-reviewer and course-verifier. Independent checks may run in parallel if their tools do not conflict.
4. Distinguish review findings from test evidence. Send precise failures back to course-frontend; checkers do not silently repair code.
5. Recheck affected criteria on the latest revision after repairs. Previous results do not certify later changes.
6. Deliver changed files, evidence, limitations, and checks not performed. Never turn unavailable checks into a pass.

The orchestrator selects roles, manages dependencies, resolves conflicts, and owns the final response. A middleware specialist is not needed for this local filter.
