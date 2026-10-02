import { createCapstoneState, sanitizeCapstoneState, capstoneReducer, assessDecision, assessCapstone, CAPSTONE_DECISION_IDS, MAX_DRAFT_LENGTH } from './capstone-state.mjs';

// All examples and checks below are authored, local classroom material.
const sources = [
  {
    id: 'brief',
    title: ['A \u00b7 \u0e07\u0e32\u0e19\u0e01\u0e30\u0e19\u0e35\u0e49\u0e41\u0e25\u0e30\u0e04\u0e33\u0e02\u0e2d\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19', 'A \u00b7 Shift brief and confirmed request'],
    by: ['Kubo \u00b7 2 \u0e15.\u0e04. 2026 \u0e40\u0e27\u0e25\u0e32 18:15', 'Kubo \u00b7 02 Oct 2026, 18:15'],
    body: [
      'Nova \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e40\u0e21\u0e37\u0e48\u0e2d 18:10: "\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e09\u0e31\u0e19\u0e02\u0e2d\u0e2b\u0e49\u0e2d\u0e07\u0e40\u0e07\u0e35\u0e22\u0e1a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u0e08\u0e30\u0e21\u0e32\u0e16\u0e36\u0e07\u0e40\u0e27\u0e25\u0e32 20:30 \u0e04\u0e23\u0e32\u0e27\u0e19\u0e35\u0e49\u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e27\u0e34\u0e27\u0e14\u0e32\u0e27\u0e41\u0e1a\u0e1a\u0e04\u0e23\u0e31\u0e49\u0e07\u0e01\u0e48\u0e2d\u0e19"\n\u0e07\u0e32\u0e19\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13: \u0e2d\u0e48\u0e32\u0e19\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e43\u0e2b\u0e49\u0e21\u0e32 \u0e41\u0e25\u0e49\u0e27\u0e23\u0e48\u0e32\u0e07\u0e04\u0e33\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2b\u0e49\u0e2d\u0e07\u0e1e\u0e31\u0e01\u0e43\u0e2b\u0e49\u0e15\u0e23\u0e27\u0e08\u0e17\u0e32\u0e19\n\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15\u0e17\u0e35\u0e48\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15: \u0e2d\u0e48\u0e32\u0e19\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e41\u0e25\u0e30\u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e43\u0e2b\u0e49\u0e08\u0e2d\u0e07\u0e2b\u0e49\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21',
      'Nova confirmed at 18:10: "Tonight I need a quiet room with a garden view. I arrive at 20:30. This time I do not want the star view from my previous stay."\nYour task: read the supplied sample records and prepare a room recommendation draft for review.\nAuthorized scope: read and draft now. Booking rooms and sending messages are not authorized.',
    ],
  },
  {
    id: 'rooms',
    title: ['B \u00b7 \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e2b\u0e49\u0e2d\u0e07\u0e1e\u0e31\u0e01\u0e01\u0e30\u0e1b\u0e31\u0e08\u0e08\u0e38\u0e1a\u0e31\u0e19', 'B \u00b7 Current room record'],
    by: ['\u0e41\u0e21\u0e48\u0e1a\u0e49\u0e32\u0e19 \u00b7 \u0e15\u0e23\u0e27\u0e08\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30\u0e2b\u0e49\u0e2d\u0e07 2 \u0e15.\u0e04. 2026 \u0e40\u0e27\u0e25\u0e32 18:00', 'Housekeeping \u00b7 Features checked 02 Oct 2026, 18:00'],
    body: [
      '101 \u00b7 \u0e40\u0e07\u0e35\u0e22\u0e1a \u00b7 \u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u00b7 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e23\u0e27\u0e08\u0e27\u0e48\u0e32\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e27\u0e48\u0e32\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48\n102 \u00b7 \u0e2a\u0e27\u0e48\u0e32\u0e07 \u00b7 \u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u00b7 \u0e27\u0e48\u0e32\u0e07 \u0e13 \u0e40\u0e27\u0e25\u0e32 18:00\n103 \u00b7 \u0e2d\u0e32\u0e01\u0e32\u0e28\u0e40\u0e22\u0e47\u0e19 \u00b7 \u0e27\u0e34\u0e27\u0e14\u0e32\u0e27 \u00b7 \u0e27\u0e48\u0e32\u0e07 \u0e13 \u0e40\u0e27\u0e25\u0e32 18:00\n\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30\u0e2b\u0e49\u0e2d\u0e07\u0e01\u0e31\u0e1a\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e04\u0e19\u0e25\u0e30\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e19\u0e35\u0e49\u0e22\u0e31\u0e07\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e27\u0e48\u0e32\u0e2b\u0e49\u0e2d\u0e07 101 \u0e27\u0e48\u0e32\u0e07\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49',
      '101 \u00b7 Quiet \u00b7 Garden view \u00b7 Availability for tonight has not been checked\n102 \u00b7 Bright \u00b7 Garden view \u00b7 Available as of 18:00\n103 \u00b7 Cool \u00b7 Star view \u00b7 Available as of 18:00\nRoom features and availability are separate facts. This record does not establish that room 101 is available tonight.',
    ],
  },
  {
    id: 'archive',
    title: ['C \u00b7 \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e1e\u0e31\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07\u0e01\u0e48\u0e2d\u0e19', 'C \u00b7 Previous-stay archive'],
    by: ['Nova \u00b7 1 \u0e15.\u0e04. 2026 \u0e40\u0e27\u0e25\u0e32 19:00 \u00b7 \u0e40\u0e01\u0e47\u0e1a\u0e44\u0e27\u0e49\u0e2d\u0e49\u0e32\u0e07\u0e2d\u0e34\u0e07', 'Nova \u00b7 01 Oct 2026, 19:00 \u00b7 Archive only'],
    body: [
      '"\u0e09\u0e31\u0e19\u0e0a\u0e2d\u0e1a\u0e2d\u0e32\u0e01\u0e32\u0e28\u0e40\u0e22\u0e47\u0e19\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e14\u0e32\u0e27 \u0e08\u0e30\u0e21\u0e32\u0e16\u0e36\u0e07 19:00"\n\u0e04\u0e23\u0e31\u0e49\u0e07\u0e19\u0e31\u0e49\u0e19\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2b\u0e49\u0e2d\u0e07 103 \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e19\u0e35\u0e49\u0e40\u0e1b\u0e47\u0e19\u0e04\u0e33\u0e02\u0e2d\u0e02\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e1e\u0e31\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07\u0e01\u0e48\u0e2d\u0e19 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e01\u0e32\u0e23\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49',
      '"I prefer cool air and a star view. I arrive at 19:00."\nRoom 103 was recommended for that visit. This is a previous-stay request, not confirmation for tonight.',
    ],
  },
  {
    id: 'draft',
    title: ['D \u00b7 \u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07 Kubo \u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08', 'D \u00b7 Kubo draft to review'],
    by: ['Kubo \u00b7 2 \u0e15.\u0e04. 2026 \u0e40\u0e27\u0e25\u0e32 18:20', 'Kubo \u00b7 02 Oct 2026, 18:20'],
    body: [
      '"Nova \u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e2d\u0e32\u0e01\u0e32\u0e28\u0e40\u0e22\u0e47\u0e19\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e14\u0e32\u0e27 \u0e08\u0e36\u0e07\u0e08\u0e2d\u0e07\u0e2b\u0e49\u0e2d\u0e07 103 \u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e27\u0e25\u0e32 19:00 \u0e41\u0e25\u0e30\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27"\n\u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e23\u0e48\u0e32\u0e07\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e15\u0e31\u0e49\u0e07\u0e43\u0e08\u0e43\u0e2a\u0e48\u0e02\u0e49\u0e2d\u0e1c\u0e34\u0e14\u0e1e\u0e25\u0e32\u0e14 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e1c\u0e25\u0e08\u0e32\u0e01 AI \u0e2a\u0e14 \u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e08\u0e23\u0e34\u0e07',
      '"Nova wants cool air and stars, so room 103 is booked for 19:00 and the confirmation has been sent."\nThis is an intentionally flawed, authored example, not live AI output. No booking or message actually occurred.',
    ],
  },
];

const questions = {
  source: {
    title: ['\u0e04\u0e33\u0e02\u0e2d\u0e43\u0e14\u0e43\u0e0a\u0e49\u0e15\u0e31\u0e14\u0e2a\u0e34\u0e19\u0e07\u0e32\u0e19\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49?', 'Which request governs tonight?'],
    hint: ['\u0e40\u0e1b\u0e34\u0e14 A, C \u0e41\u0e25\u0e30 D \u0e41\u0e25\u0e49\u0e27\u0e1e\u0e34\u0e08\u0e32\u0e23\u0e13\u0e32\u0e27\u0e48\u0e32\u0e43\u0e04\u0e23\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2d\u0e30\u0e44\u0e23 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e14\u0e39\u0e40\u0e27\u0e25\u0e32\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e40\u0e14\u0e35\u0e22\u0e27', 'Open A, C, and D. Check who confirmed what, not just which timestamp is newest.'],
    options: [
      ['archive', ['\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01 C \u0e40\u0e1e\u0e23\u0e32\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e04\u0e27\u0e32\u0e21\u0e0a\u0e2d\u0e1a\u0e40\u0e14\u0e34\u0e21\u0e02\u0e2d\u0e07 Nova', 'C: it records Nova\'s previous preference.']],
      ['confirmed', ['\u0e04\u0e33\u0e02\u0e2d\u0e43\u0e19 A \u0e40\u0e1e\u0e23\u0e32\u0e30 Nova \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e27\u0e48\u0e32\u0e04\u0e27\u0e32\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49', 'A: Nova explicitly confirmed a changed request for tonight.']],
      ['latest', ['\u0e23\u0e48\u0e32\u0e07 D \u0e40\u0e1e\u0e23\u0e32\u0e30\u0e21\u0e35\u0e40\u0e27\u0e25\u0e32\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14', 'D: it has the newest timestamp.']],
    ],
    feedback: {
      correct: ['\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 A \u0e40\u0e1b\u0e47\u0e19\u0e04\u0e33\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e07\u0e32\u0e19\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49 C \u0e40\u0e1b\u0e47\u0e19\u0e04\u0e19\u0e25\u0e30\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e1e\u0e31\u0e01 \u0e2a\u0e48\u0e27\u0e19 D \u0e40\u0e1b\u0e47\u0e19\u0e23\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e23\u0e27\u0e08 \u0e40\u0e27\u0e25\u0e32\u0e43\u0e2b\u0e21\u0e48\u0e01\u0e27\u0e48\u0e32\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e17\u0e33\u0e43\u0e2b\u0e49\u0e23\u0e48\u0e32\u0e07\u0e19\u0e48\u0e32\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e16\u0e37\u0e2d\u0e01\u0e27\u0e48\u0e32\u0e41\u0e2b\u0e25\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25', 'Correct. A explicitly confirms tonight\'s change. C belongs to another stay; D is an unchecked draft. A newer timestamp does not make a draft more authoritative.'],
      archive: ['C \u0e40\u0e1b\u0e47\u0e19\u0e04\u0e27\u0e32\u0e21\u0e0a\u0e2d\u0e1a\u0e02\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e1e\u0e31\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07\u0e01\u0e48\u0e2d\u0e19 \u0e41\u0e15\u0e48 Nova \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e43\u0e19 A \u0e27\u0e48\u0e32\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e40\u0e1b\u0e47\u0e19\u0e40\u0e07\u0e35\u0e22\u0e1a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u0e2d\u0e48\u0e32\u0e19\u0e04\u0e33\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e41\u0e25\u0e49\u0e27\u0e25\u0e2d\u0e07\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07', 'C describes a previous stay. In A, Nova explicitly changes tonight\'s request to quiet and garden view. Read that confirmation and try again.'],
      latest: ['D \u0e43\u0e2b\u0e21\u0e48\u0e01\u0e27\u0e48\u0e32\u0e41\u0e15\u0e48\u0e40\u0e1b\u0e47\u0e19\u0e23\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e02\u0e31\u0e14\u0e01\u0e31\u0e1a\u0e04\u0e33\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e43\u0e19 A \u0e04\u0e27\u0e32\u0e21\u0e43\u0e2b\u0e21\u0e48\u0e02\u0e2d\u0e07\u0e40\u0e27\u0e25\u0e32\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e41\u0e17\u0e19\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e41\u0e2b\u0e25\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 \u0e25\u0e2d\u0e07\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e04\u0e33\u0e02\u0e2d\u0e17\u0e35\u0e48 Nova \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49', 'D is newer but contradicts the confirmation in A. Recency cannot replace source checking. Choose the request Nova confirmed for tonight.'],
    },
    receipt: ['\u0e43\u0e0a\u0e49\u0e04\u0e33\u0e02\u0e2d\u0e17\u0e35\u0e48 Nova \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a 2 \u0e15.\u0e04. \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e49\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e40\u0e01\u0e48\u0e32\u0e2b\u0e23\u0e37\u0e2d\u0e23\u0e48\u0e32\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e17\u0e35\u0e48\u0e02\u0e31\u0e14\u0e01\u0e31\u0e19', 'Used Nova\'s confirmed 02 Oct request, not the archive or conflicting newer draft.'],
  },
  availability: {
    title: ['\u0e15\u0e2d\u0e19\u0e19\u0e35\u0e49\u0e1e\u0e39\u0e14\u0e16\u0e36\u0e07\u0e2b\u0e49\u0e2d\u0e07\u0e43\u0e14\u0e44\u0e14\u0e49\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e44\u0e23?', 'What can you claim about a room now?'],
    hint: ['\u0e43\u0e0a\u0e49 A \u0e41\u0e25\u0e30 B \u0e41\u0e22\u0e01\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30\u0e2b\u0e49\u0e2d\u0e07\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07', 'Use A and B. Separate matching features from confirmed availability.'],
    options: [
      ['candidate', ['101 \u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e40\u0e07\u0e35\u0e22\u0e1a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u0e41\u0e15\u0e48\u0e22\u0e31\u0e07\u0e15\u0e49\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08\u0e27\u0e48\u0e32\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e27\u0e48\u0e32\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48', '101 matches quiet and garden view; tonight\'s availability still needs checking.']],
      ['available', ['101 \u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e04\u0e33\u0e02\u0e2d \u0e08\u0e36\u0e07\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e44\u0e14\u0e49\u0e27\u0e48\u0e32\u0e27\u0e48\u0e32\u0e07\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49', '101 matches the request, so it is confirmed available tonight.']],
      ['fallback', ['103 \u0e27\u0e48\u0e32\u0e07\u0e40\u0e21\u0e37\u0e48\u0e2d 18:00 \u0e08\u0e36\u0e07\u0e43\u0e0a\u0e49\u0e41\u0e17\u0e19\u0e44\u0e14\u0e49\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e02\u0e2d', '103 was available at 18:00, so it can replace the requested room without checking the request.']],
    ],
    feedback: {
      correct: ['\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 B \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30\u0e02\u0e2d\u0e07 101 \u0e41\u0e15\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07 \u0e23\u0e30\u0e1a\u0e38\u0e40\u0e1b\u0e47\u0e19\u0e15\u0e31\u0e27\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e04\u0e27\u0e32\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e02\u0e49\u0e2d\u0e04\u0e49\u0e32\u0e07\u0e15\u0e23\u0e27\u0e08 \u0e2d\u0e22\u0e48\u0e32\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e04\u0e27\u0e32\u0e21\u0e44\u0e21\u0e48\u0e41\u0e19\u0e48\u0e43\u0e08\u0e43\u0e2b\u0e49\u0e40\u0e1b\u0e47\u0e19\u0e02\u0e49\u0e2d\u0e40\u0e17\u0e47\u0e08\u0e08\u0e23\u0e34\u0e07', 'Correct. B establishes 101\'s features, not its availability. Name it as a matching candidate and preserve the unresolved check. Do not turn uncertainty into a fact.'],
      available: ['\u0e2b\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e04\u0e27\u0e32\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e2d\u0e32\u0e08\u0e44\u0e21\u0e48\u0e27\u0e48\u0e32\u0e07 B \u0e23\u0e30\u0e1a\u0e38\u0e0a\u0e31\u0e14\u0e27\u0e48\u0e32\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e02\u0e2d\u0e07 101 \u0e08\u0e36\u0e07\u0e22\u0e31\u0e07\u0e43\u0e0a\u0e49\u0e04\u0e33\u0e27\u0e48\u0e32 "\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e27\u0e48\u0e32\u0e27\u0e48\u0e32\u0e07" \u0e44\u0e21\u0e48\u0e44\u0e14\u0e49', 'A suitable room can still be unavailable. B explicitly says 101\'s availability has not been checked, so you cannot call it confirmed available.'],
      fallback: ['\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e27\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07 103 \u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e17\u0e33\u0e43\u0e2b\u0e49\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e04\u0e33\u0e02\u0e2d A \u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e40\u0e07\u0e35\u0e22\u0e1a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 \u0e2a\u0e48\u0e27\u0e19 B \u0e43\u0e2b\u0e49 103 \u0e40\u0e1b\u0e47\u0e19\u0e2d\u0e32\u0e01\u0e32\u0e28\u0e40\u0e22\u0e47\u0e19\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e14\u0e32\u0e27 \u0e2d\u0e22\u0e48\u0e32\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e04\u0e27\u0e32\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e41\u0e17\u0e19 Nova', '103\'s availability does not make it a match. A asks for quiet and garden view; B lists cool air and stars for 103. Do not change Nova\'s requirements for them.'],
    },
    receipt: ['\u0e40\u0e25\u0e37\u0e2d\u0e01 101 \u0e40\u0e1b\u0e47\u0e19\u0e2b\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30 \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e04\u0e07\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e27\u0e48\u0e32\u0e07\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e27\u0e48\u0e32 "\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e23\u0e27\u0e08"', 'Identified 101 as a feature match and kept tonight\'s availability unverified.'],
  },
  repair: {
    title: ['\u0e08\u0e30\u0e41\u0e01\u0e49\u0e23\u0e48\u0e32\u0e07 D \u0e2d\u0e22\u0e48\u0e32\u0e07\u0e44\u0e23\u0e43\u0e2b\u0e49\u0e15\u0e23\u0e07\u0e2b\u0e25\u0e31\u0e01\u0e10\u0e32\u0e19?', 'How should draft D be repaired?'],
    hint: ['\u0e15\u0e23\u0e27\u0e08\u0e2b\u0e49\u0e2d\u0e07 \u0e40\u0e27\u0e25\u0e32 \u0e04\u0e27\u0e32\u0e21\u0e44\u0e21\u0e48\u0e41\u0e19\u0e48\u0e43\u0e08 \u0e41\u0e25\u0e30\u0e2a\u0e34\u0e48\u0e07\u0e17\u0e35\u0e48\u0e2d\u0e49\u0e32\u0e07\u0e27\u0e48\u0e32\u0e17\u0e33\u0e41\u0e25\u0e49\u0e27\u0e01\u0e31\u0e1a A \u0e41\u0e25\u0e30 B', 'Compare the room, time, uncertainty, and claimed actions with A and B.'],
    options: [
      ['time-only', ['\u0e41\u0e01\u0e49\u0e40\u0e1b\u0e47\u0e19 20:30 \u0e41\u0e15\u0e48\u0e04\u0e07\u0e2b\u0e49\u0e2d\u0e07 103 \u0e41\u0e25\u0e30\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e27\u0e48\u0e32\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e30\u0e2a\u0e48\u0e07\u0e41\u0e25\u0e49\u0e27', 'Change the time to 20:30; keep 103 and the claims that it was booked and sent.']],
      ['polish', ['\u0e1b\u0e23\u0e31\u0e1a\u0e2a\u0e33\u0e19\u0e27\u0e19\u0e43\u0e2b\u0e49\u0e2d\u0e48\u0e32\u0e19\u0e14\u0e35\u0e02\u0e36\u0e49\u0e19 \u0e41\u0e25\u0e49\u0e27\u0e43\u0e0a\u0e49\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e14\u0e34\u0e21\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e40\u0e1e\u0e23\u0e32\u0e30 Kubo \u0e23\u0e48\u0e32\u0e07\u0e44\u0e27\u0e49\u0e41\u0e25\u0e49\u0e27', 'Improve the wording and keep all the facts because Kubo already drafted them.']],
      ['replace', ['\u0e23\u0e48\u0e32\u0e07: 101 \u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e40\u0e07\u0e35\u0e22\u0e1a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a Nova \u0e17\u0e35\u0e48\u0e21\u0e32\u0e16\u0e36\u0e07 20:30 \u0e04\u0e37\u0e19\u0e19\u0e35\u0e49 \u0e22\u0e31\u0e07\u0e15\u0e49\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08\u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21', 'Draft: 101 matches quiet and garden view for Nova\'s arrival tonight at 20:30. Availability needs checking. Not booked or sent.']],
    ],
    feedback: {
      correct: ['\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 \u0e23\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e41\u0e01\u0e49\u0e43\u0e0a\u0e49\u0e04\u0e33\u0e02\u0e2d\u0e1b\u0e31\u0e08\u0e08\u0e38\u0e1a\u0e31\u0e19\u0e41\u0e25\u0e30\u0e2b\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e25\u0e31\u0e01\u0e29\u0e13\u0e30 \u0e40\u0e01\u0e47\u0e1a\u0e02\u0e49\u0e2d\u0e04\u0e49\u0e32\u0e07\u0e15\u0e23\u0e27\u0e08 \u0e41\u0e25\u0e30\u0e44\u0e21\u0e48\u0e2d\u0e49\u0e32\u0e07\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e17\u0e35\u0e48\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e17\u0e33 \u0e01\u0e32\u0e23\u0e41\u0e01\u0e49\u0e04\u0e23\u0e1a\u0e2a\u0e33\u0e04\u0e31\u0e0d\u0e01\u0e27\u0e48\u0e32\u0e2a\u0e33\u0e19\u0e27\u0e19\u0e17\u0e35\u0e48\u0e25\u0e37\u0e48\u0e19\u0e44\u0e2b\u0e25', 'Correct. The repair uses the current request and matching features, keeps the unresolved check, and removes invented action claims. Complete factual repair matters more than fluent wording.'],
      'time-only': ['\u0e41\u0e01\u0e49\u0e40\u0e27\u0e25\u0e32\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e40\u0e14\u0e35\u0e22\u0e27\u0e22\u0e31\u0e07\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e2b\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e44\u0e21\u0e48\u0e15\u0e23\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e41\u0e25\u0e30\u0e04\u0e33\u0e2d\u0e49\u0e32\u0e07\u0e27\u0e48\u0e32\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e41\u0e25\u0e49\u0e27 \u0e15\u0e23\u0e27\u0e08\u0e17\u0e31\u0e49\u0e07\u0e02\u0e49\u0e2d\u0e40\u0e17\u0e47\u0e08\u0e08\u0e23\u0e34\u0e07\u0e41\u0e25\u0e30\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15\u0e07\u0e32\u0e19\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07', 'Fixing only the time leaves the wrong room and unsupported booked/sent claims. Check both the facts and the authorized scope before choosing again.'],
      polish: ['\u0e2a\u0e33\u0e19\u0e27\u0e19\u0e14\u0e35\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e1b\u0e23\u0e30\u0e01\u0e31\u0e19\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e16\u0e39\u0e01 D \u0e02\u0e31\u0e14\u0e01\u0e31\u0e1a A \u0e41\u0e25\u0e30 B \u0e41\u0e25\u0e30\u0e2d\u0e49\u0e32\u0e07\u0e01\u0e32\u0e23\u0e01\u0e23\u0e30\u0e17\u0e33\u0e17\u0e35\u0e48\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e40\u0e01\u0e34\u0e14\u0e02\u0e36\u0e49\u0e19 \u0e15\u0e49\u0e2d\u0e07\u0e41\u0e01\u0e49\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e41\u0e25\u0e30\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e41\u0e04\u0e48\u0e20\u0e32\u0e29\u0e32', 'Polished wording does not establish accuracy. D conflicts with A and B and claims actions that did not occur. Repair the facts and scope, not just the prose.'],
    },
    receipt: ['\u0e41\u0e01\u0e49\u0e2b\u0e49\u0e2d\u0e07 \u0e40\u0e27\u0e25\u0e32 20:30 \u0e02\u0e49\u0e2d\u0e04\u0e49\u0e32\u0e07\u0e15\u0e23\u0e27\u0e08 \u0e41\u0e25\u0e30\u0e15\u0e31\u0e14\u0e04\u0e33\u0e2d\u0e49\u0e32\u0e07\u0e27\u0e48\u0e32\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e41\u0e25\u0e49\u0e27', 'Repaired the room, 20:30 arrival, unresolved availability, and unsupported action claims.'],
  },
  scope: {
    title: ['Kubo \u0e04\u0e27\u0e23\u0e17\u0e33\u0e2d\u0e30\u0e44\u0e23\u0e15\u0e48\u0e2d\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22?', 'What can Kubo do next without asking again?'],
    hint: ['\u0e01\u0e25\u0e31\u0e1a\u0e44\u0e1b\u0e14\u0e39\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15\u0e17\u0e35\u0e48\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e43\u0e19 A \u0e01\u0e32\u0e23\u0e17\u0e33\u0e07\u0e32\u0e19\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22\u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e01\u0e32\u0e23\u0e16\u0e32\u0e21\u0e17\u0e38\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07', 'Use the authorization in A. Safe autonomy does not mean asking before every step.'],
    options: [
      ['ask-everything', ['\u0e2b\u0e22\u0e38\u0e14\u0e16\u0e32\u0e21\u0e01\u0e48\u0e2d\u0e19\u0e2d\u0e48\u0e32\u0e19\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07\u0e17\u0e38\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07 \u0e41\u0e21\u0e49 A \u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e44\u0e27\u0e49\u0e41\u0e25\u0e49\u0e27', 'Stop and ask before every read or draft, even though A already authorizes them.']],
      ['proceed', ['\u0e2d\u0e48\u0e32\u0e19\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e35\u0e48\u0e43\u0e2b\u0e49\u0e41\u0e25\u0e30\u0e17\u0e33\u0e23\u0e48\u0e32\u0e07\u0e15\u0e48\u0e2d\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22 \u0e23\u0e30\u0e1a\u0e38\u0e02\u0e49\u0e2d\u0e04\u0e49\u0e32\u0e07\u0e15\u0e23\u0e27\u0e08 \u0e2a\u0e48\u0e27\u0e19\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e15\u0e49\u0e2d\u0e07\u0e21\u0e35\u0e04\u0e33\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e15\u0e34\u0e21\u0e41\u0e25\u0e30\u0e15\u0e23\u0e27\u0e08\u0e04\u0e27\u0e32\u0e21\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e01\u0e48\u0e2d\u0e19', 'Read the supplied records and prepare the draft now, stating the unresolved check. Booking or sending needs additional authorization and the necessary readiness checks.']],
      ['send', ['\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e23\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e16\u0e39\u0e01\u0e41\u0e25\u0e49\u0e27 \u0e43\u0e2b\u0e49\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e30\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e17\u0e31\u0e19\u0e17\u0e35\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e0a\u0e48\u0e27\u0e22\u0e1b\u0e23\u0e30\u0e2b\u0e22\u0e31\u0e14\u0e40\u0e27\u0e25\u0e32', 'Once the draft is correct, book and send immediately to save time.']],
    ],
    feedback: {
      correct: ['\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 \u0e17\u0e33\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e41\u0e25\u0e49\u0e27\u0e15\u0e48\u0e2d\u0e44\u0e14\u0e49 \u0e41\u0e25\u0e30\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e2a\u0e34\u0e48\u0e07\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e23\u0e39\u0e49 \u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e42\u0e25\u0e01\u0e19\u0e2d\u0e01\u0e15\u0e31\u0e27\u0e23\u0e48\u0e32\u0e07\u0e41\u0e25\u0e30\u0e2d\u0e22\u0e39\u0e48\u0e19\u0e2d\u0e01\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15 A \u0e08\u0e36\u0e07\u0e15\u0e49\u0e2d\u0e07\u0e2b\u0e22\u0e38\u0e14\u0e01\u0e48\u0e2d\u0e19\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e19\u0e31\u0e49\u0e19', 'Correct. Continue the steps already authorized and report what remains unknown. Booking or sending changes something beyond the draft and exceeds A\'s scope, so pause before those actions.'],
      'ask-everything': ['A \u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e43\u0e2b\u0e49\u0e2d\u0e48\u0e32\u0e19\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e41\u0e25\u0e30\u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07\u0e41\u0e25\u0e49\u0e27 \u0e01\u0e32\u0e23\u0e02\u0e2d\u0e0b\u0e49\u0e33\u0e17\u0e38\u0e01\u0e02\u0e31\u0e49\u0e19\u0e44\u0e21\u0e48\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e04\u0e27\u0e32\u0e21\u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22\u0e43\u0e19\u0e07\u0e32\u0e19\u0e19\u0e35\u0e49 \u0e43\u0e0a\u0e49\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15\u0e40\u0e14\u0e34\u0e21\u0e17\u0e33\u0e15\u0e48\u0e2d \u0e41\u0e25\u0e49\u0e27\u0e2b\u0e22\u0e38\u0e14\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e01\u0e48\u0e2d\u0e19\u0e07\u0e32\u0e19\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15', 'A already permits reading and drafting. Asking again for each authorized step adds no safety here. Work within that scope and pause before actions outside it.'],
      send: ['\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e23\u0e48\u0e32\u0e07\u0e1c\u0e48\u0e32\u0e19\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c\u0e43\u0e2b\u0e49\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07 A \u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e40\u0e1e\u0e35\u0e22\u0e07\u0e2d\u0e48\u0e32\u0e19\u0e41\u0e25\u0e30\u0e17\u0e33\u0e23\u0e48\u0e32\u0e07 \u0e2d\u0e35\u0e01\u0e17\u0e31\u0e49\u0e07\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e27\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07 101 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19 \u0e40\u0e25\u0e37\u0e2d\u0e01\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e43\u0e19\u0e02\u0e2d\u0e1a\u0e40\u0e02\u0e15\u0e40\u0e14\u0e34\u0e21', 'Passing the draft check does not grant booking or sending permission. A only authorizes reading and drafting, and 101\'s availability is unresolved. Choose actions within the existing scope.'],
    },
    receipt: ['\u0e17\u0e33\u0e07\u0e32\u0e19\u0e2d\u0e48\u0e32\u0e19\u0e41\u0e25\u0e30\u0e23\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e41\u0e25\u0e49\u0e27\u0e15\u0e48\u0e2d\u0e44\u0e14\u0e49 \u0e2b\u0e22\u0e38\u0e14\u0e01\u0e48\u0e2d\u0e19\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15', 'Proceeded with authorized reading and drafting; paused before unauthorized booking or sending.'],
  },
};

const localize = (pair, language) => pair[language === 'th' ? 0 : 1];
let instanceNumber = 0;

export function createCapstoneReceipt(value, language = 'en') {
  const state = sanitizeCapstoneState(value);
  const assessment = assessCapstone(state);
  if (!assessment.complete) return '';
  const t = pair => localize(pair, language);
  return [
    t(['Kubo Classroom | \u0e20\u0e32\u0e23\u0e01\u0e34\u0e08\u0e01\u0e30\u0e16\u0e31\u0e14\u0e44\u0e1b', 'Kubo Classroom | Next shift']),
    t(['\u0e2a\u0e16\u0e32\u0e19\u0e01\u0e32\u0e23\u0e13\u0e4c\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07: 2 \u0e15.\u0e04. 2026', 'Sample scenario: 02 Oct 2026']),
    t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e41\u0e1a\u0e1a\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27: 4/4', 'Objective decisions checked: 4/4']),
    ...CAPSTONE_DECISION_IDS.map((id, index) => String(index + 1) + '. ' + t(questions[id].receipt)),
    '',
    t(['\u0e01\u0e32\u0e23\u0e17\u0e1a\u0e17\u0e27\u0e19\u0e23\u0e48\u0e32\u0e07\u0e14\u0e49\u0e27\u0e22\u0e15\u0e19\u0e40\u0e2d\u0e07: ', 'Draft self-review: ']) + t(state.selfReviewed ? ['\u0e1c\u0e39\u0e49\u0e40\u0e23\u0e35\u0e22\u0e19\u0e17\u0e33\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e2b\u0e21\u0e32\u0e22\u0e27\u0e48\u0e32\u0e17\u0e1a\u0e17\u0e27\u0e19\u0e41\u0e25\u0e49\u0e27', 'marked reviewed by learner'] : ['\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e17\u0e33\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e2b\u0e21\u0e32\u0e22', 'not marked']),
    t(['\u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07\u0e1c\u0e39\u0e49\u0e40\u0e23\u0e35\u0e22\u0e19 (\u0e44\u0e21\u0e48\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a \u0e23\u0e30\u0e1a\u0e1a\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e23\u0e27\u0e08\u0e04\u0e27\u0e32\u0e21\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e19\u0e35\u0e49):', 'Learner draft (optional; its wording has not been automatically validated):']),
    state.draft.trim() || t(['\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07', 'No draft entered']),
    '',
    t(['\u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e41\u0e1a\u0e1a\u0e1d\u0e36\u0e01\u0e2b\u0e31\u0e14\u0e08\u0e32\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e1c\u0e25\u0e08\u0e32\u0e01 AI \u0e2a\u0e14 \u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e08\u0e23\u0e34\u0e07', 'Authored training exercise, not live AI output. No booking or message actually occurred.']),
  ].join('\n');
}

export function createCapstone({ host, getLanguage = () => 'en', onBack, initialState, onSave, onChange } = {}) {
  if (!host || typeof host.replaceChildren !== 'function') throw new TypeError('createCapstone requires a DOM host.');
  const prefix = 'kubo-capstone-' + (++instanceNumber) + '-';
  let state = sanitizeCapstoneState(initialState);
  let activeIndex = Math.max(0, CAPSTONE_DECISION_IDS.findIndex(id => !assessCapstone(state).decisions[id]));
  const expanded = new Set();
  let progressNode, resultNode, reviewInput, draftCount;
  const language = () => getLanguage() === 'th' ? 'th' : 'en';
  const t = pair => localize(pair, language());
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const button = (label, action, primary = false) => {
    const element = node('button', primary ? 'capstone-button capstone-primary' : 'capstone-button', label);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
  };
  function notify(save = true) {
    const assessment = assessCapstone(state);
    if (save && typeof onSave === 'function') onSave(getState());
    if (typeof onChange === 'function') onChange({ complete: assessment.complete, checked: assessment.checked, total: assessment.total, selfReviewed: assessment.selfReviewed });
  }
  function dispatch(action) {
    state = capstoneReducer(state, action);
    notify();
  }
  function progress() {
    const assessment = assessCapstone(state);
    if (progressNode) progressNode.textContent = t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e41\u0e25\u0e49\u0e27 ', 'Decisions checked: ']) + assessment.checked + ' / ' + assessment.total;
  }
  function focusQuestion() {
    host.querySelector('.capstone-question-title')?.focus({ preventScroll: true });
  }
  function renderSources(parent) {
    const section = node('section', 'capstone-sources');
    const heading = node('h3', '', t(['1. \u0e40\u0e1b\u0e34\u0e14\u0e41\u0e25\u0e30\u0e15\u0e23\u0e27\u0e08\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23', '1. Open and inspect the records']));
    heading.id = prefix + 'sources';
    section.setAttribute('aria-labelledby', heading.id);
    section.append(heading, node('p', 'capstone-help', t(['\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e41\u0e15\u0e48\u0e25\u0e30\u0e43\u0e1a\u0e40\u0e1b\u0e34\u0e14\u0e44\u0e14\u0e49\u0e14\u0e49\u0e27\u0e22\u0e01\u0e32\u0e23\u0e41\u0e15\u0e30 \u0e04\u0e25\u0e34\u0e01 \u0e2b\u0e23\u0e37\u0e2d\u0e1b\u0e38\u0e48\u0e21 Enter \u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e2d\u0e32\u0e28\u0e31\u0e22\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23 \u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e43\u0e0a\u0e49 AI \u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d', 'Tap, click, or press Enter to open a record. The answers use these records; no AI or tool connection is needed.'])));
    const grid = node('div', 'capstone-source-grid');
    for (const source of sources) {
      const card = node('details', 'capstone-source');
      card.open = expanded.has(source.id);
      const summary = node('summary');
      const status = node('span', 'capstone-source-state', t(state.opened.includes(source.id) ? ['\u0e40\u0e1b\u0e34\u0e14\u0e41\u0e25\u0e49\u0e27', 'Opened'] : ['\u0e40\u0e1b\u0e34\u0e14\u0e2d\u0e48\u0e32\u0e19', 'Open record']));
      summary.append(node('strong', '', t(source.title)), status);
      card.append(summary, node('p', 'capstone-source-by', t(source.by)), node('p', 'capstone-source-text', t(source.body)));
      card.addEventListener('toggle', () => {
        if (!card.isConnected) return;
        if (card.open) {
          expanded.add(source.id);
          if (!state.opened.includes(source.id)) {
            dispatch({ type: 'open-source', id: source.id });
            status.textContent = t(['\u0e40\u0e1b\u0e34\u0e14\u0e41\u0e25\u0e49\u0e27', 'Opened']);
            progress();
          }
        } else expanded.delete(source.id);
      });
      grid.append(card);
    }
    section.append(grid);
    parent.append(section);
  }
  function renderQuestion(parent) {
    const id = CAPSTONE_DECISION_IDS[activeIndex];
    const question = questions[id];
    const assessment = assessCapstone(state);
    const section = node('section', 'capstone-decisions');
    section.append(node('h3', '', t(['2. \u0e15\u0e31\u0e14\u0e2a\u0e34\u0e19\u0e43\u0e08\u0e08\u0e32\u0e01\u0e2b\u0e25\u0e31\u0e01\u0e10\u0e32\u0e19', '2. Make a call from the evidence'])));
    const fieldset = node('fieldset', 'capstone-fieldset');
    const legend = node('legend', 'capstone-question-title', String(activeIndex + 1) + ' / 4 \u00b7 ' + t(question.title));
    legend.tabIndex = -1;
    const hint = node('p', 'capstone-help', t(question.hint));
    hint.id = prefix + 'hint';
    fieldset.setAttribute('aria-describedby', hint.id);
    fieldset.append(legend, hint);
    for (const [value, labels] of question.options) {
      const label = node('label', 'capstone-option');
      const input = node('input');
      input.type = 'radio';
      input.name = prefix + id;
      input.value = value;
      input.checked = state.choices[id] === value;
      input.addEventListener('change', () => {
        dispatch({ type: 'choose', id, value });
        render();
        host.querySelector('input[value="' + value + '"]')?.focus({ preventScroll: true });
      });
      label.append(input, node('span', '', t(labels)));
      fieldset.append(label);
    }
    section.append(fieldset, button(t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a', 'Check my decision']), () => {
      dispatch({ type: 'check', id });
      render();
      host.querySelector('.capstone-feedback')?.focus({ preventScroll: true });
    }, true));
    if (state.submitted.includes(id)) {
      const result = assessDecision(state, id);
      let message;
      if (result.kind === 'inspect-sources') {
        message = t(['\u0e40\u0e1b\u0e34\u0e14\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e40\u0e2b\u0e25\u0e48\u0e32\u0e19\u0e35\u0e49\u0e01\u0e48\u0e2d\u0e19\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a: ', 'Inspect these records before checking: ']) + result.missingSources.map(sourceId => t(sources.find(source => source.id === sourceId).title)).join('; ');
      } else if (result.kind === 'choose') {
        message = t(['\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e02\u0e49\u0e2d \u0e41\u0e25\u0e49\u0e27\u0e01\u0e14\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a', 'Choose one answer, then check your decision.']);
      } else message = t(question.feedback[result.kind]);
      const feedback = node('p', 'capstone-feedback ' + (result.ok ? 'is-correct' : 'is-retry'), message);
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.tabIndex = -1;
      section.append(feedback);
    }
    const navigation = node('nav', 'capstone-question-nav');
    navigation.setAttribute('aria-label', t(['\u0e02\u0e49\u0e2d\u0e04\u0e33\u0e16\u0e32\u0e21\u0e20\u0e32\u0e23\u0e01\u0e34\u0e08', 'Challenge decisions']));
    const previous = button(t(['\u0e02\u0e49\u0e2d\u0e01\u0e48\u0e2d\u0e19\u0e2b\u0e19\u0e49\u0e32', 'Previous decision']), () => {
      activeIndex--;
      render();
      focusQuestion();
    });
    previous.disabled = activeIndex === 0;
    navigation.append(previous);
    if (activeIndex < CAPSTONE_DECISION_IDS.length - 1) {
      const next = button(t(['\u0e02\u0e49\u0e2d\u0e15\u0e48\u0e2d\u0e44\u0e1b', 'Next decision']), () => {
        activeIndex++;
        render();
        focusQuestion();
      });
      next.disabled = !assessment.decisions[id];
      navigation.append(next);
    } else if (assessment.complete) {
      navigation.append(button(t(['\u0e14\u0e39\u0e1c\u0e25\u0e41\u0e25\u0e30\u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19', 'See my result and draft']), () => {
        host.querySelector('.capstone-reflection-title')?.focus();
      }));
    }
    section.append(navigation);
    parent.append(section);
  }
  function renderResult() {
    if (!resultNode) return;
    resultNode.replaceChildren();
    const assessment = assessCapstone(state);
    if (!assessment.complete) {
      resultNode.append(node('p', 'capstone-help', t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e04\u0e23\u0e1a 4 \u0e02\u0e49\u0e2d\u0e41\u0e25\u0e49\u0e27\u0e08\u0e30\u0e44\u0e14\u0e49\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01 \u0e23\u0e48\u0e32\u0e07\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e44\u0e21\u0e48\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e41\u0e25\u0e30\u0e44\u0e21\u0e48\u0e43\u0e0a\u0e49\u0e15\u0e31\u0e14\u0e2a\u0e34\u0e19\u0e27\u0e48\u0e32\u0e1c\u0e48\u0e32\u0e19', 'Check all four decisions to unlock a copyable record. Your personal draft is optional and is not used to determine completion.'])));
      return;
    }
    resultNode.append(node('h3', '', t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e04\u0e23\u0e1a 4/4 \u0e41\u0e25\u0e49\u0e27', 'All four decisions checked'])));
    resultNode.append(node('p', '', t(['\u0e1c\u0e25\u0e19\u0e35\u0e49\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e41\u0e1a\u0e1a\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e17\u0e35\u0e48\u0e15\u0e23\u0e27\u0e08\u0e41\u0e25\u0e49\u0e27 \u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e27\u0e48\u0e32\u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 \u0e41\u0e25\u0e30\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07\u0e17\u0e31\u0e01\u0e29\u0e30\u0e01\u0e32\u0e23\u0e43\u0e0a\u0e49 AI \u0e08\u0e23\u0e34\u0e07', 'This records the checked choices only. It does not validate your draft or certify performance with a real AI system.'])));
    const receiptLabel = node('label', 'capstone-receipt-label', t(['\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01', 'Copyable learning record']));
    const receipt = node('textarea', 'capstone-receipt');
    receipt.rows = 8;
    receipt.readOnly = true;
    receipt.value = createCapstoneReceipt(state, language());
    receiptLabel.append(receipt);
    const status = node('p', 'capstone-help');
    status.setAttribute('role', 'status');
    resultNode.append(receiptLabel, button(t(['\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25', 'Copy learning record']), async () => {
      try {
        if (!globalThis.navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await globalThis.navigator.clipboard.writeText(receipt.value);
        status.textContent = t(['\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27', 'Copied.']);
      } catch {
        receipt.focus();
        receipt.select();
        status.textContent = t(['\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e43\u0e2b\u0e49\u0e41\u0e25\u0e49\u0e27 \u0e43\u0e0a\u0e49\u0e04\u0e33\u0e2a\u0e31\u0e48\u0e07\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e02\u0e2d\u0e07\u0e2d\u0e38\u0e1b\u0e01\u0e23\u0e13\u0e4c \u0e2b\u0e23\u0e37\u0e2d Ctrl+C / Cmd+C', 'Text selected. Use your device\'s Copy command or Ctrl+C / Cmd+C.']);
      }
    }, true), status);
  }
  function renderReflection(parent) {
    const section = node('section', 'capstone-reflection');
    const heading = node('h3', 'capstone-reflection-title', t(['3. \u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13 (\u0e44\u0e21\u0e48\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a)', '3. Write your draft (optional)']));
    heading.tabIndex = -1;
    section.append(heading, node('p', 'capstone-help', t(['\u0e25\u0e2d\u0e07\u0e40\u0e02\u0e35\u0e22\u0e19 2-3 \u0e1b\u0e23\u0e30\u0e42\u0e22\u0e04\u0e16\u0e36\u0e07\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e19\u0e23\u0e48\u0e27\u0e21\u0e01\u0e30: \u0e02\u0e49\u0e2d\u0e40\u0e2a\u0e19\u0e2d \u0e2b\u0e25\u0e31\u0e01\u0e10\u0e32\u0e19 \u0e02\u0e49\u0e2d\u0e04\u0e49\u0e32\u0e07\u0e15\u0e23\u0e27\u0e08 \u0e41\u0e25\u0e30\u0e2a\u0e34\u0e48\u0e07\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e17\u0e33 \u0e43\u0e0a\u0e49\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e19\u0e35\u0e49 \u0e2b\u0e25\u0e35\u0e01\u0e40\u0e25\u0e35\u0e48\u0e22\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e2b\u0e23\u0e37\u0e2d\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e08\u0e32\u0e01\u0e07\u0e32\u0e19\u0e08\u0e23\u0e34\u0e07', 'Write 2-3 sentences for the next shift: recommendation, evidence, unresolved check, and actions not taken. Use only this sample scenario; leave out personal or real workplace information.'])));
    const label = node('label', 'capstone-draft-label', t(['\u0e23\u0e48\u0e32\u0e07\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19 \u2014 \u0e23\u0e30\u0e1a\u0e1a\u0e44\u0e21\u0e48\u0e15\u0e23\u0e27\u0e08\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e2d\u0e34\u0e2a\u0e23\u0e30', 'My draft \u2014 free text is not automatically checked']));
    const input = node('textarea', 'capstone-draft');
    input.rows = 5;
    input.maxLength = MAX_DRAFT_LENGTH;
    input.value = state.draft;
    input.setAttribute('aria-describedby', prefix + 'draft-help');
    label.append(input);
    const help = node('p', 'capstone-help', t(['\u0e15\u0e23\u0e27\u0e08\u0e14\u0e49\u0e27\u0e22\u0e15\u0e19\u0e40\u0e2d\u0e07: \u0e40\u0e07\u0e35\u0e22\u0e1a + \u0e27\u0e34\u0e27\u0e2a\u0e27\u0e19 / 101 \u0e40\u0e1b\u0e47\u0e19\u0e15\u0e31\u0e27\u0e40\u0e25\u0e37\u0e2d\u0e01 / 20:30 \u0e04\u0e37\u0e19\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 2 \u0e15.\u0e04. / \u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19 / \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e08\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07', 'Self-check: quiet + garden / 101 as candidate / 20:30 on 02 Oct / availability unverified / not booked or sent']));
    help.id = prefix + 'draft-help';
    draftCount = node('p', 'capstone-count', String(state.draft.length) + ' / ' + MAX_DRAFT_LENGTH);
    const reviewLabel = node('label', 'capstone-self-review');
    reviewInput = node('input');
    reviewInput.type = 'checkbox';
    reviewInput.checked = state.selfReviewed;
    reviewInput.disabled = !state.draft.trim();
    reviewLabel.append(reviewInput, node('span', '', t(['\u0e09\u0e31\u0e19\u0e40\u0e17\u0e35\u0e22\u0e1a\u0e23\u0e48\u0e32\u0e07\u0e01\u0e31\u0e1a\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e41\u0e25\u0e49\u0e27 (\u0e04\u0e33\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19 \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e1c\u0e25\u0e15\u0e23\u0e27\u0e08\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34)', 'I compared my draft with the checklist (my self-review, not an automatic assessment).'])));
    input.addEventListener('input', () => {
      dispatch({ type: 'draft', value: input.value });
      if (input.value !== state.draft) input.value = state.draft;
      draftCount.textContent = String(state.draft.length) + ' / ' + MAX_DRAFT_LENGTH;
      reviewInput.checked = state.selfReviewed;
      reviewInput.disabled = !state.draft.trim();
      renderResult();
    });
    reviewInput.addEventListener('change', () => {
      dispatch({ type: 'self-review', value: reviewInput.checked });
      renderResult();
    });
    section.append(label, draftCount, help, reviewLabel);
    resultNode = node('div', 'capstone-result');
    section.append(resultNode);
    parent.append(section);
    renderResult();
  }
  function render() {
    const wrapper = node('div', 'capstone');
    wrapper.lang = language();
    wrapper.append(node('p', 'capstone-eyebrow', t(['\u0e41\u0e1a\u0e1a\u0e1d\u0e36\u0e01\u0e2b\u0e31\u0e14\u0e08\u0e32\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07', 'Authored practice'])));
    const title = node('h2', 'capstone-title', t(['\u0e20\u0e32\u0e23\u0e01\u0e34\u0e08\u0e01\u0e30\u0e16\u0e31\u0e14\u0e44\u0e1b', 'Next shift']));
    title.tabIndex = -1;
    wrapper.append(title);
    wrapper.append(node('p', 'capstone-intro', t(['Kubo \u0e1d\u0e32\u0e01\u0e04\u0e38\u0e13\u0e15\u0e23\u0e27\u0e08\u0e23\u0e48\u0e32\u0e07\u0e01\u0e48\u0e2d\u0e19\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e01\u0e30 Nova \u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e04\u0e33\u0e02\u0e2d\u0e41\u0e25\u0e49\u0e27 \u0e41\u0e25\u0e30\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e41\u0e21\u0e48\u0e1a\u0e49\u0e32\u0e19\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e2b\u0e49\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07 \u0e04\u0e38\u0e13\u0e08\u0e30\u0e0a\u0e48\u0e27\u0e22\u0e17\u0e35\u0e21\u0e40\u0e14\u0e34\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e15\u0e48\u0e2d\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e44\u0e23\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e40\u0e14\u0e32\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e33\u0e40\u0e01\u0e34\u0e19\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c?', 'Kubo asks you to review a draft before handing over the shift. Nova changed the request, and the housekeeping record leaves availability unresolved. Help the team move forward without guessing or exceeding its permission.'])));
    wrapper.append(node('p', 'capstone-help', t(['\u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e2a\u0e16\u0e32\u0e19\u0e01\u0e32\u0e23\u0e13\u0e4c\u0e43\u0e2b\u0e21\u0e48 \u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2b\u0e49\u0e2d\u0e07\u0e1e\u0e31\u0e01\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e08\u0e32\u0e01\u0e1a\u0e17\u0e40\u0e23\u0e35\u0e22\u0e19\u0e01\u0e48\u0e2d\u0e19 \u0e43\u0e2b\u0e49\u0e43\u0e0a\u0e49\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e02\u0e2d\u0e07\u0e04\u0e37\u0e19\u0e19\u0e35\u0e49\u0e43\u0e19\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23 B', 'This is a new scenario with changed room facts. Use tonight\'s record B instead of the room list from earlier lessons.'])));
    progressNode = node('p', 'capstone-progress');
    wrapper.append(progressNode);
    progress();
    renderSources(wrapper);
    renderQuestion(wrapper);
    if (assessCapstone(state).complete) renderReflection(wrapper);
    else {
      resultNode = null;
      wrapper.append(node('p', 'capstone-help', t(['\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e04\u0e23\u0e1a 4 \u0e02\u0e49\u0e2d\u0e41\u0e25\u0e49\u0e27 \u0e08\u0e36\u0e07\u0e40\u0e02\u0e35\u0e22\u0e19\u0e23\u0e48\u0e32\u0e07\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e41\u0e25\u0e30\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e44\u0e14\u0e49', 'Check all four decisions to unlock the optional draft and copyable learning record.'])));
    }
    if (typeof onBack === 'function') {
      const footer = node('div', 'capstone-footer');
      footer.append(button(t(['\u0e01\u0e25\u0e31\u0e1a\u0e2a\u0e39\u0e48\u0e1a\u0e17\u0e40\u0e23\u0e35\u0e22\u0e19', 'Back to lessons']), () => onBack()));
      wrapper.append(footer);
    }
    host.replaceChildren(wrapper);
  }
  function getState() { return sanitizeCapstoneState(state); }
  function reset() {
    state = createCapstoneState();
    activeIndex = 0;
    expanded.clear();
    notify();
    render();
  }
  return { render, getState, reset };
}
