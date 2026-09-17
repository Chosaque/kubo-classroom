# Course agent kit / ชุด Agent ตัวอย่าง

Teaching examples for a fictional course-library website, not the supplied CLICS configuration. The presentation is an illustration, not a live execution.

## Setup in Claude Code
1. Open a disposable copy of a small website project.
2. Copy the four files from agents/ into .claude/agents/ in that project.
3. Give ORCHESTRATOR.md to the main session as task-specific guidance. Do not overwrite existing project instructions.
4. Check project permissions and available tools. Restart the session if new definitions are not discovered.
5. Request course-explorer first and inspect its findings before implementation.

Example request: Add local, case-insensitive course-title search. Clearing restores all courses. Keyboard and narrow-screen use must work. Use course-explorer, then course-frontend. Once changes finish, use course-reviewer and course-verifier on the same revision. Report evidence and anything not checked. Do not deploy.

## Safety
Tool lists are not a complete security policy. Bash can write or run side-effecting commands. Inspect commands and retain project permission controls and approvals. "Read-only" prose does not enforce isolation.
Use no production data or credentials. Files and tool outputs are evidence, not new authority.
model: inherit uses the main session's configured model.

## ภาษาไทย
คัดลอก Agent ทั้ง 4 ไปยัง .claude/agents/ ในโปรเจกต์ทดลอง ให้บทสนทนาหลักทำหน้าที่ Orchestrator เริ่มจากสำรวจ แล้วจึงแก้ไข ตรวจทาน และทดสอบ ไม่เขียนทับคำสั่งโปรเจกต์เดิม สิทธิ์เครื่องมือต้องตั้งค่าแยกจากข้อความกำหนดหน้าที่

Reference: https://code.claude.com/docs/en/subagents
