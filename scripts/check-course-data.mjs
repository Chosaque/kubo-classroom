// Checks website/guesthouse/course-data.mjs before it ships: every Thai/English
// pair is filled in the right language, and every answer index points at a real option.
// Run: npm run check:course
import {pathToFileURL} from 'node:url';

const KINDS = new Set(['choice','note','multi','retrieve','hide','lookup','tokens','shorten','recipe','permission','transfer']);
const THAI = /[฀-๿]/;

export function checkPair(value, where, problems) {
  if (!Array.isArray(value) || value.length !== 2) return problems.push(`${where}: expected a [Thai, English] pair`);
  const [th, en] = value;
  if (typeof th !== 'string' || !th.trim()) problems.push(`${where}: Thai text is empty`);
  else if (!THAI.test(th)) problems.push(`${where}: Thai text has no Thai characters: "${th.slice(0, 40)}"`);
  if (typeof en !== 'string' || !en.trim()) problems.push(`${where}: English text is empty`);
  else if (THAI.test(en)) problems.push(`${where}: English text contains Thai: "${en.slice(0, 40)}"`);
}

const isIndex = (n, length) => Number.isInteger(n) && n >= 0 && n < length;

export function checkCourse(chapters, tokenTexts) {
  const problems = [];
  const ids = new Set();
  chapters.forEach((chapter, c) => {
    const at = chapter.id || `chapter ${c}`;
    if (!chapter.id) problems.push(`${at}: missing id`);
    else if (ids.has(chapter.id)) problems.push(`${at}: duplicate id`);
    ids.add(chapter.id);
    checkPair(chapter.name, `${at} name`, problems);
    if (!Array.isArray(chapter.beats) || !chapter.beats.length) return problems.push(`${at}: no beats`);
    chapter.beats.forEach((beat, b) => {
      const where = `${at} beat ${b + 1}`;
      if (beat === null) return; // step handled by mission.mjs (QI-01)
      if (!KINDS.has(beat.kind)) problems.push(`${where}: unknown kind "${beat.kind}"`);
      for (const field of ['title', 'story', 'takeaway']) checkPair(beat[field], `${where} ${field}`, problems);
      if (!Array.isArray(beat.options)) return problems.push(`${where}: options is not a list`);
      beat.options.forEach((option, o) => checkPair(option, `${where} option ${o + 1}`, problems));
      const n = beat.options.length, {correct} = beat;
      if (beat.kind === 'multi') {
        if (!Array.isArray(correct) || !correct.length) problems.push(`${where}: multi needs a non-empty list of correct options`);
        else if (new Set(correct).size !== correct.length || !correct.every(i => isIndex(i, n))) problems.push(`${where}: correct ${JSON.stringify(correct)} must be distinct indexes below ${n}`);
      } else if (n === 0) {
        if (correct !== null && correct !== 0) problems.push(`${where}: no options, so correct must be 0 or null, got ${JSON.stringify(correct)}`);
      } else if (correct !== null && !isIndex(correct, n)) problems.push(`${where}: correct ${JSON.stringify(correct)} is not an option index below ${n}`);
    });
  });
  for (const [key, pair] of Object.entries(tokenTexts ?? {})) checkPair(pair, `tokenTexts.${key}`, problems);
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {chapters, tokenTexts} = await import('../website/guesthouse/course-data.mjs');
  const problems = checkCourse(chapters, tokenTexts);
  const beats = chapters.reduce((sum, c) => sum + c.beats.filter(Boolean).length, 0);
  if (problems.length) { console.error(problems.join('\n')); console.error(`\n${problems.length} problem(s) in course-data.mjs`); process.exit(1); }
  console.log(`course-data.mjs OK — ${chapters.length} chapters, ${beats} authored beats`);
}
