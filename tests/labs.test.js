const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../labs.js");

const BUCKETS = {
  kind: "buckets", task: "Sort them",
  buckets: ["Video", "Storage", "Network"],
  items: [
    { t: "HDMI", b: 0, x: "HDMI carries video." },
    { t: "SATA", b: 1, x: "SATA connects drives." },
    { t: "RJ45", b: 2, x: "RJ45 is Ethernet." },
    { t: "DisplayPort", b: 0, x: "DisplayPort carries video." },
  ],
};

const CONFIG = {
  kind: "config", task: "Configure it",
  rows: [
    [{ type: "select", label: "Security", o: ["WEP", "WPA2", "WPA3"], a: 2, x: "WPA3 is strongest." }],
    [{ type: "text", label: "Gateway", ans: ["192.168.1.1"], x: "The router's LAN IP." }],
    [{ type: "check", label: "WPS", a: false, x: "WPS is weak." }, { type: "check", label: "Firewall", a: true, x: "Keep it on." }],
  ],
};

const DIAGRAM = {
  kind: "diagram", task: "Label it", art: "board",
  labels: ["DIMM", "CPU", "PCIe", "Decoy"],
  slots: [
    { n: 1, x: 10, y: 10, a: 0, why: "Memory slot." },
    { n: 2, x: 20, y: 10, a: 0, why: "Another memory slot." },
    { n: 3, x: 30, y: 30, a: 1, why: "The socket." },
  ],
};

const DIAGRAMS = { board: { svg: "<svg><title>b</title></svg>", w: 100, h: 100 } };

const lab = (over = {}) => Object.assign({
  id: "lab:core1:t", c: "core1", d: 1, title: "T", scenario: "S",
  parts: [BUCKETS, CONFIG, DIAGRAM],
}, over);

const clone = o => JSON.parse(JSON.stringify(o));
const fill = (answer, pairs) => pairs.reduce((a, [k, v]) => L.place(a, k, v), answer);

test("norm trims, collapses spaces and lower-cases", () => {
  assert.equal(L.norm("  255.255.255.0 "), "255.255.255.0");
  assert.equal(L.norm("RWX"), "rwx");
  assert.equal(L.norm("a   b"), "a b");
  assert.equal(L.norm(undefined), "");
  assert.equal(L.norm(null), "");
});

test("place and unplace return new objects and never mutate", () => {
  const a = L.emptyAnswer(BUCKETS);
  assert.deepEqual(a, {});
  const b = L.place(a, 0, 1);
  assert.notEqual(a, b);
  assert.deepEqual(a, {});
  assert.deepEqual(b, { 0: 1 });
  const c = L.unplace(b, 0);
  assert.notEqual(b, c);
  assert.deepEqual(b, { 0: 1 });
  assert.deepEqual(c, {});
});

test("buckets: all right scores full points", () => {
  const a = fill({}, [[0, 0], [1, 1], [2, 2], [3, 0]]);
  const r = L.gradePart(BUCKETS, a);
  assert.equal(r.points, 4);
  assert.equal(r.max, 4);
  assert.ok(r.marks.every(m => m.ok));
});

test("buckets: one wrong gives partial credit and names the right bucket", () => {
  const a = fill({}, [[0, 0], [1, 2], [2, 2], [3, 0]]);
  const r = L.gradePart(BUCKETS, a);
  assert.equal(r.points, 3);
  const m = r.marks.find(m => m.key === 1);
  assert.equal(m.ok, false);
  assert.equal(m.correct, "Storage");
  assert.equal(m.x, "SATA connects drives.");
});

test("buckets: unplaced counts as wrong and ready needs every item", () => {
  const a = fill({}, [[0, 0], [1, 1], [2, 2]]);
  assert.equal(L.ready(BUCKETS, a), false);
  assert.equal(L.gradePart(BUCKETS, a).points, 3);
  assert.equal(L.ready(BUCKETS, L.place(a, 3, 0)), true);
});

test("config: keys, ready and field grading", () => {
  assert.deepEqual(L.keysOf(CONFIG), ["0.0", "1.0", "2.0", "2.1"]);
  assert.equal(L.ready(CONFIG, {}), true);
  const untouched = L.gradePart(CONFIG, {});
  assert.equal(untouched.max, 4);
  // untouched select and blank text are wrong; untouched check matches a:false
  assert.equal(untouched.marks.find(m => m.key === "0.0").ok, false);
  assert.equal(untouched.marks.find(m => m.key === "1.0").ok, false);
  assert.equal(untouched.marks.find(m => m.key === "2.0").ok, true);
  assert.equal(untouched.marks.find(m => m.key === "2.1").ok, false);
  const a = fill({}, [["0.0", 2], ["1.0", " 192.168.1.1 "], ["2.1", true]]);
  const r = L.gradePart(CONFIG, a);
  assert.equal(r.points, 4);
});

test("config: correct text shows option, first answer and on/off", () => {
  const r = L.gradePart(CONFIG, fill({}, [["0.0", 0], ["1.0", "10.0.0.1"], ["2.0", true]]));
  const by = k => r.marks.find(m => m.key === k);
  assert.equal(by("0.0").correct, "WPA3");
  assert.equal(by("1.0").correct, "192.168.1.1");
  assert.equal(by("2.0").correct, "off");
  assert.equal(by("2.1").correct, "on");
});

test("config: text accepts any listed equivalent form, case-insensitively", () => {
  const p = { kind: "config", task: "t", rows: [[{ type: "text", label: "Mask", ans: ["255.255.255.0", "/24"], x: "x" }], [{ type: "text", label: "Perm", ans: ["rwx"], x: "x" }]] };
  const r = L.gradePart(p, { "0.0": "/24", "1.0": "RWX" });
  assert.equal(r.points, 2);
  assert.equal(L.gradePart(p, { "0.0": "   " }).marks[0].ok, false);
});

test("diagram: a label reused in two slots, decoys and ready", () => {
  assert.deepEqual(L.keysOf(DIAGRAM), [0, 1, 2]);
  const ok = fill({}, [[0, 0], [1, 0], [2, 1]]);
  assert.equal(L.gradePart(DIAGRAM, ok).points, 3);
  const decoy = fill({}, [[0, 0], [1, 0], [2, 3]]);
  const r = L.gradePart(DIAGRAM, decoy);
  assert.equal(r.points, 2);
  const m = r.marks[2];
  assert.equal(m.ok, false);
  assert.equal(m.correct, "CPU");
  assert.equal(m.x, "The socket.");
  assert.equal(L.ready(DIAGRAM, fill({}, [[0, 0], [1, 0]])), false);
  assert.equal(L.ready(DIAGRAM, ok), true);
});

test("labScore sums first checks and rounds", () => {
  assert.deepEqual(L.labScore([{ points: 3, max: 4 }, { points: 2, max: 2 }]), { points: 5, max: 6, pct: 83 });
  assert.deepEqual(L.labScore([]), { points: 0, max: 0, pct: 0 });
});

test("validateLab accepts a valid lab", () => {
  assert.deepEqual(L.validateLab(lab(), DIAGRAMS), []);
});

test("validateLab reports each problem", () => {
  const has = (l, s) => {
    const p = L.validateLab(l, DIAGRAMS);
    assert.ok(p.length > 0, "expected problems for " + s);
    assert.ok(p.some(m => m.includes(s)), `expected "${s}" in ${JSON.stringify(p)}`);
  };
  has(lab({ id: "" }), "(no id)");
  has(lab({ title: "" }), "title");
  has(lab({ c: "net+" }), "course");
  has(lab({ parts: [] }), "parts");
  has(lab({ parts: [BUCKETS, BUCKETS, BUCKETS, BUCKETS] }), "parts");
  has(lab({ parts: [{ kind: "match", task: "t" }] }), "kind");
  const b = clone(BUCKETS); b.items[0].b = 3;
  has(lab({ parts: [b] }), "bucket");
  const c = clone(CONFIG); c.rows[0][0].a = 3;
  has(lab({ parts: [c] }), "select");
  const t = clone(CONFIG); t.rows[1][0].ans = [];
  has(lab({ parts: [t] }), "text");
  const s = clone(DIAGRAM); s.slots[0].a = 4;
  has(lab({ parts: [s] }), "slot");
  const n = clone(DIAGRAM); n.art = "nope";
  has(lab({ parts: [n] }), "art");
});

test("validateLab messages start with the lab id", () => {
  const p = L.validateLab(lab({ c: "net+" }), DIAGRAMS);
  assert.ok(p[0].startsWith("lab:core1:t"));
});

test("validateAll drops duplicate ids and invalid labs", () => {
  const bad = lab({ id: "lab:core1:bad", c: "net+" });
  const r = L.validateAll([lab(), lab(), bad], DIAGRAMS);
  assert.equal(r.valid.length, 1);
  assert.ok(r.problems.some(m => m.includes("lab:core1:t") && m.includes("duplicate")));
  assert.ok(r.problems.some(m => m.includes("lab:core1:bad")));
});

/* shipped content */
const { LABS, DIAGRAMS: ART } = require("../labs-data.js");

test("every shipped lab passes validation", () => {
  assert.deepEqual(L.validateAll(LABS, ART).problems, []);
});

test("each course ships exactly 4 labs with every kind covered", () => {
  for (const c of ["core1", "core2", "linux"]) {
    const labs = LABS.filter(l => l.c === c);
    assert.equal(labs.length, 4, c);
    const kinds = new Set(labs.flatMap(l => l.parts.map(p => p.kind)));
    for (const k of ["buckets", "config", "diagram"]) assert.ok(kinds.has(k), c + " lacks " + k);
    labs.forEach(l => assert.ok(l.parts.length >= 1 && l.parts.length <= 3, l.id));
  }
});

test("diagrams have a title and no hard-coded colours", () => {
  for (const [name, d] of Object.entries(ART)) {
    assert.ok(d.svg.includes("<title>"), name);
    assert.doesNotMatch(d.svg, /#[0-9a-f]{3,6}\b/i, name);
    assert.ok(d.w > 0 && d.h > 0, name);
  }
});

test("every gradable element has an explanation", () => {
  for (const lab of LABS) for (const p of lab.parts) {
    const xs = p.kind === "buckets" ? p.items.map(i => i.x)
      : p.kind === "diagram" ? p.slots.map(s => s.why)
      : p.rows.flat().map(f => f.x);
    xs.forEach((x, i) => assert.ok(typeof x === "string" && x.trim(), `${lab.id} ${p.kind} #${i}`));
  }
});

test("part sizes stay within the format limits", () => {
  for (const lab of LABS) for (const p of lab.parts) {
    if (p.kind === "buckets") {
      assert.ok(p.buckets.length >= 2 && p.buckets.length <= 5, lab.id);
      assert.ok(p.items.length >= 4 && p.items.length <= 10, lab.id);
    } else if (p.kind === "config") {
      const n = p.rows.flat().length;
      assert.ok(n >= 4 && n <= 10, lab.id + " has " + n + " fields");
    } else {
      assert.ok(p.slots.length >= 5 && p.slots.length <= 9, lab.id);
      const used = new Set(p.slots.map(s => s.a));
      assert.ok(p.labels.length - used.size >= 2, lab.id + " needs 2+ decoys");
    }
  }
});

/* review fixes */
test("an untouched check field with init:true counts as on", () => {
  const p = { kind: "config", task: "t", rows: [[chkOf("WPS enabled", false, true)], [chkOf("Firewall", true, true)]] };
  const r = L.gradePart(p, {});
  assert.equal(r.marks[0].ok, false, "WPS starts on, so leaving it is wrong");
  assert.equal(r.marks[1].ok, true, "firewall starts on and should be on");
  assert.equal(L.gradePart(p, { "0.0": false }).marks[0].ok, true);
});
function chkOf(label, a, init) { return { type: "check", label, a, x: "x", init }; }

test("malformed labs are reported, not thrown", () => {
  const bad = [
    lab({ id: "lab:core1:a", parts: [{ kind: "buckets", task: "t", buckets: ["A", "B"], items: [null] }] }),
    lab({ id: "lab:core1:b", parts: [{ kind: "config", task: "t", rows: [{ type: "check", label: "x", a: true, x: "x" }] }] }),
    lab({ id: "lab:core1:c", parts: [{ kind: "config", task: "t", rows: [[null]] }] }),
    lab({ id: "lab:core1:d", parts: [Object.assign(clone(DIAGRAM), { slots: [null] })] }),
    lab({ id: "lab:core1:e", parts: [Object.assign(clone(DIAGRAM), { art: "toString" })] }),
    lab({ id: "lab:core1:f", parts: [Object.assign(clone(BUCKETS), { items: [] })] }),
    null,
  ];
  let r;
  assert.doesNotThrow(() => { r = L.validateAll(bad, DIAGRAMS); });
  assert.equal(r.valid.length, 0);
  for (const id of ["a", "b", "c", "d", "e", "f"]) assert.ok(r.problems.some(m => m.startsWith("lab:core1:" + id)), id);
});

test("shipped 'turn it off' checkboxes start on", () => {
  const inits = LABS.flatMap(l => l.parts).filter(p => p.kind === "config").flatMap(p => p.rows.flat())
    .filter(f => f.type === "check" && /WPS|Remote management|Guest account|AutoRun/.test(f.label));
  assert.equal(inits.length, 4);
  inits.forEach(f => assert.equal(f.init, true, f.label));
});
