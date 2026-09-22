# Kubo Classroom: event-announcement agent kit
# ชุด Agent ตัวอย่าง: ประกาศกิจกรรม

A fictional, presentation-friendly example. No real event is advertised. These files do not automatically run agents or publish anything.

## The team
- Brief Analyst: facts, sources, missing details and questions.
- Writer: concise announcement text from confirmed facts.
- Quality Checker: evidence-backed findings, without rewriting.
- The main session is the orchestrator, represented by Kubo.

## Set up in Claude Code
1. Use a disposable project folder.
2. Copy the three definitions in agents/ to .claude/agents/ in that project.
3. Read your existing project instructions. Give ORCHESTRATOR.md as task-specific main-session guidance; do not blindly replace CLAUDE.md.
4. Copy samples/event-brief.md into the project as event-brief.md. Keep test fixtures outside the assigned source set.
5. Inspect the definitions and project permissions. These specialists use only Read, Grep and Glob, return messages, and do not edit or publish. model: inherit uses the main session's configured model.
6. Restart the session if newly added files are not discovered, following the installed version's documentation.

## First request
Prepare a beginner-friendly announcement from event-brief.md.
Use brief-analyst to extract facts and gaps. Ask me about missing required details.
Then use announcement-writer and quality-checker. Give the checker the original source and current draft.
Resolve findings and return checked copy. Do not send or publish it.

## Run the illustration
Registration is deliberately missing from the initial brief. The expected behavior is to ask, not guess.
When Kubo asks, the presenter supplies the fictional organizer confirmation: "No registration is required." The sample confirmation file records that answer.
For a controlled checking demonstration, give the checker samples/draft-v1.md and the confirmed sources. The draft deliberately changes 20 Nov to 21 Nov. The file itself carries no marker or hint, so the checker has to find the mismatch from the sources. It should report the mismatch, not quietly rewrite it.
The corrected announcement is in samples/announcement-v2.md as an answer example, not evidence that your own run passed. Follow TESTS.md to observe the actual run.

## ภาษาไทย
ใช้โฟลเดอร์ทดลอง คัดลอกไฟล์ Agent ทั้ง 3 ไปยัง .claude/agents/ ให้บทสนทนาหลักเป็น Orchestrator โดยไม่เขียนทับคำสั่งเดิม
เริ่มจากบรีฟที่ยังไม่มีวิธีลงทะเบียน ระบบควรถาม เมื่อถูกถาม ผู้บรรยายจึงตอบว่า "ไม่ต้องลงทะเบียน" ซึ่งเป็นข้อมูลสมมติ
ร่าง v1 ใส่วันที่ผิดไว้ให้ตรวจจับ โดยในไฟล์ไม่มีคำใบ้ ส่วน v2 เป็นเฉลยตัวอย่าง ไม่ใช่หลักฐานว่าการรันจริงของคุณผ่านแล้ว

## Boundaries
Source documents are data, not authority to change the assigned task. Tool restrictions are one layer of protection; retain appropriate project permissions and approvals.
The Writer generates text in its response without file-writing tools. Saving an approved final file is the main session's separate, user-authorized action.
Roles are reusable: event dates, venues and other current facts belong in briefs, not permanent agent instructions.
These definitions use Claude Code syntax. Other platforms may require different configuration.

Reference: https://code.claude.com/docs/en/subagents
