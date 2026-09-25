#!/usr/bin/env node
/**
 * Pure-ASCII wireframe canvas and verifier.
 *
 * Every glyph in a diagram must be ASCII (U+0020..U+007E). In any monospace
 * font the ASCII basic set advances exactly one column per character, so a
 * border column computed while authoring still holds on every reader's machine.
 * Non-ASCII glyphs carry no such guarantee: box-drawing characters advance two
 * columns in SimSun and MS Gothic but one in Consolas, geometric shapes land at
 * different widths in every font that has them, and the `monospace` keyword
 * resolves differently per platform. Measured on one Windows host, a 26-column
 * box whose `+` corners were replaced by U+250C corners drifted 156px in SimSun
 * and 0px in Consolas.
 *
 * Drawing is two-phase by construction: `box` marks its cells as border, and a
 * later `text` write onto one records an error instead of clobbering it. That
 * failure is invisible in a hand-drawn diagram — it only shows up as a right
 * border that looks slightly off.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Characters that carry box structure and must connect to their neighbours. */
const STRUCTURAL = new Set(['+', '-', '|', '=']);

/** Ranges used only to name a non-ASCII codepoint in the report. */
const NON_ASCII_KINDS = [
  [0x0300, 0x036f, 'combining mark'],
  [0x1100, 0x115f, 'hangul jamo'],
  [0x2190, 0x21ff, 'arrow'],
  [0x2500, 0x257f, 'box drawing'],
  [0x2580, 0x259f, 'block element'],
  [0x25a0, 0x25ff, 'geometric shape'],
  [0x2600, 0x26ff, 'misc symbol'],
  [0x2700, 0x27bf, 'dingbat'],
  [0x2e80, 0xa4cf, 'CJK'],
  [0xac00, 0xd7a3, 'hangul syllable'],
  [0xf900, 0xfaff, 'CJK compatibility'],
  [0xfe30, 0xfe4f, 'CJK compatibility form'],
  [0xff00, 0xff60, 'fullwidth form'],
  [0xffe0, 0xffe6, 'fullwidth sign'],
  [0x1f300, 0x1faff, 'emoji'],
  [0x20000, 0x3fffd, 'CJK extension'],
];

function kindOf(cp) {
  for (const [lo, hi, name] of NON_ASCII_KINDS) if (cp >= lo && cp <= hi) return name;
  return 'non-ASCII';
}

/**
 * A character grid that refuses to let text destroy structure.
 *
 * Coordinates are 0-based; (0, 0) is the top-left cell. Sizes passed to `box`
 * include the border, so a 20-wide, 3-tall box occupies columns x..x+19.
 */
export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () => Array(width).fill(' '));
    this.border = Array.from({ length: height }, () => Array(width).fill(false));
    /** Every rectangle drawn, as {x, y, w, h}, for later adjacency checks. */
    this.boxes = [];
    /** Every problem found while drawing, in the order encountered. */
    this.errors = [];
  }

  #live(x, y) { return x >= 0 && x < this.width && y >= 0 && y < this.height; }

  /**
   * Write one cell. Border cells may only be rewritten by other border writes;
   * a text write onto one is recorded and dropped.
   */
  #put(x, y, ch, border) {
    if (!this.#live(x, y)) {
      this.errors.push(`out of bounds (${x},${y})`);
      return;
    }
    if (this.border[y][x] && !border) {
      this.errors.push(`text '${ch}' clobbered border at (${x},${y})`);
      return;
    }
    this.cells[y][x] = ch;
    if (border) this.border[y][x] = true;
  }

  /** Horizontal run of `ch` from x1 to x2 inclusive, as border. */
  hline(x1, x2, y, ch = '-') { for (let x = x1; x <= x2; x++) this.#put(x, y, ch, true); }

  /** Vertical run of `ch` from y1 to y2 inclusive, as border. */
  vline(x, y1, y2, ch = '|') { for (let y = y1; y <= y2; y++) this.#put(x, y, ch, true); }

  /** Write a string left to right. Reports (and skips) any cell it cannot take. */
  text(x, y, str) {
    const before = this.errors.length;
    [...str].forEach((ch, i) => this.#put(x + i, y, ch, false));
    if (this.errors.length > before) {
      this.errors.push(`  ^ while writing ${JSON.stringify(str)} at (${x},${y})`);
    }
  }

  /**
   * Rectangle with `+` corners. `h`, `v` and `corner` let a caller draw a modal
   * (`h: '='`) without reaching for non-ASCII.
   */
  box(x, y, w, h, { h: hch = '-', v: vch = '|', corner = '+' } = {}) {
    this.#put(x, y, corner, true);
    this.hline(x + 1, x + w - 2, y, hch);
    this.#put(x + w - 1, y, corner, true);

    this.#put(x, y + h - 1, corner, true);
    this.hline(x + 1, x + w - 2, y + h - 1, hch);
    this.#put(x + w - 1, y + h - 1, corner, true);

    this.vline(x, y + 1, y + h - 2, vch);
    this.vline(x + w - 1, y + 1, y + h - 2, vch);

    this.boxes.push({ x, y, w, h });
  }

  /**
   * Rectangles that touch each other with no blank column or row between them.
   *
   * Two boxes sharing an edge read as one broken shape: the outer frame and an
   * inner card become a single continuous run of `|` or `-`. Authors do this
   * without noticing, because each box is locally correct, and no per-cell write
   * can detect it — the cells themselves are all legal.
   *
   * @returns {{a: object, b: object, side: string}[]} every touching pair.
   */
  touchingBoxes() {
    const touching = [];
    for (let i = 0; i < this.boxes.length; i++) {
      for (let j = i + 1; j < this.boxes.length; j++) {
        const a = this.boxes[i];
        const b = this.boxes[j];
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        const gapX = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
        const gapY = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);

        // Rows overlap -> they can collide horizontally, and vice versa.
        if (overlapY > 0 && gapX === 0) touching.push({ a, b, side: 'vertically adjacent (no column between)' });
        if (overlapX > 0 && gapY === 0) touching.push({ a, b, side: 'horizontally adjacent (no row between)' });
      }
    }
    return touching;
  }

  /**
   * A table rule: `+` at each listed column, `-` between. Separators are drawn
   * after the vertical rules so the `+` wins at every intersection.
   */
  colGrid(cols, y, ch = '-') {
    cols.forEach((x, i) => {
      this.#put(x, y, '+', true);
      if (i < cols.length - 1) this.hline(x + 1, cols[i + 1] - 1, y, ch);
    });
  }

  /** Bar-chart columns growing upward from baseline row `baseY`. */
  bars(x0, baseY, heights, width, gap, ch = '#') {
    heights.forEach((height, i) => {
      const x = x0 + i * gap;
      for (let j = 0; j < height; j++) {
        for (let k = 0; k < width; k++) this.#put(x + k, baseY - j, ch, false);
      }
    });
  }

  /** Trailing blanks are stripped; a border's column, not the line length, is the judge. */
  render() {
    return this.cells.map((row) => row.join('').replace(/ +$/, '')).join('\n');
  }

  toString() { return this.render(); }
}

/**
 * Check one finished diagram.
 *
 * Proves structure, not intent: it cannot know that a box was meant to be 40
 * columns wide, only that what is written hangs together and uses glyphs whose
 * width is font-independent.
 *
 * @param {string} text - the diagram, with or without a trailing newline.
 * @returns {{ok: boolean, nonAscii: object[], tabs: object[], floatingBorders: object[],
 *            danglingCorners: object[], inconsistentRows: object[]}}
 */
export function verify(text) {
  const lines = text.replace(/\n$/, '').split('\n');
  const at = (x, y) => (y >= 0 && y < lines.length && x >= 0 && x < lines[y].length ? lines[y][x] : undefined);

  const nonAscii = [];
  const tabs = [];

  /**
   * Positions sitting inside a `[...]` or `(...)` token. Labels like `[+ New]`,
   * `[x]` and `(o)` legitimately carry structural-looking glyphs that connect to
   * nothing, so connectivity is only judged outside them.
   */
  const inLabel = lines.map((line) => {
    const mask = Array(line.length).fill(false);
    let depth = 0;
    [...line].forEach((ch, x) => {
      if (ch === '[' || ch === '(') { depth += 1; mask[x] = true; }
      else if (ch === ']' || ch === ')') { mask[x] = true; depth = Math.max(0, depth - 1); }
      else mask[x] = depth > 0;
    });
    return mask;
  });
  const label = (x, y) => inLabel[y]?.[x] === true;

  lines.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      const cp = ch.codePointAt(0);
      if (cp > 0x7e || cp < 0x20) {
        if (ch === '\t') tabs.push({ line: y + 1, column: x + 1 });
        else nonAscii.push({ line: y + 1, column: x + 1, char: ch, code: cp, kind: kindOf(cp) });
      }
    });
  });

  // Columns holding a real corner: every right edge of a box is closed by one,
  // so this is the set a border row may legally end on. Corners inside labels
  // are excluded — `[+ New]` must not legalize a genuine misalignment.
  const cornerColumns = new Set();
  lines.forEach((line, y) => {
    [...line].forEach((ch, x) => { if (ch === '+' && !label(x, y)) cornerColumns.add(x); });
  });

  const floatingBorders = [];
  const danglingCorners = [];
  const inconsistentRows = [];
  const missingRightEdge = [];

  lines.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      if (label(x, y)) return;
      if (ch === '|') {
        const up = at(x, y - 1);
        const down = at(x, y + 1);
        // A vertical rule may butt into a corner, continue into another '|', or
        // end at the diagram's own edge.
        const connected = (v) => v === '|' || v === '+' || v === undefined;
        if (!connected(up) && !connected(down)) {
          floatingBorders.push({ line: y + 1, column: x + 1, why: "'|' has no '|' or '+' above or below" });
        }
      }
      if (ch === '+') {
        const neighbours = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
        if (!neighbours.some((n) => n !== undefined && STRUCTURAL.has(n))) {
          danglingCorners.push({ line: y + 1, column: x + 1, why: "'+' touches no '-', '|' or '+'" });
        }
      }
    });

    const trimmed = line.replace(/ +$/, '');
    const last = trimmed[trimmed.length - 1];
    if ((last === '|' || last === '+') && !cornerColumns.has(trimmed.length - 1)) {
      inconsistentRows.push({
        line: y + 1,
        column: trimmed.length,
        why: `row ends on '${last}' at column ${trimmed.length}, which holds no '+' anywhere`,
      });
    }

    // A row that opens a box must close it. Without this, a forgotten right
    // border leaves a row of interior text that ends nowhere in particular, and
    // the diagram looks complete because the row is otherwise well formed.
    if (trimmed.startsWith('|') && last !== '|' && last !== '+') {
      missingRightEdge.push({
        line: y + 1,
        column: trimmed.length,
        why: `row opens with '|' but ends on '${last}' at column ${trimmed.length} instead of a border`,
      });
    }
  });

  const ok = nonAscii.length === 0 && tabs.length === 0
    && floatingBorders.length === 0 && danglingCorners.length === 0
    && inconsistentRows.length === 0 && missingRightEdge.length === 0;

  return { ok, nonAscii, tabs, floatingBorders, danglingCorners, inconsistentRows, missingRightEdge };
}

/** Human-readable rendering of a {@link verify} result. */
export function formatReport(result) {
  const sections = [
    ['non-ASCII glyphs', result.nonAscii, (i) => `line ${i.line}, column ${i.column}: ${JSON.stringify(i.char)} (U+${i.code.toString(16).toUpperCase().padStart(4, '0')}) is a ${i.kind} — width varies by font`],
    ['tabs', result.tabs, (i) => `line ${i.line}, column ${i.column}: tab characters are not columns`],
    ['floating vertical rules', result.floatingBorders, (i) => `line ${i.line}, column ${i.column}: ${i.why}`],
    ['dangling corners', result.danglingCorners, (i) => `line ${i.line}, column ${i.column}: ${i.why}`],
    ['right edges with no corner', result.inconsistentRows, (i) => `line ${i.line}: ${i.why}`],
    ['rows with no closing border', result.missingRightEdge, (i) => `line ${i.line}: ${i.why}`],
  ];
  const out = [];
  for (const [title, items, format] of sections) {
    if (items.length === 0) continue;
    out.push(`${title} (${items.length}):`);
    for (const item of items.slice(0, 20)) out.push(`  ${format(item)}`);
    if (items.length > 20) out.push(`  ...and ${items.length - 20} more`);
  }
  return result.ok ? 'OK: pure ASCII, structurally consistent.' : out.join('\n');
}

function main(argv) {
  const asJson = argv.includes('--json');
  const path = argv.find((a) => !a.startsWith('--'));
  let text;
  try {
    text = path === undefined ? readFileSync(0, 'utf8') : readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`cannot read ${path ?? 'stdin'}: ${error.message}`);
    return 2;
  }
  const result = verify(text);
  console.log(asJson ? JSON.stringify(result, null, 2) : formatReport(result));
  return result.ok ? 0 : 1;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
