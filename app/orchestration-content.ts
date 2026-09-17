export type Copy = readonly [string, string];
export const c = (en:string, th:string):Copy => [en, th];
export type Role = 'analyst'|'writer'|'checker';
export const ROLES:Record<Role,{name:string;job:Copy;boundary:Copy;color:string}> = {
  "analyst": {
    "name": "Brief Analyst",
    "job": [
      "Establish the facts",
      "สรุปข้อมูลที่ยืนยันได้"
    ],
    "boundary": [
      "Facts + sources + questions",
      "ข้อเท็จจริง + ที่มา + คำถาม"
    ],
    "color": "#8acbff"
  },
  "writer": {
    "name": "Writer",
    "job": [
      "Draft the announcement",
      "ร่างประกาศ"
    ],
    "boundary": [
      "Wording changes. Facts stay.",
      "ปรับภาษา ไม่เปลี่ยนข้อมูล"
    ],
    "color": "#95dec0"
  },
  "checker": {
    "name": "Quality Checker",
    "job": [
      "Compare draft with source",
      "เทียบร่างกับต้นทาง"
    ],
    "boundary": [
      "Report findings. Don’t rewrite.",
      "รายงานปัญหา ไม่เขียนแทน"
    ],
    "color": "#f3cb78"
  }
};
export const CHAPTERS:Copy[] = [
  [
    "The mission",
    "โจทย์ของเรา"
  ],
  [
    "The team",
    "รู้จักทีม"
  ],
  [
    "Inside an agent",
    "เปิดไฟล์ Agent"
  ],
  [
    "Design the team",
    "ออกแบบทีม"
  ],
  [
    "Delegate the work",
    "มอบหมายงาน"
  ],
  [
    "Handle a failure",
    "เมื่อเกิดปัญหา"
  ],
  [
    "Create your agents",
    "สร้าง Agents"
  ],
  [
    "Bring it together",
    "รวมผลงาน"
  ]
];
export type Slide = {
 id:string; chapter:number; title:Copy; line:Copy; kind:'mission'|'hub'|'roles'|'file'|'compare'|'brief'|'flow'|'setup'|'finish'|'evidence'|'office';
 notes:Copy; ask?:Copy; takeaway:Copy; role?:Role; active?:Role[]; done?:Role[]; status?:'assign'|'return'|'fail'|'fix'|'pass';
 code?:Copy; caption?:Copy; handoff?:Copy; filename?:string; items?:{label:Copy;value:Copy}[];
};
export const SLIDES:Slide[] = [
  {
    "id": "mission",
    "chapter": 0,
    "kind": "mission",
    "title": [
      "A brief in. A clear announcement out.",
      "จากบรีฟงาน สู่ประกาศที่ชัดเจน"
    ],
    "line": [
      "“Prepare an announcement for our AI workshop.”",
      "“ช่วยเขียนประกาศเชิญเข้าร่วมเวิร์กช็อป AI”"
    ],
    "takeaway": [
      "The goal is a useful result—not a crowd of agents.",
      "เป้าหมายคือผลงานที่ใช้ได้ ไม่ใช่จำนวน Agent"
    ],
    "notes": [
      "Introduce the fictional AI Basics event. We have a short organizer brief, not a finished announcement. Follow one task from source facts to checked copy. Kubo represents the main session coordinating three reusable specialist definitions. This is an illustrated presentation: no agents execute and nothing is published when slides advance.",
      "ใช้เวิร์กช็อป AI Basics ที่สมมติขึ้นเป็นโจทย์ เรามีบรีฟจากผู้จัด แต่ยังไม่มีประกาศ ติดตามงานตั้งแต่ข้อมูลต้นทางจนถึงข้อความที่ตรวจแล้ว Kubo แทนบทสนทนาหลักที่ประสานผู้ช่วย 3 บทบาท ภาพนี้เป็นการจำลอง ไม่มีการเรียก Agent หรือเผยแพร่ประกาศเมื่อเปลี่ยนสไลด์"
    ]
  },
  {
    "id": "success",
    "chapter": 0,
    "kind": "mission",
    "title": [
      "Agree on what “ready” means.",
      "ตกลงก่อนว่า “พร้อมใช้” คืออะไร"
    ],
    "line": [
      "Correct facts. Complete details. Clear wording.",
      "ข้อมูลตรง รายละเอียดครบ อ่านเข้าใจ"
    ],
    "takeaway": [
      "All three agents work toward the same criteria.",
      "ผู้ช่วยทั้ง 3 คนใช้เกณฑ์เดียวกัน"
    ],
    "notes": [
      "The announcement must preserve the organizer’s facts, explain attendance, and be readable to beginners. Date, time, place and fee must match the source. Registration is missing, so it must be clarified rather than guessed. Ready for organizer approval is different from already sent or published.",
      "ประกาศต้องตรงกับข้อมูลผู้จัด บอกวิธีเข้าร่วม และอ่านเข้าใจง่าย วัน เวลา สถานที่ และค่าใช้จ่ายต้องตรงต้นทาง วิธีลงทะเบียนยังไม่ระบุ จึงต้องถามก่อน ไม่เดาเอง พร้อมให้ผู้จัดอนุมัติไม่เท่ากับส่งหรือเผยแพร่แล้ว"
    ],
    "items": [
      {
        "label": [
          "Accurate",
          "ถูกต้อง"
        ],
        "value": [
          "Matches the brief",
          "ตรงกับบรีฟ"
        ]
      },
      {
        "label": [
          "Complete",
          "ครบถ้วน"
        ],
        "value": [
          "No guessed details",
          "ไม่เดาข้อมูลที่ขาด"
        ]
      },
      {
        "label": [
          "Clear",
          "ชัดเจน"
        ],
        "value": [
          "Easy to act on",
          "รู้ว่าต้องทำอะไร"
        ]
      }
    ],
    "ask": [
      "What would you need to know before attending?",
      "ถ้าจะเข้าร่วม คุณต้องรู้อะไรบ้าง?"
    ]
  },
  {
    "id": "orchestrator",
    "chapter": 1,
    "kind": "hub",
    "title": [
      "One coordinator at the center.",
      "มีผู้ประสานงานอยู่ตรงกลาง"
    ],
    "line": [
      "Plan → delegate → evaluate → deliver",
      "วางแผน → มอบหมาย → ตรวจผล → ส่งมอบ"
    ],
    "takeaway": [
      "Kubo owns the overall result.",
      "Kubo รับผิดชอบผลลัพธ์ทั้งหมด"
    ],
    "notes": [
      "The orchestrator decides which specialists are useful, supplies context, reviews reports, and asks the user when facts are missing. Kubo is the character representing this role, not a separate learning objective. The main agent may do a small task itself; delegation is not mandatory for every action.",
      "Orchestrator เลือกผู้ช่วย ให้บริบท ประเมินรายงาน และถามผู้ใช้เมื่อข้อมูลไม่ครบ Kubo เป็นตัวแทนบทบาทนี้ ไม่ใช่เป้าหมายการเรียนอีกข้อหนึ่ง งานเล็กอาจทำเองได้ ไม่จำเป็นต้องมอบหมายทุกขั้นตอน"
    ],
    "active": []
  },
  {
    "id": "specialists",
    "chapter": 1,
    "kind": "roles",
    "title": [
      "Three jobs. One shared goal.",
      "3 หน้าที่ เป้าหมายเดียวกัน"
    ],
    "line": [
      "Establish facts → write → check",
      "ตรวจข้อมูล → เขียน → ตรวจผลงาน"
    ],
    "takeaway": [
      "These are reusable roles, not different AI models.",
      "นี่คือบทบาทที่ใช้ซ้ำ ไม่จำเป็นต้องใช้โมเดลต่างกัน"
    ],
    "notes": [
      "Brief Analyst extracts source facts and missing details. Writer produces the announcement from the approved facts. Quality Checker independently compares the draft with the brief and the agreed requirements. Their definitions can be reused for other events; the current date and venue belong in the task brief, not permanently in the agent definition.",
      "Brief Analyst สรุปข้อมูลและสิ่งที่ขาด Writer เขียนจากข้อมูลที่ยืนยันแล้ว Quality Checker เทียบร่างกับต้นทางและเกณฑ์ แต่ละบทบาทใช้ซ้ำกับงานอื่นได้ วันและสถานที่ของงานนี้อยู่ในโจทย์ ไม่ควรฝังถาวรในไฟล์ Agent"
    ]
  },
  {
  "id": "office-demo",
  "chapter": 1,
  "kind": "office",
  "title": [
    "Inside Kubo’s office.",
    "เข้าออฟฟิศของ Kubo"
  ],
  "line": [
    "Six core stations. One orchestrator.",
    "6 สถานีหลัก โดยมี Orchestrator ประสานงาน"
  ],
  "takeaway": [
    "Stations are parts of the working environment—not six sub-agents.",
    "สถานีคือส่วนต่าง ๆ ของสภาพแวดล้อมการทำงาน ไม่ใช่ผู้ช่วย 6 ตัว"
  ],
  "notes": [
    "Demonstrate the original six stations before opening an agent file. Select each station and let Kubo arrive: 1 Context Desk—read the request and current context; 2 Safe—check project rules; 3 Shortcut—choose a suitable skill; 4 Skill Files—read its instructions and references; 5 Helper Station—delegate a bounded check and review the report; 6 Permission Door—pause for the user when authorization is needed. Connect the tour to our event brief: understand the announcement request, preserve confirmed facts, consult the writing guidance, check the date, and seek permission before sending. The later Document Intake and Task Board remain available as two supporting stations. These places are a visual metaphor, not a required sequence or six agent definitions. Kubo stays the orchestrator; Brief Analyst, Writer and Quality Checker are separate reusable roles. This is a presenter-controlled visual demonstration, not evidence of live agent execution.",
    "สาธิต 6 สถานีเดิมก่อนเปิดไฟล์ Agent เลือกแต่ละสถานีแล้วรอให้ Kubo เดินถึง: 1 โต๊ะบริบท—อ่านโจทย์และข้อมูลปัจจุบัน 2 ตู้เซฟ—ตรวจข้อกำหนดโครงการ 3 ทางลัด—เลือก Skill ที่เหมาะ 4 แฟ้ม Skill—อ่านวิธีทำงานและเอกสารอ้างอิง 5 สถานีผู้ช่วย—มอบหมายงานตรวจที่มีขอบเขตแล้วอ่านรายงาน 6 ประตูขออนุญาต—หยุดถามผู้ใช้เมื่อต้องได้รับอนุญาต เชื่อมกับโจทย์ประกาศ: เข้าใจคำขอ รักษาข้อมูลที่ยืนยันแล้ว อ่านแนวทางเขียน ตรวจวันที่ และขออนุญาตก่อนส่ง ยังมีจุดรับเอกสารและกระดานงานที่เพิ่มภายหลังอีก 2 จุด สถานีเป็นภาพเปรียบเทียบ ไม่ใช่ขั้นตอนตายตัวหรือไฟล์ผู้ช่วย 6 ตัว Kubo ยังคงเป็น Orchestrator ส่วน Brief Analyst, Writer และ Quality Checker เป็นบทบาทผู้ช่วยที่ใช้ซ้ำได้ นี่คือการสาธิตภาพที่ผู้บรรยายควบคุม ไม่ใช่หลักฐานการทำงานสดของ Agent"
  ],
  "ask": [
    "Which station helps when Kubo needs permission to send the announcement?",
    "ถ้า Kubo ต้องขออนุญาตส่งประกาศ ควรใช้สถานีไหน?"
  ]
},
  {
    "id": "agent-file",
    "chapter": 2,
    "kind": "file",
    "title": [
      "An agent starts with a definition.",
      "Agent เริ่มจากไฟล์กำหนดบทบาท"
    ],
    "line": [
      "Settings above. Working instructions below.",
      "ด้านบนคือการตั้งค่า ด้านล่างคือวิธีทำงาน"
    ],
    "takeaway": [
      "Write the role once. Reuse it for many briefs.",
      "เขียนบทบาทครั้งเดียว ใช้กับหลายบรีฟได้"
    ],
    "notes": [
      "This Markdown file configures a specialist in Claude Code. The YAML header gives its identity, routing description, available tools and model choice. The body defines its method and boundaries. It configures an existing AI runtime; it does not train a new model. The downloadable version contains fuller instructions.",
      "ไฟล์ Markdown นี้กำหนดผู้ช่วยใน Claude Code ส่วนหัว YAML ระบุชื่อ เงื่อนไขเรียกใช้ เครื่องมือ และโมเดล ส่วนเนื้อหากำหนดวิธีทำงานและขอบเขต เป็นการตั้งค่าการใช้ AI ที่มีอยู่ ไม่ใช่ฝึกโมเดลใหม่ ไฟล์ดาวน์โหลดมีรายละเอียดครบกว่าตัวอย่างบนสไลด์"
    ],
    "role": "analyst",
    "code": [
      "---\nname: brief-analyst\ndescription: Extract facts before drafting.\ntools: Read, Grep, Glob\nmodel: inherit\n---\nRead the brief. Never fill gaps by guessing.\nReturn facts, sources and open questions.",
      "---\nname: brief-analyst\ndescription: สรุปข้อเท็จจริงก่อนเขียนร่าง\ntools: Read, Grep, Glob\nmodel: inherit\n---\nอ่านบรีฟ ห้ามเดาข้อมูลที่ขาด\nรายงานข้อเท็จจริง แหล่งข้อมูล และคำถาม"
    ],
    "caption": [
      "Claude Code example · simplified for the slide",
      "ตัวอย่าง Claude Code · ย่อเพื่ออธิบาย"
    ]
  },
  {
    "id": "routing",
    "chapter": 2,
    "kind": "file",
    "title": [
      "Tell Kubo when to call.",
      "บอกว่าเมื่อไรควรเรียกใช้"
    ],
    "line": [
      "A name identifies. A description guides selection.",
      "ชื่อบอกว่าใคร คำอธิบายบอกว่าใช้เมื่อไร"
    ],
    "takeaway": [
      "Describe a useful trigger—not “help with anything.”",
      "บอกเงื่อนไขที่ชัด ไม่ใช่ “ช่วยได้ทุกเรื่อง”"
    ],
    "notes": [
      "The routing description tells the orchestrator when the role is relevant and what it returns. Compare this with a vague description such as helpful assistant. Clear descriptions support selection but do not guarantee correct routing. An explicit request for brief-analyst makes a first demonstration easier to follow.",
      "คำอธิบายช่วยให้ Orchestrator รู้ว่าใช้เมื่อไรและจะได้อะไรกลับมา เทียบกับข้อความกว้าง ๆ เช่น ผู้ช่วยอเนกประสงค์ คำอธิบายชัดช่วยเลือกได้ดีขึ้นแต่ไม่รับประกันเสมอ การระบุชื่อ brief-analyst ตรง ๆ ช่วยให้ติดตามการสาธิตครั้งแรกง่ายขึ้น"
    ],
    "role": "analyst",
    "code": [
      "name: brief-analyst\ndescription: >\n  Use before drafting from an event brief.\n  Extract confirmed details with sources.\n  Flag missing or conflicting information.",
      "name: brief-analyst\ndescription: >\n  ใช้ก่อนเขียนประกาศจากบรีฟกิจกรรม\n  สรุปข้อมูลที่ยืนยันได้พร้อมแหล่งอ้างอิง\n  ระบุข้อมูลที่ขาดหรือขัดแย้งกัน"
    ]
  },
  {
    "id": "tools",
    "chapter": 2,
    "kind": "file",
    "title": [
      "Give only the access the job needs.",
      "ให้สิทธิ์เท่าที่งานจำเป็น"
    ],
    "line": [
      "Reading a brief does not require publishing access.",
      "อ่านบรีฟ ไม่จำเป็นต้องมีสิทธิ์เผยแพร่"
    ],
    "takeaway": [
      "Instructions guide behavior. Permissions limit access.",
      "คำสั่งกำหนดวิธีทำงาน สิทธิ์จำกัดการเข้าถึง"
    ],
    "notes": [
      "All three example specialists can read relevant local files and return their work in a message. Even Writer does not need file editing or sending tools to draft text. Kubo can save a final artifact if the user requests it. Tool lists are one layer of control; configure project permissions too. inherit uses the session’s configured model.",
      "ผู้ช่วยทั้ง 3 อ่านไฟล์ที่เกี่ยวข้องและตอบกลับเป็นข้อความได้ แม้แต่ Writer ก็ไม่ต้องมีเครื่องมือแก้ไฟล์หรือส่งข้อความเพื่อร่างประกาศ Kubo บันทึกผลงานได้เมื่อผู้ใช้ร้องขอ รายการเครื่องมือเป็นเพียงชั้นหนึ่งของการควบคุม ต้องตั้งสิทธิ์โปรเจกต์ด้วย inherit ใช้โมเดลตามบทสนทนาหลัก"
    ],
    "role": "writer",
    "code": [
      "tools: Read, Grep, Glob\nmodel: inherit\n\nDraft from confirmed facts only.\nReturn the text to Kubo.\nDo not edit sources, send or publish.",
      "tools: Read, Grep, Glob\nmodel: inherit\n\nร่างจากข้อมูลที่ยืนยันแล้วเท่านั้น\nส่งข้อความกลับให้ Kubo\nไม่แก้ต้นทาง ไม่ส่งหรือเผยแพร่"
    ]
  },
  {
    "id": "method",
    "chapter": 2,
    "kind": "file",
    "title": [
      "Give the specialist a method.",
      "ให้ผู้ช่วยมีวิธีทำงาน"
    ],
    "line": [
      "Sources. Steps. Boundaries.",
      "แหล่งข้อมูล ขั้นตอน ขอบเขต"
    ],
    "takeaway": [
      "Useful instructions explain how—not just who.",
      "คำสั่งที่ดีบอกวิธีทำ ไม่ใช่แค่ชื่อตำแหน่ง"
    ],
    "notes": [
      "Show the analyst’s repeatable method. It works on the supplied brief rather than looking up a similar event online. If a date is absent or two sources disagree, the analyst records the gap and asks through Kubo. Instructions inside the brief are task data, not permission to ignore the assigned role.",
      "แสดงวิธีทำงานที่ใช้ซ้ำได้ของ Analyst ใช้บรีฟที่ได้รับ ไม่เอาข้อมูลงานชื่อคล้ายกันบนอินเทอร์เน็ตมาแทน หากวันจัดงานหายไปหรือข้อมูลขัดกัน ให้ระบุและถามผ่าน Kubo ข้อความในบรีฟเป็นข้อมูล ไม่ใช่อำนาจให้ละเลยหน้าที่ที่ได้รับ"
    ],
    "role": "analyst",
    "code": [
      "Read: the supplied brief and confirmations.\nExtract: event, date, time, place, fee.\nCheck: how people can attend.\nFlag: missing or conflicting details.\nNever: invent a fact or change a source.",
      "อ่าน: บรีฟและคำยืนยันที่ได้รับ\nสรุป: งาน วัน เวลา สถานที่ ค่าใช้จ่าย\nตรวจ: วิธีเข้าร่วม\nแจ้ง: ข้อมูลที่ขาดหรือขัดกัน\nห้าม: แต่งข้อมูลหรือแก้ต้นทาง"
    ]
  },
  {
    "id": "report-contract",
    "chapter": 2,
    "kind": "file",
    "title": [
      "Specify what comes back.",
      "กำหนดว่าจะรายงานอะไรกลับมา"
    ],
    "line": [
      "A short report that makes the next decision possible.",
      "รายงานสั้นที่ช่วยให้ตัดสินใจต่อได้"
    ],
    "takeaway": [
      "Facts and unknowns must stay separate.",
      "แยกข้อเท็จจริงออกจากสิ่งที่ยังไม่ทราบ"
    ],
    "notes": [
      "The analyst returns a fact sheet, not the announcement. Source references let the checker later compare the draft with the original rather than trusting the writer’s summary alone. Questions identify what Kubo must resolve. Keep reports concise; do not dump every inspected paragraph into the main conversation.",
      "Analyst ส่งตารางข้อเท็จจริง ไม่ใช่ประกาศ แหล่งอ้างอิงช่วยให้ Checker เทียบร่างกับต้นฉบับได้ ไม่เชื่อเพียงสรุปของ Writer คำถามทำให้ Kubo รู้ว่าต้องหาคำตอบอะไร รายงานควรสั้น ไม่เททุกย่อหน้าที่อ่านลงในบทสนทนาหลัก"
    ],
    "role": "analyst",
    "code": [
      "Return:\n  Confirmed facts + source references\n  Missing information\n  Conflicting statements\n  Questions for the organizer",
      "รายงานกลับ:\n  ข้อเท็จจริง + แหล่งอ้างอิง\n  ข้อมูลที่ยังขาด\n  ข้อความที่ขัดแย้งกัน\n  คำถามสำหรับผู้จัดงาน"
    ]
  },
  {
    "id": "choose-team",
    "chapter": 3,
    "kind": "compare",
    "title": [
      "Choose roles for this task.",
      "เลือกบทบาทให้ตรงงาน"
    ],
    "line": [
      "Facts, wording and checking need different attention.",
      "ข้อมูล การเขียน และการตรวจ ต้องใส่ใจคนละเรื่อง"
    ],
    "takeaway": [
      "Add a specialist only when its job is useful.",
      "เพิ่มผู้ช่วยเมื่อมีหน้าที่ที่จำเป็นจริง"
    ],
    "notes": [
      "These three roles make source handling, drafting and independent checking visible to beginners. They are not a universal mandatory team. A tiny announcement may be handled by one agent. A coding or design specialist is irrelevant here because the deliverable is text, not software or a poster.",
      "สามบทบาทนี้ช่วยให้ผู้เริ่มต้นเห็นการจัดการข้อมูล การเขียน และการตรวจแยกจากผู้เขียน ไม่ใช่ทีมบังคับสำหรับทุกงาน ประกาศเล็กมากอาจใช้ Agent เดียวได้ งานนี้ต้องการข้อความ จึงไม่จำเป็นต้องมีผู้เขียนโค้ดหรือออกแบบโปสเตอร์"
    ],
    "items": [
      {
        "label": [
          "Brief Analyst",
          "Brief Analyst"
        ],
        "value": [
          "What is confirmed?",
          "ข้อมูลใดยืนยันแล้ว?"
        ]
      },
      {
        "label": [
          "Writer",
          "Writer"
        ],
        "value": [
          "How do we say it clearly?",
          "จะสื่อสารให้ชัดอย่างไร?"
        ]
      },
      {
        "label": [
          "Quality Checker",
          "Quality Checker"
        ],
        "value": [
          "Does it match the source?",
          "ตรงกับข้อมูลต้นทางไหม?"
        ]
      }
    ],
    "ask": [
      "Would a coding agent help with this deliverable?",
      "ผู้ช่วยเขียนโค้ดจำเป็นกับผลงานนี้หรือไม่?"
    ]
  },
  {
    "id": "ownership",
    "chapter": 3,
    "kind": "compare",
    "title": [
      "Clear boundaries prevent confusion.",
      "ขอบเขตชัด งานไม่สับสน"
    ],
    "line": [
      "The writer revises. The checker reports.",
      "ผู้เขียนแก้ไข ผู้ตรวจรายงาน"
    ],
    "takeaway": [
      "A useful role says what not to do, too.",
      "บทบาทที่ดีระบุสิ่งที่ไม่ควรทำด้วย"
    ],
    "notes": [
      "Analyst must not invent a missing date. Writer can improve wording but cannot alter confirmed details. Checker names errors with evidence instead of quietly rewriting the announcement. Kubo decides what to send back for repair. Role boundaries improve accountability; they do not guarantee correctness.",
      "Analyst ห้ามเดาวันที่ที่หายไป Writer ปรับภาษาได้แต่เปลี่ยนข้อมูลยืนยันแล้วไม่ได้ Checker ระบุปัญหาพร้อมหลักฐานแทนการแอบเขียนใหม่ Kubo ตัดสินใจส่งกลับให้แก้ ขอบเขตช่วยให้รู้ว่าใครรับผิดชอบ แต่ไม่ได้รับประกันว่าจะถูกต้องทุกครั้ง"
    ],
    "items": [
      {
        "label": [
          "Brief Analyst",
          "Brief Analyst"
        ],
        "value": [
          "Don’t fill gaps by guessing.",
          "ไม่เดาข้อมูลที่ขาด"
        ]
      },
      {
        "label": [
          "Writer",
          "Writer"
        ],
        "value": [
          "Don’t change confirmed facts.",
          "ไม่เปลี่ยนข้อเท็จจริง"
        ]
      },
      {
        "label": [
          "Quality Checker",
          "Quality Checker"
        ],
        "value": [
          "Don’t silently rewrite.",
          "ไม่แก้ข้อความแทนผู้เขียน"
        ]
      }
    ]
  },
  {
    "id": "orchestrator-rules",
    "chapter": 3,
    "kind": "file",
    "title": [
      "Define how Kubo coordinates.",
      "กำหนดวิธีประสานงานของ Kubo"
    ],
    "line": [
      "Specialist files do not organize themselves.",
      "ไฟล์ผู้ช่วยไม่ได้จัดการงานกันเอง"
    ],
    "takeaway": [
      "The main session owns the handoffs and final answer.",
      "บทสนทนาหลักดูแลการส่งต่องานและคำตอบสุดท้าย"
    ],
    "notes": [
      "Use these as main-session instructions, not a fourth peer specialist. Kubo asks the organizer about missing required details, then supplies the confirmed brief and fact sheet to Writer. Checker receives the same source and the draft. Only the user or organizer can authorize actual publication.",
      "นี่คือคำสั่งของบทสนทนาหลัก ไม่ใช่ผู้ช่วยคนที่ 4 Kubo ถามผู้จัดเมื่อข้อมูลจำเป็นไม่ครบ แล้วส่งบรีฟและข้อมูลที่ยืนยันให้ Writer ส่วน Checker ได้ต้นทางชุดเดียวกันพร้อมร่าง การเผยแพร่จริงต้องได้รับอนุญาตจากผู้ใช้หรือผู้จัด"
    ],
    "code": [
      "1. Ask Brief Analyst for facts and gaps.\n2. Resolve missing details with the user.\n3. Give Writer the confirmed brief.\n4. Give Quality Checker the source + draft.\n5. Route problems back. Recheck revisions.\n6. Deliver checked copy. Do not publish.",
      "1. ให้ Brief Analyst สรุปข้อมูลและสิ่งที่ขาด\n2. ถามผู้ใช้เพื่อยืนยันข้อมูลที่ขาด\n3. ให้ Writer เขียนจากบรีฟที่ยืนยันแล้ว\n4. ให้ Quality Checker เทียบต้นทางกับร่าง\n5. ส่งปัญหากลับให้แก้ แล้วตรวจซ้ำ\n6. ส่งมอบข้อความที่ตรวจแล้ว ไม่เผยแพร่"
    ]
  },
  {
    "id": "brief",
    "chapter": 4,
    "kind": "brief",
    "title": [
      "Delegate with a complete brief.",
      "มอบหมายพร้อมโจทย์ที่ครบ"
    ],
    "line": [
      "Goal + source + boundary + return format",
      "เป้าหมาย + ต้นทาง + ขอบเขต + รายงาน"
    ],
    "takeaway": [
      "A reusable role still needs a task-specific assignment.",
      "แม้มีไฟล์บทบาทแล้ว ก็ต้องมีโจทย์เฉพาะงาน"
    ],
    "notes": [
      "The definition explains how Brief Analyst works across tasks. This assignment supplies the event-specific source and the current goal. Kubo names the allowed source, says not to guess, and requests facts and questions. A job title by itself does not tell the specialist what to inspect.",
      "ไฟล์บทบาทบอกวิธีทำงานของ Brief Analyst ที่ใช้กับหลายงาน โจทย์รอบนี้ให้บรีฟกิจกรรมและเป้าหมายเฉพาะ Kubo ระบุแหล่งข้อมูล ห้ามเดา และขอข้อเท็จจริงพร้อมคำถาม ชื่อตำแหน่งอย่างเดียวไม่บอกว่าต้องอ่านอะไร"
    ],
    "items": [
      {
        "label": [
          "Goal",
          "เป้าหมาย"
        ],
        "value": [
          "Prepare facts for an announcement",
          "เตรียมข้อมูลสำหรับประกาศ"
        ]
      },
      {
        "label": [
          "Source",
          "ต้นทาง"
        ],
        "value": [
          "event-brief.md",
          "event-brief.md"
        ]
      },
      {
        "label": [
          "Boundary",
          "ขอบเขต"
        ],
        "value": [
          "Read only. Do not invent details.",
          "อ่านอย่างเดียว ไม่แต่งข้อมูล"
        ]
      },
      {
        "label": [
          "Return",
          "รายงาน"
        ],
        "value": [
          "Facts, sources, questions",
          "ข้อเท็จจริง แหล่งอ้างอิง คำถาม"
        ]
      }
    ]
  },
  {
    "id": "analyze",
    "chapter": 4,
    "kind": "file",
    "title": [
      "The analyst finds a missing detail.",
      "Analyst พบข้อมูลที่ยังขาด"
    ],
    "line": [
      "Five confirmed facts. One unanswered question.",
      "ข้อเท็จจริง 5 ข้อ คำถามค้าง 1 ข้อ"
    ],
    "takeaway": [
      "“Not specified” is a useful result.",
      "“ยังไม่ระบุ” เป็นผลลัพธ์ที่มีประโยชน์"
    ],
    "notes": [
      "This is the analyst’s illustrative report, not another agent definition. Every listed fact comes from the fictional event brief. Registration is not specified. The analyst does not substitute a plausible registration link or promise walk-in access. The question goes back to Kubo.",
      "นี่คือรายงานจำลองจาก Analyst ไม่ใช่ไฟล์กำหนด Agent อีกไฟล์ ข้อมูลทั้ง 5 มาจากบรีฟสมมติ วิธีลงทะเบียนยังไม่ระบุ Analyst จึงไม่สร้างลิงก์ที่ดูน่าเชื่อหรือรับรองว่าเดินเข้าร่วมได้เอง แต่ส่งคำถามกลับให้ Kubo"
    ],
    "role": "analyst",
    "filename": "fact-sheet.md",
    "code": [
      "Event: AI Basics\nDate: 20 Nov 2026\nTime: 09:00–11:00\nPlace: Room B\nFee: Free\nSource: event-brief.md § Confirmed details\nQuestion: Is registration required?",
      "งาน: AI Basics\nวัน: 20 พ.ย. 2026\nเวลา: 09:00–11:00\nสถานที่: ห้อง B\nค่าใช้จ่าย: ฟรี\nที่มา: event-brief.md § Confirmed details\nคำถาม: ต้องลงทะเบียนหรือไม่?"
    ]
  },
  {
    "id": "clarify",
    "chapter": 4,
    "kind": "flow",
    "title": [
      "Kubo asks instead of guessing.",
      "Kubo ถาม แทนการเดา"
    ],
    "line": [
      "“Do participants need to register?”",
      "“ผู้เข้าร่วมต้องลงทะเบียนหรือไม่?”"
    ],
    "takeaway": [
      "Add the answer to the shared facts before drafting.",
      "เพิ่มคำยืนยันลงในข้อมูลกลางก่อนเขียน"
    ],
    "notes": [
      "In the scripted demonstration, the organizer replies: no registration is required. Kubo records that confirmation with the source facts and supplies it to both Writer and Checker. This response is fictional teaching data, not a live message. An unresolved required fact would block a publish-ready claim.",
      "ในการสาธิตสมมติ ผู้จัดตอบว่าไม่ต้องลงทะเบียน Kubo บันทึกคำยืนยันร่วมกับข้อมูลต้นทางแล้วให้ทั้ง Writer และ Checker ข้อความนี้เป็นข้อมูลเพื่อการสอน ไม่ใช่คำตอบจากผู้จัดจริง หากข้อมูลจำเป็นยังไม่ชัด ก็ยังอ้างว่าพร้อมเผยแพร่ไม่ได้"
    ],
    "active": [],
    "done": [
      "analyst"
    ],
    "status": "return",
    "handoff": [
      "ORGANIZER → KUBO",
      "ผู้จัด → KUBO"
    ],
    "caption": [
      "Confirmed: no registration required.",
      "ยืนยันแล้ว: ไม่ต้องลงทะเบียน"
    ]
  },
  {
    "id": "draft",
    "chapter": 4,
    "kind": "flow",
    "title": [
      "The writer turns facts into a draft.",
      "Writer เปลี่ยนข้อมูลเป็นร่างประกาศ"
    ],
    "line": [
      "Use the confirmed brief. Keep the message short.",
      "ใช้บรีฟที่ยืนยันแล้ว เขียนให้กระชับ"
    ],
    "takeaway": [
      "Better wording must not become different facts.",
      "ปรับภาษาให้ดีขึ้น โดยไม่เปลี่ยนข้อเท็จจริง"
    ],
    "notes": [
      "Kubo gives Writer the brief, organizer confirmation, fact sheet, audience, and format. Writer returns draft text in a message; it does not send or publish it. A friendly tone is allowed, but extra claims about certificates, limited seats, refreshments or registration deadlines are not supported by the brief.",
      "Kubo ส่งบรีฟ คำยืนยัน ตารางข้อมูล กลุ่มผู้อ่าน และรูปแบบให้ Writer ผู้เขียนตอบกลับเป็นข้อความร่าง ไม่ส่งหรือเผยแพร่ ปรับให้อ่านเป็นมิตรได้ แต่ห้ามเพิ่มเรื่องใบรับรอง จำนวนที่นั่ง อาหาร หรือกำหนดลงทะเบียนที่ไม่มีในบรีฟ"
    ],
    "role": "writer",
    "active": [
      "writer"
    ],
    "done": [
      "analyst"
    ],
    "status": "assign",
    "caption": [
      "Draft a beginner-friendly announcement from these facts.",
      "เขียนประกาศสำหรับผู้เริ่มต้นจากข้อมูลชุดนี้"
    ]
  },
  {
    "id": "check",
    "chapter": 4,
    "kind": "flow",
    "title": [
      "Check the draft against the source.",
      "เทียบร่างประกาศกับต้นทาง"
    ],
    "line": [
      "The checker needs both—not just the writer’s summary.",
      "ผู้ตรวจต้องได้ทั้งสองอย่าง ไม่ใช่แค่สรุปจากผู้เขียน"
    ],
    "takeaway": [
      "Facts first. Draft next. Check the finished draft.",
      "ยืนยันข้อมูลก่อน เขียนร่าง แล้วจึงตรวจร่าง"
    ],
    "notes": [
      "Quality Checker receives the original brief, confirmed registration answer, and current draft. This task has a real dependency: checking that draft must wait until it exists. Do not add artificial parallel agents merely to make the diagram busy. Independent work can be parallelized in another task when inputs and responsibilities allow it.",
      "Quality Checker ได้บรีฟต้นฉบับ คำยืนยันเรื่องลงทะเบียน และร่างปัจจุบัน งานนี้ต้องรอร่างก่อนจึงตรวจได้ ไม่ควรเพิ่มงานคู่ขนานเพียงเพื่อให้แผนภาพดูคึกคัก งานอื่นที่ข้อมูลและหน้าที่เป็นอิสระจึงค่อยทำพร้อมกัน"
    ],
    "role": "checker",
    "active": [
      "checker"
    ],
    "done": [
      "analyst",
      "writer"
    ],
    "status": "assign",
    "caption": [
      "Compare the facts, completeness and wording.",
      "ตรวจความตรงของข้อมูล ความครบ และความชัดเจน"
    ]
  },
  {
    "id": "failure",
    "chapter": 5,
    "kind": "evidence",
    "title": [
      "A polished draft can still be wrong.",
      "ร่างที่อ่านดี ก็ผิดได้"
    ],
    "line": [
      "The date changed from 20 Nov to 21 Nov.",
      "วันที่เปลี่ยนจาก 20 พ.ย. เป็น 21 พ.ย."
    ],
    "takeaway": [
      "Report the mismatch with evidence.",
      "ระบุสิ่งที่ไม่ตรง พร้อมหลักฐาน"
    ],
    "notes": [
      "Show the original date alongside the incorrect line in draft version 1. Quality Checker reports that the date conflicts with the source and asks Kubo to route a repair. A fluent announcement is not evidence of accuracy. The checker does not silently replace the text and hide the error.",
      "แสดงวันที่ต้นทางเทียบกับข้อความผิดในร่างรุ่นที่ 1 Quality Checker แจ้งว่าวันที่ไม่ตรงพร้อมตำแหน่งอ้างอิงให้ Kubo ส่งกลับแก้ ภาษาไพเราะไม่ได้ยืนยันความถูกต้อง ผู้ตรวจไม่ควรแอบแก้จนปัญหาหายจากรายงาน"
    ],
    "ask": [
      "Which date should Kubo trust—and why?",
      "Kubo ควรใช้วันที่ใด เพราะอะไร?"
    ]
  },
  {
    "id": "repair",
    "chapter": 5,
    "kind": "flow",
    "title": [
      "Send the finding back to the writer.",
      "ส่งข้อผิดพลาดกลับให้ผู้เขียน"
    ],
    "line": [
      "Kubo → Writer → corrected draft",
      "Kubo → Writer → ร่างที่แก้ไขแล้ว"
    ],
    "takeaway": [
      "Fix the stated problem without changing confirmed details.",
      "แก้ปัญหาที่ระบุ โดยไม่เปลี่ยนข้อมูลอื่นที่ยืนยันแล้ว"
    ],
    "notes": [
      "Kubo sends the exact mismatch and source reference to Writer: change 21 Nov to 20 Nov and preserve the other confirmed facts. Writer returns version 2. If the sources themselves conflicted, Kubo would ask the organizer rather than choose a date without authority.",
      "Kubo ส่งจุดผิดและต้นทางให้ Writer โดยระบุให้เปลี่ยน 21 พ.ย. เป็น 20 พ.ย. และคงข้อมูลอื่นไว้ Writer ส่งร่างรุ่นที่ 2 กลับมา หากต้นทางขัดกันเอง Kubo ต้องถามผู้จัด ไม่เลือกวันเองโดยไม่มีคำยืนยัน"
    ],
    "role": "writer",
    "active": [
      "writer"
    ],
    "done": [
      "analyst"
    ],
    "status": "fix",
    "caption": [
      "Correct the date to 20 Nov. Preserve all other facts.",
      "แก้วันที่เป็น 20 พ.ย. คงข้อมูลอื่นไว้"
    ]
  },
  {
    "id": "recheck",
    "chapter": 5,
    "kind": "flow",
    "title": [
      "Recheck the corrected draft.",
      "ตรวจร่างที่แก้ไขอีกครั้ง"
    ],
    "line": [
      "Facts match. Details complete. Wording clear.",
      "ข้อมูลตรง รายละเอียดครบ ภาษาเข้าใจง่าย"
    ],
    "takeaway": [
      "The report must describe the latest version.",
      "รายงานต้องตรงกับผลงานรุ่นล่าสุด"
    ],
    "notes": [
      "The checker compares version 2 with the original brief and organizer confirmation. In the teaching example, all three criteria pass: facts match, required information is present, and the wording suits beginners. This is not proof of universal reliability and not authorization to publish. Kubo discloses any remaining uncertainty.",
      "Checker เทียบร่างรุ่นที่ 2 กับบรีฟและคำยืนยันของผู้จัด ในตัวอย่างนี้ผ่าน 3 เกณฑ์ ได้แก่ ข้อมูลตรง รายละเอียดที่จำเป็นครบ และอ่านเข้าใจง่าย ผลนี้ไม่พิสูจน์ความน่าเชื่อถือทุกกรณีและไม่ใช่สิทธิ์เผยแพร่ Kubo ต้องแจ้งข้อที่ยังไม่แน่ชัด"
    ],
    "role": "checker",
    "active": [
      "checker"
    ],
    "done": [
      "analyst",
      "writer"
    ],
    "status": "pass",
    "caption": [
      "Illustrative report: 3 criteria met in draft v2.",
      "รายงานจำลอง: ร่าง v2 ผ่านเกณฑ์ทั้ง 3 ข้อ"
    ]
  },
  {
    "id": "create",
    "chapter": 6,
    "kind": "setup",
    "title": [
      "Ask for a reusable definition.",
      "ขอให้สร้างไฟล์บทบาทที่ใช้ซ้ำได้"
    ],
    "line": [
      "Describe the role, limits and expected report.",
      "ระบุหน้าที่ ขอบเขต และรายงานที่ต้องการ"
    ],
    "takeaway": [
      "AI can draft the file. You review its design.",
      "ให้ AI ร่างไฟล์ได้ แล้วตรวจการออกแบบ"
    ],
    "notes": [
      "The concrete walkthrough uses Claude Code’s file format; the task itself requires no programming. The prompt asks the main assistant to create a specialist definition, not to write this event announcement yet. Inspect the generated name, routing description, tools, method, stop conditions and output contract before using it.",
      "ขั้นตอนนี้ใช้รูปแบบไฟล์ของ Claude Code แต่โจทย์ไม่ต้องเขียนโปรแกรม Prompt นี้ให้ผู้ช่วยหลักสร้างไฟล์บทบาท ยังไม่ใช่ให้เขียนประกาศงานนี้ ตรวจชื่อ เงื่อนไขเรียกใช้ เครื่องมือ วิธีทำงาน เงื่อนไขหยุด และรายงานก่อนใช้จริง"
    ],
    "code": [
      "Create a project subagent: brief-analyst.\nUse it before drafting from event briefs.\nAllow Read, Grep and Glob only.\nReturn facts with sources, gaps and questions.\nNever invent details or modify the source.\nSave it in .claude/agents/.",
      "สร้าง subagent ของโปรเจกต์ชื่อ brief-analyst\nใช้ก่อนเขียนจากบรีฟกิจกรรม\nให้ใช้เฉพาะ Read, Grep และ Glob\nรายงานข้อมูลพร้อมที่มา สิ่งที่ขาด และคำถาม\nห้ามแต่งข้อมูลหรือแก้ต้นทาง\nบันทึกใน .claude/agents/"
    ],
    "caption": [
      "Example request · not executed by this slide",
      "คำขอตัวอย่าง · สไลด์นี้ไม่ได้รันคำสั่ง"
    ]
  },
  {
    "id": "save",
    "chapter": 6,
    "kind": "setup",
    "title": [
      "One file per specialist.",
      "หนึ่งไฟล์ ต่อหนึ่งบทบาท"
    ],
    "line": [
      "Keep event-specific facts in the brief.",
      "เก็บข้อมูลเฉพาะกิจกรรมไว้ในบรีฟ"
    ],
    "takeaway": [
      "Agent definition ≠ current task instructions.",
      "ไฟล์บทบาท ≠ โจทย์ของงานรอบนี้"
    ],
    "notes": [
      "Save the three definitions in the project’s .claude/agents/ folder. Put orchestration guidance in the main conversation or appropriate project instructions after reading what exists; do not blindly overwrite CLAUDE.md. This is platform-specific syntax. Check the installed version’s documentation or restart the session if new definitions are not discovered.",
      "บันทึกสามไฟล์ใน .claude/agents/ ของโปรเจกต์ ส่วนแนวทางประสานงานอยู่ในบทสนทนาหลักหรือคำสั่งโปรเจกต์ โดยอ่านของเดิมก่อน ไม่เขียนทับ CLAUDE.md โดยไม่ตรวจ รูปแบบนี้เฉพาะแพลตฟอร์ม หากยังไม่พบ Agent ใหม่ ให้ตรวจเอกสารรุ่นที่ใช้หรือเริ่ม session ใหม่"
    ],
    "code": [
      "your-project/\n  .claude/agents/\n    brief-analyst.md\n    announcement-writer.md\n    quality-checker.md\n  event-brief.md\n  CLAUDE.md  ← main-session guidance",
      "your-project/\n  .claude/agents/\n    brief-analyst.md\n    announcement-writer.md\n    quality-checker.md\n  event-brief.md\n  CLAUDE.md  ← แนวทางของบทสนทนาหลัก"
    ],
    "caption": [
      "Claude Code example · other platforms may differ",
      "ตัวอย่าง Claude Code · แพลตฟอร์มอื่นอาจต่างกัน"
    ]
  },
  {
    "id": "invoke",
    "chapter": 6,
    "kind": "setup",
    "title": [
      "Give the task to the orchestrator.",
      "ส่งโจทย์ให้ Orchestrator"
    ],
    "line": [
      "The files define helpers. The request starts the work.",
      "ไฟล์กำหนดผู้ช่วย คำขอเริ่มการทำงาน"
    ],
    "takeaway": [
      "Look for real invocations and returned reports.",
      "ดูการเรียกผู้ช่วยและรายงานที่เกิดขึ้นจริง"
    ],
    "notes": [
      "The main session is the orchestrator. Explicit agent names make the first run easier to inspect. Check that the execution actually includes specialist calls and returned reports; a statement that a helper was used is not enough evidence. Missing registration information should produce a question before a publish-ready draft.",
      "บทสนทนาหลักคือ Orchestrator การเรียกชื่อ Agent ตรง ๆ ช่วยตรวจการทำงานครั้งแรก ดูว่ามีการเรียกผู้ช่วยและรายงานกลับจริง การกล่าวว่าใช้ผู้ช่วยแล้วอย่างเดียวไม่พอ ข้อมูลลงทะเบียนที่ขาดควรนำไปสู่คำถามก่อนอ้างว่าร่างพร้อมเผยแพร่"
    ],
    "code": [
      "Prepare an announcement from event-brief.md.\nUse brief-analyst to extract facts and gaps.\nAsk me about missing required details.\nThen use announcement-writer and quality-checker.\nResolve findings and return checked copy.\nDo not send or publish it.",
      "เตรียมประกาศจาก event-brief.md\nให้ brief-analyst สรุปข้อมูลและสิ่งที่ขาด\nถามฉันเมื่อข้อมูลจำเป็นยังไม่ครบ\nจากนั้นใช้ announcement-writer และ quality-checker\nแก้ข้อผิดพลาดแล้วส่งข้อความที่ตรวจแล้ว\nไม่ส่งหรือเผยแพร่ประกาศ"
    ]
  },
  {
    "id": "test-agents",
    "chapter": 6,
    "kind": "compare",
    "title": [
      "Test behavior—not just the file.",
      "ทดสอบพฤติกรรม ไม่ใช่แค่มีไฟล์"
    ],
    "line": [
      "A complete brief. A missing detail. A wrong draft.",
      "บรีฟครบ ข้อมูลขาด และร่างที่ผิด"
    ],
    "takeaway": [
      "Revise the instructions using what you observe.",
      "ปรับคำสั่งจากสิ่งที่สังเกตได้จริง"
    ],
    "notes": [
      "Use three small trials: a complete brief should produce source-faithful copy; missing registration details should produce a question; a deliberately incorrect date should be caught. Test the role boundaries too: Checker reports rather than rewriting, and no specialist publishes. Repeat important cases because one pass does not establish reliability.",
      "ทดลองสามกรณี: บรีฟครบควรได้ข้อความตรงต้นทาง ข้อมูลลงทะเบียนขาดควรมีคำถาม วันที่ผิดในร่างควรถูกตรวจพบ ตรวจขอบเขตด้วยว่า Checker รายงานแทนการเขียนใหม่และไม่มีใครเผยแพร่เอง ทดสอบกรณีสำคัญซ้ำ เพราะผ่านครั้งเดียวไม่ยืนยันความน่าเชื่อถือ"
    ],
    "items": [
      {
        "label": [
          "Complete brief",
          "บรีฟครบ"
        ],
        "value": [
          "Preserves confirmed facts",
          "รักษาข้อมูลที่ยืนยันแล้ว"
        ]
      },
      {
        "label": [
          "Missing detail",
          "ข้อมูลขาด"
        ],
        "value": [
          "Asks instead of guessing",
          "ถาม แทนการเดา"
        ]
      },
      {
        "label": [
          "Wrong date",
          "วันที่ผิด"
        ],
        "value": [
          "Reports, repairs, rechecks",
          "รายงาน แก้ไข ตรวจซ้ำ"
        ]
      }
    ],
    "ask": [
      "What would show that your agent’s boundary works?",
      "พฤติกรรมใดแสดงว่า Agent ทำตามขอบเขต?"
    ]
  },
  {
    "id": "delivery",
    "chapter": 7,
    "kind": "finish",
    "title": [
      "Deliver copy—with a clear status.",
      "ส่งมอบข้อความ พร้อมสถานะที่ชัด"
    ],
    "line": [
      "Checked and ready for organizer approval.",
      "ตรวจแล้ว พร้อมให้ผู้จัดอนุมัติ"
    ],
    "takeaway": [
      "Ready to approve is not already published.",
      "พร้อมอนุมัติ ไม่ได้แปลว่าเผยแพร่แล้ว"
    ],
    "notes": [
      "Kubo returns version 2 and a concise summary of what was checked. The final copy preserves the 20 Nov date, time, Room B, free attendance and confirmed no-registration instruction. The organizer still approves publication. The audience should not need to assemble three specialist conversations to understand the result.",
      "Kubo ส่งร่างรุ่นที่ 2 พร้อมสรุปสิ่งที่ตรวจ ข้อความสุดท้ายคงวันที่ 20 พ.ย. เวลา ห้อง B การเข้าร่วมฟรี และคำยืนยันว่าไม่ต้องลงทะเบียน ผู้จัดยังต้องอนุมัติการเผยแพร่ ผู้ใช้ไม่ควรต้องนำบทสนทนาผู้ช่วยสามคนมารวมเอง"
    ],
    "items": [
      {
        "label": [
          "Delivered",
          "ส่งมอบ"
        ],
        "value": [
          "Corrected announcement · v2",
          "ประกาศที่แก้ไขแล้ว · v2"
        ]
      },
      {
        "label": [
          "Checked",
          "ตรวจแล้ว"
        ],
        "value": [
          "Accuracy, completeness, clarity",
          "ความถูกต้อง ความครบ ความชัด"
        ]
      },
      {
        "label": [
          "Status",
          "สถานะ"
        ],
        "value": [
          "Not sent or published",
          "ยังไม่ส่งหรือเผยแพร่"
        ]
      }
    ]
  },
  {
    "id": "takeaway",
    "chapter": 7,
    "kind": "hub",
    "title": [
      "Define the role. Connect the work.",
      "กำหนดบทบาท เชื่อมต่อการทำงาน"
    ],
    "line": [
      "Definition → assignment → evidence → decision",
      "ไฟล์บทบาท → โจทย์ → หลักฐาน → การตัดสินใจ"
    ],
    "takeaway": [
      "A clear goal. Bounded specialists. One responsible orchestrator.",
      "เป้าหมายชัด ผู้ช่วยมีขอบเขต ผู้ประสานงานรับผิดชอบ"
    ],
    "notes": [
      "Return to the practical aim: learners should understand how to create reusable agent-definition files and coordinate them through a central orchestrator. Ask for another task, a useful specialist, its boundaries and its report. This presentation demonstrates the process but does not assess independent implementation. Offer the sample files for later practice.",
      "กลับสู่เป้าหมายให้ผู้เรียนเข้าใจวิธีสร้างไฟล์ Agent ที่ใช้ซ้ำและประสานงานผ่าน Orchestrator ชวนยกงานอื่น ระบุผู้ช่วย ขอบเขต และรายงานที่ควรได้ การนำเสนอนี้แสดงขั้นตอน แต่ยังไม่ได้ประเมินการลงมือสร้างเอง มีไฟล์ตัวอย่างให้ฝึกต่อภายหลัง"
    ],
    "active": [
      "analyst",
      "writer",
      "checker"
    ],
    "done": [
      "analyst",
      "writer",
      "checker"
    ],
    "ask": [
      "For your own work, what specialist would you define first?",
      "สำหรับงานของคุณ จะเริ่มกำหนดผู้ช่วยบทบาทใดก่อน?"
    ]
  }
];
