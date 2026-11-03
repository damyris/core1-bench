const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../sprint.js");

const course = {id: "core1", domains: {1: {w: 13}, 2: {w: 23}, 3: {w: 25}, 4: {w: 11}, 5: {w: 28}}};
const four = [{id: "a", d: 1, type: "mc"}, {id: "b", d: 2, type: "multi"}, {id: "c", d: 3, type: "order"}, {id: "e", d: 4, type: "input"}];
const defaults = {timeMode: "off", perQSec: 60, perSprintMin: 10, timeStyle: "gentle", qTypes: ["mc", "multi", "order", "input"], mixPreset: "exam", mix: {}};

/* ── selection ── */
test("filters by type", () => {
  const got = S.filterByTypes(four, ["mc", "input"]).map(q => q.type);
  assert.deepEqual(got, ["mc", "input"]);
});

test("empty or junk qTypes means all types", () => {
  assert.equal(S.filterByTypes(four, []).length, 4);
  assert.equal(S.filterByTypes(four, ["bogus"]).length, 4);
  assert.equal(S.filterByTypes(four, undefined).length, 4);
});

test("exam factor is w/20", () => {
  assert.equal(S.domainFactor(5, course, {mixPreset: "exam"}), 1.4);
});

test("even factor is 1", () => {
  for (const d of [1, 2, 3, 4, 5]) assert.equal(S.domainFactor(d, course, {mixPreset: "even"}), 1);
});

test("custom mix is per course; missing course is all 1", () => {
  const st = {mixPreset: "custom", mix: {core1: {2: 0, 3: 2}}};
  assert.equal(S.domainFactor(2, course, st), 0);
  assert.equal(S.domainFactor(3, course, st), 2);
  assert.equal(S.domainFactor(1, course, st), 1);
  const linux = {id: "linux", domains: course.domains};
  assert.equal(S.domainFactor(2, linux, st), 1);
  assert.equal(S.domainFactor(2, course, {mixPreset: "custom"}), 1);
});

test("all domains off falls back to exam", () => {
  const st = {mixPreset: "custom", mix: {core1: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}}};
  assert.equal(S.allDomainsOff(course, st), true);
  assert.equal(S.effectivePreset(course, st), "exam");
  assert.equal(S.domainFactor(5, course, st), 1.4);
  assert.equal(S.allDomainsOff(course, {mixPreset: "custom", mix: {core1: {1: 0}}}), false);
});

test("matchCount excludes off domains and filtered types", () => {
  const qs = [{d: 1, type: "mc"}, {d: 2, type: "mc"}, {d: 2, type: "order"}, {d: 3, type: "input"}];
  assert.equal(S.matchCount(qs, course, {qTypes: ["mc", "input"], mixPreset: "custom", mix: {core1: {2: 0}}}), 2);
});

test("summaryLine defaults is empty", () => {
  assert.equal(S.summaryLine(defaults), "");
});

test("summaryLine composes parts", () => {
  assert.equal(S.summaryLine({...defaults, timeMode: "perQ", perQSec: 60, timeStyle: "strict", qTypes: ["mc", "multi", "input"], mixPreset: "custom"}),
    "60s/q · strict · no ordering · custom mix");
  assert.equal(S.summaryLine({...defaults, timeMode: "perSprint", perSprintMin: 10, timeStyle: "gentle", qTypes: ["mc", "input"], mixPreset: "even"}),
    "10 min sprint · gentle · MC+type-in · even mix");
});

/* ── timer ── */
const run = (t, steps, ms = 1000) => {const ev = []; for (let i = 0; i < steps; i++) {const r = S.timerStep(t, ms, true); t = r.t; ev.push(...r.events)} return {t, ev}};

test("strict perQ times out at the limit", () => {
  const {t, ev} = run(S.createTimer({mode: "perQ", style: "strict", limitMs: 20000}), 20);
  assert.equal(ev.filter(e => e === "warn10").length, 1);
  assert.equal(ev.at(-1), "timeout");
  assert.equal(t.done, true);
  assert.equal(t.running, false);
});

test("warn30 only when the limit is above 30 s", () => {
  assert.ok(!run(S.createTimer({mode: "perQ", style: "strict", limitMs: 20000}), 25).ev.includes("warn30"));
  assert.equal(run(S.createTimer({mode: "perQ", style: "strict", limitMs: 60000}), 60).ev.filter(e => e === "warn30").length, 1);
});

test("gentle emits over once and keeps counting", () => {
  const {t, ev} = run(S.createTimer({mode: "perQ", style: "gentle", limitMs: 2000}), 5);
  assert.deepEqual(ev, ["over"]);
  assert.equal(S.timerLeft(t), -3000);
  assert.equal(t.running, true);
  assert.equal(t.done, false);
});

test("clamps a huge elapsed jump", () => {
  assert.equal(S.timerStep(S.createTimer({mode: "perSprint", style: "strict", limitMs: 60000}), 60000, true).t.usedMs, 1000);
});

test("paused while hidden", () => {
  const t = S.createTimer({mode: "perQ", style: "strict", limitMs: 20000});
  const r = S.timerStep(t, 1000, false);
  assert.equal(r.t.usedMs, 0);
  assert.deepEqual(r.events, []);
});

test("no time passes and no events once stopped", () => {
  const t = S.stopTimer(S.createTimer({mode: "perQ", style: "strict", limitMs: 1000}));
  const r = S.timerStep(t, 5000, true);
  assert.deepEqual(r.events, []);
  assert.equal(r.t.usedMs, 0);
  assert.equal(S.resumeTimer(r.t).running, true);
});

test("timerStep does not mutate its input", () => {
  const t = S.createTimer({mode: "perQ", style: "strict", limitMs: 20000});
  S.timerStep(t, 1000, true);
  assert.equal(t.usedMs, 0);
});

test("resetForQuestion clears state", () => {
  const done = run(S.createTimer({mode: "perQ", style: "strict", limitMs: 2000}), 3).t;
  assert.equal(S.resumeTimer(done).running, false);
  const t = S.resetForQuestion(done);
  assert.equal(t.usedMs, 0);
  assert.equal(t.done, false);
  assert.equal(t.running, true);
  assert.equal(t.over, false);
  assert.deepEqual(t.warned, {w30: false, w10: false});
});

test("fmtClock formats", () => {
  assert.equal(S.fmtClock(42000), "0:42");
  assert.equal(S.fmtClock(125000), "2:05");
  assert.equal(S.fmtClock(-12000), "+0:12");
  assert.equal(S.fmtClock(0), "0:00");
  assert.equal(S.fmtClock(41200), "0:42");
});

test("clockText never shows overtime for strict or lightning", () => {
  const strict = run(S.createTimer({mode: "perQ", style: "strict", limitMs: 2000}), 3).t;
  assert.equal(S.clockText({...strict, usedMs: 2400}), "0:00");
  const gentle = run(S.createTimer({mode: "perQ", style: "gentle", limitMs: 2000}), 3).t;
  assert.equal(S.clockText(gentle), "+0:01");
  const light = S.createTimer({mode: "lightning", style: "strict", limitMs: 60000});
  assert.equal(S.clockText({...light, usedMs: 1500}), "59s");
  assert.equal(S.clockText({...light, usedMs: 61000}), "0s");
});

/* ── final-review fixes ── */
test("strict timeout caps usedMs at the limit (no 10:01 for a 10 min sprint)", () => {
  const t = S.createTimer({mode: "perSprint", style: "strict", limitMs: 2000});
  const r = S.timerStep(S.timerStep(S.timerStep(t, 1000, true).t, 950, true).t, 100, true);
  assert.deepEqual(r.events, ["timeout"]);
  assert.equal(r.t.usedMs, 2000);
  assert.equal(S.fmtClock(r.t.usedMs), "0:02");
});

test("timerView: strict time-out shows an empty, non-pulsing bar", () => {
  const done = run(S.createTimer({mode: "perQ", style: "strict", limitMs: 20000}), 20).t;
  assert.deepEqual(S.timerView(done), {pct: 0, cls: "", text: "0:00"});
  const gentle = run(S.createTimer({mode: "perQ", style: "gentle", limitMs: 2000}), 3).t;
  assert.equal(S.timerView(gentle).pct, 100);
  assert.equal(S.timerView(gentle).cls, "over");
  const warn = run(S.createTimer({mode: "perQ", style: "strict", limitMs: 20000}), 12).t;
  assert.equal(S.timerView(warn).cls, "warn");
  assert.equal(S.timerView(warn).pct, 40);
  const light = run(S.createTimer({mode: "lightning", style: "strict", limitMs: 60000}), 55).t;
  assert.equal(S.timerView(light).cls, "");
});

test("unreachedCount ignores queued comebacks of questions already seen", () => {
  const queue = [{comeback: false}, {comeback: false}, {comeback: false}, {comeback: false}, {comeback: true}];
  assert.equal(S.unreachedCount(queue, 2), 2);
  assert.equal(S.unreachedCount(queue, 5), 0);
});

test("onlyMatchText pluralises", () => {
  assert.equal(S.onlyMatchText(1), "Only 1 question matches your setup");
  assert.equal(S.onlyMatchText(8), "Only 8 questions match your setup");
});

test("narrowed is false for defaults and for domain/topic sprints with default types", () => {
  assert.equal(S.narrowed(course, defaults, true), false);
  assert.equal(S.narrowed(course, {...defaults, mixPreset: "even"}, true), false);
  assert.equal(S.narrowed(course, {...defaults, qTypes: ["mc"]}, false), true);
  assert.equal(S.narrowed(course, {...defaults, mixPreset: "custom", mix: {core1: {2: 0}}}, true), true);
  assert.equal(S.narrowed(course, {...defaults, mixPreset: "custom", mix: {core1: {2: 0}}}, false), false);
  assert.equal(S.narrowed(course, {...defaults, mixPreset: "custom", mix: {core1: {2: 2}}}, true), false);
});

test("keepGen drops drill kinds in domains the mix turns off", () => {
  const kinds = [{d: 1}, {d: 2}, {d: 3}];
  const st = {mixPreset: "custom", mix: {core1: {2: 0, 3: 0}}};
  assert.deepEqual(S.keepGen(kinds, course, st, true), [{d: 1}]);
  assert.equal(S.keepGen(kinds, course, st, false).length, 3);
});

test("summaryMsg never says clean sweep when time ran out first", () => {
  assert.equal(S.summaryMsg({right: 0, total: 0, missed: 0, fixed: 0, unreached: 10}), "Time ran out before the first answer.");
  assert.equal(S.summaryMsg({right: 2, total: 2, missed: 0, fixed: 0, unreached: 8}), "Time ran out after 2 answers. 2 right.");
  assert.equal(S.summaryMsg({right: 1, total: 1, missed: 0, fixed: 0, unreached: 3}), "Time ran out after 1 answer. 1 right.");
  assert.equal(S.summaryMsg({right: 3, total: 3, missed: 0, fixed: 0, unreached: 0}), "Clean sweep.");
  assert.equal(S.summaryMsg({right: 1, total: 3, missed: 2, fixed: 1, unreached: 0}), "You missed 2 and fixed 1 on the comeback.");
  assert.equal(S.summaryMsg({right: 1, total: 3, missed: 2, fixed: 0, unreached: 0}), "2 to review below.");
});
