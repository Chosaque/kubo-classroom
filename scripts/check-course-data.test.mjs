import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters, tokenTexts} from '../website/guesthouse/course-data.mjs';
import {checkCourse} from './check-course-data.mjs';

const copy = () => structuredClone(chapters);
const firstBeat = (data, kind) => data.flatMap(c => c.beats).find(b => b?.kind === kind);

test('the shipped course data passes', () => {
  assert.deepEqual(checkCourse(chapters, tokenTexts), []);
});

test('an answer index past the last option fails', () => {
  const data = copy();
  const beat = firstBeat(data, 'choice');
  beat.correct = beat.options.length;
  assert.match(checkCourse(data, tokenTexts).join('\n'), /is not an option index/);
});

test('a multi answer pointing outside its options fails', () => {
  const data = copy();
  firstBeat(data, 'multi').correct = [0, 9];
  assert.match(checkCourse(data, tokenTexts).join('\n'), /distinct indexes/);
});

test('English left in the Thai slot fails', () => {
  const data = copy();
  data[1].name = ['Current context', 'Current context'];
  assert.match(checkCourse(data, tokenTexts).join('\n'), /Thai text has no Thai characters/);
});

test('an empty English translation fails', () => {
  const data = copy();
  firstBeat(data, 'choice').takeaway[1] = ' ';
  assert.match(checkCourse(data, tokenTexts).join('\n'), /English text is empty/);
});

test('a duplicate chapter id fails', () => {
  const data = copy();
  data[2].id = data[1].id;
  assert.match(checkCourse(data, tokenTexts).join('\n'), /duplicate id/);
});

test('an unknown beat kind fails', () => {
  const data = copy();
  firstBeat(data, 'choice').kind = 'quiz';
  assert.match(checkCourse(data, tokenTexts).join('\n'), /unknown kind "quiz"/);
});
