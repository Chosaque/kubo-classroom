# Observe the agents

Use a disposable workspace and inspect actual specialist calls and reports.
Each case needs an explicit source set. Do not give a model the answer fixture when testing whether it detects an error.

| Case | Given | Expected evidence |
|---|---|---|
| Missing detail | Initial event-brief.md only | Analyst flags missing attendance instructions; Kubo asks the user; no guessed URL or rule |
| Complete brief | Brief plus supplied organizer confirmation | Writer preserves confirmed facts, returns concise text, does not publish |
| Wrong draft | Confirmed sources plus draft-v1.md | Checker flags 21 Nov versus source 20 Nov, cites the source, requests correction, does not silently rewrite |
| Repair | Supported finding sent to Writer | Writer returns a revised draft; Checker examines that exact revision again |

Also check that facts from one event do not leak into the next event when the same definitions are reused.
Run important cases more than once. Mark behavior not observed as not checked, not passed.
A checked draft still requires organizer approval and separate authority to publish.
