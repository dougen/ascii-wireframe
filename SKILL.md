---
name: ascii-wireframe
description: >-
  Draw UI wireframes, screen mockups, page layouts, admin dashboards, dialog
  overlays, terminal UIs, and multi-screen flows as pure-ASCII text diagrams
  that stay aligned in any monospace font. Use whenever the user asks to
  wireframe, sketch, mock up, prototype, or lay out a screen, page, form,
  dashboard, or app view and wants the result as text: "draw the layout",
  "text mockup", "ASCII UI", "terminal UI", "page structure", "wireframe this
  form", "revise this diagram". Also use when an interface diagram has to
  survive being pasted into a README, PR, commit message, code comment, design
  doc, or chat. Produces fenced text blocks rather than images; when the user
  wants a rendered picture, use SVG, HTML, or Mermaid instead.
compatibility: Node.js 18+ to run scripts/canvas.mjs; the drawing rules hold without it.
---

# ASCII Wireframes

A text wireframe fails in a way nobody notices until someone else opens it:
alignment. `┌─┐` advances one column in Consolas and two in SimSun, so a
40-column box drifts a glyph per corner; emoji and arrows differ in every font
that carries them. `+ - |` are ASCII, and every monospace font advances them
exactly one column, so the diagram holds wherever it is read.

## The one rule

**Every glyph inside a diagram is ASCII, U+0020–U+007E.**

- Boxes: `+ - |`. A dialog gets a heavier frame: `+ = |`. Never `┌ ─ │ ╔ ═ ║ ╭ ╮`.
- Symbols: `[x] [ ] (o) ( ) [####----] -> <- [X] ... (12) [JD] [1]`.
- Never emoji, `☑ ☐ ● ○ █ ░ ✓ ✕ → ← ▸ ▾ ▲ ▼`, or any full-width form.
- Never tabs: a tab jumps to a stop, it is not a column.

Rigidity pays here. One stray `→` fails the structural check, and the reader
sees a frame that is one column wrong on every line below it.

### Non-Latin labels

ASCII carries English. When the product's copy is Chinese, Japanese, Korean, or
any other non-Latin script, keep the frame in English and put the localized
strings beside the diagram as a mapping — never inside it, where double-width
glyphs break the grid:

- `Sign In` -> 登录
- `Email` -> 邮箱

The reader gets both the layout and the copy.

## Draw on a grid

Counting columns by eye is where hand-drawn ASCII goes wrong: one dropped space
and every row below it is off. Draw by coordinate instead, borders first and
text second:

```js
import { Canvas } from '<skill-dir>/scripts/canvas.mjs';

const c = new Canvas(58, 22);
c.box(0, 0, 58, 22);            // frame
c.box(14, 3, 30, 3);            // title
c.box(14, 8, 30, 3);            // input
c.text(2, 1, 'ACME');
c.center(14, 4, 30, 'Sign In');
c.text(16, 9, 'you@example.com');

console.log(c.render());
if (c.errors.length > 0) console.error(c.errors);
```

`<skill-dir>` is the directory this SKILL.md came from; substitute the absolute
path. Keep the drawing script in a scratch directory rather than inside the
skill directory, which is often read-only.

`box(x, y, w, h)` treats `w` and `h` as inclusive of the border, so a box at
`(14, 3)` with `w: 30` spans columns 14–43.

| call | effect |
| --- | --- |
| `box(x, y, w, h, opts)` | rectangle; `{ h: '=' }` draws a dialog frame |
| `hline(x1, x2, y)` / `vline(x, y1, y2)` | one rule segment |
| `colGrid(cols, y)` | table rule with a `+` at each column |
| `text(x, y, s)` | left-aligned run |
| `center(x, y, w, s)` | centred in columns x..x+w-1; errors if it does not fit |
| `right(xEnd, y, s)` | right-aligned, last glyph on column xEnd |
| `bars(x0, baseY, heights, width, gap)` | chart columns rising from baseY |
| `render()` | the diagram, trailing blanks stripped |
| `errors` | every conflict in drawing order; empty is the goal |

Two checks run while you draw:

- **Text cannot destroy structure.** `box` marks its cells; a later `text` write
  onto one is recorded in `c.errors` and skipped, so a label that overruns a
  frame shows up instead of quietly shifting the border.
- **Adjacency is checkable.** `c.touchingBoxes()` reports rectangles that share
  an edge with no row or column between them. Stacked cards need a blank row,
  and this is how the one that missed it is found.

## Verify before presenting

```sh
node '<skill-dir>/scripts/canvas.mjs' diagram.txt   # or: < diagram.txt
```

It reports non-ASCII glyphs, tabs, vertical rules that connect to nothing,
corners that touch no line, rows that open a box but never close it, and border
rows whose right edge lands on no corner column. Exit code is 1 on any finding;
`--json` gives the same result to a script.

Two things to know about it:

- **One gap it cannot close.** A divider that stops short of the frame it should
  meet still has a neighbour, so it passes. Look at the diagram and confirm that
  every interior rule reaches both ends before presenting.
- **It judges whole diagrams.** The vocabulary and snippets in this file are
  montages, not screens; verify the finished layout, not the reference blocks.

## Size and spacing

- A diagram is one screen. A multi-step flow becomes several screens in flow
  order, not one crowded sheet.
- Stay at or under 100 columns; a terminal target means 80. If three screens
  side by side would exceed that, stack them or shrink each frame to roughly 28
  columns.
- Leave one blank column between a frame and its content, and one blank row
  between stacked boxes.
- Labels sit above their inputs; the value lives inside the box.
- Centre titles and button labels with `center`; never count spaces by hand.

## Component vocabulary

All ASCII, all one column wide.

```
Frame              +------------------+      Modal         +==================+
                   |                  |                    |                  |
                   +------------------+                    +==================+

Input              +------------------+      Button        [ Primary ]
                   | placeholder...   |                    [ Secondary ]
                   +------------------+                    < Link >

Checkbox           [x] Checked               Radio         (o) Selected
                   [ ] Unchecked                           ( ) Unselected

Toggle             [####] On                 Progress      [########------] 57%
                   [    ] Off

Badge              (12)   [New]              Avatar        (JD)   [IMG]

Tabs               [ Active ]  Inactive      Dropdown      | select...    v |
                   ---------------------

Disclosure         > Collapsed               Arrow         ----->   <-----
                   v Expanded                              <----->

Table rule         +--------+--------+       Bars          #
                   | cell   | cell   |                     ###
                   +--------+--------+                     ###

Callout            [1]  [2]  [3]             Legend        1. Search
                                                           2. Filters
```

A callout marker lives in the frame's margin; the legend sits below the fence.
Brackets make the verifier treat the marker as a label, so it never reports a
false dangling corner.

## Layout patterns

`references/layouts.md` holds the screens worth lifting from: dashboard, data
table, mobile list, dialog over content, annotated review sketch, and a flow
across screens. Read it when the screen is more than a form.

The canonical form screen:

```
+--------------------------------------------------------+
| ACME                                             [?]   |
|                                                        |
|             +----------------------------+             |
|             |           Sign In          |             |
|             +----------------------------+             |
|                                                        |
|             Email                                      |
|             +----------------------------+             |
|             | you@example.com            |             |
|             +----------------------------+             |
|                                                        |
|             Password                                   |
|             +----------------------------+             |
|             | **************             |             |
|             +----------------------------+             |
|             [x] Remember me         Forgot?            |
|             +----------------------------+             |
|             |            Sign In         |             |
|             +----------------------------+             |
|                                                        |
+--------------------------------------------------------+
```

## Workflow

1. **List the regions.** Every box, its label, which boxes nest. A wireframe is
   a plan; settle the plan before typing.
2. **Size the canvas.** Widest content plus a blank column either side, tallest
   content plus a blank row, checked against the 100-column ceiling.
3. **Draw borders first** — `box`, `hline`, `vline`, `colGrid` — so every
   intersection is final before any text exists.
4. **Write text second.** A non-empty `c.errors` means a label overran a frame:
   move it or widen the box, never trim characters.
5. **Verify** with the CLI.
6. **Present** each screen in its own fenced block, diagram alone, with
   annotations and localized copy as a list below the fence.

Revision is cheap: change the coordinates, re-render, verify. Patching the
rendered text by hand is how alignment gets lost.
