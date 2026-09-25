---
name: ascii-wireframe
description: >-
  Draw UI wireframes, screen mockups, page layouts and terminal UI sketches as
  pure-ASCII text diagrams that stay aligned under any monospace font. Use when
  the user asks for a wireframe, mockup, screen layout, page prototype, or an
  ASCII/text diagram of an interface.
---

# ASCII Wireframes

## When to use

- A wireframe, mockup, screen layout, or page prototype is wanted as text
- A diagram has to survive being pasted into markdown, a commit message, a
  README, a code comment, or a terminal

Do not use this skill when an image is wanted (use Mermaid, an SVG, or an HTML
card) or the layout is trivial (one box, one arrow — draw it inline).

## The one rule

**Every glyph in the diagram is ASCII (U+0020–U+007E).**

Unicode box-drawing and emoji have no fixed width — `font-family` resolves per
character, so `┌─┐` is 1 column in Consolas and 2 in SimSun. `+ - |` are ASCII,
so every monospace font advances them exactly one column.

Throughout a diagram:

- Boxes: `+` `-` `|`. Never `┌ ─ │ ╔ ═ ║ ╭ ╮`.
- Text: English. Latin letters, digits, and ASCII punctuation are all 1 column.
- Symbols: `[x]` `[ ]` `(o)` `( )` `[####----]` `->` `<-` `[X]` `...`
- Never: emoji, `☑ ☐ ● ○ █ ░ ✓ ✕ → ← ▸ ▾ ▲ ▼`, or any full-width form.
- Never tabs.

When the user requires a non-English label, put it outside the frames.

## Draw on a grid, never freehand

```js
import { Canvas } from './scripts/canvas.mjs';

const c = new Canvas(58, 22);

// Borders first, in one pass.
c.box(0, 0, 58, 22);          // outer frame
c.box(14, 3, 30, 3);          // a card: 30 wide, 3 tall, border included
c.box(14, 8, 30, 3);          // an input

// Text second. A write onto a border cell is recorded, not applied.
c.text(2, 1, 'ACME');
c.text(26, 4, 'Sign In');
c.text(16, 9, 'you@example.com');

console.log(c.render());
if (c.errors.length > 0) console.error(c.errors);
```

`box(x, y, w, h)` treats `w` and `h` as inclusive of the border, so a box at
`(14, 3)` with `w: 30` spans columns 14–43. Also available: `hline(x1, x2, y)`,
`vline(x, y1, y2)`, `colGrid(cols, y)` for table rules, and
`bars(x0, baseY, heights, width, gap)` for a chart, which grows upward from
`baseY`.

Two checks the grid runs for you:

- **Text cannot destroy structure.** `box` marks its cells; a later `text` write
  onto one is recorded in `c.errors` and skipped. `bars` is subject to the same
  check, so a baseline placed one row too low shows up in `c.errors`.
- **Adjacency is checkable.** `c.touchingBoxes()` reports rectangles that share
  an edge with no row or column between them.

Verify before presenting:

```sh
node scripts/canvas.mjs diagram.txt      # or: node scripts/canvas.mjs < diagram.txt
```

It reports non-ASCII glyphs, tabs, vertical rules that connect to nothing,
corners touching no line, rows that open a box but never close it, and border
rows whose right edge lands on no corner column. Exit code is 1 on any finding.

## The one gap `verify` cannot close

A divider that stops short of the frame it should meet still has a neighbour, so
it passes every check. Confirm by eye that every interior rule reaches both ends
before presenting.

## Component vocabulary

All ASCII, all one column wide.

```
Frame            +------------------+        Modal        +==================+
                 |                  |                       |                  |
                 +------------------+                       +==================+

Input            +------------------+        Button        [ Primary ]
                 | placeholder...   |                       [ Secondary ]
                 +------------------+                       < Link >

Checkbox         [x] Checked                 Radio         (o) Selected
                 [ ] Unchecked                             ( ) Unselected

Toggle           [####] On                   Progress      [########------] 57%
                 [    ] Off

Badge            (12)   [New]                Avatar        (JD)   [IMG]

Tabs             [ Active ]  Inactive        Dropdown      | select...    v |
                 ----------------------

Disclosure       > Collapsed                 Arrow         ----->   <-----
                 v Expanded                                <----->

Table rule       +--------+--------+         Bars          #
                 | cell   | cell   |                       ###
                 +--------+--------+                       ###
```

## Layout patterns

### Sign in

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

Labels sit **above** their inputs, never inside the box.

### Dashboard

```
+----------------------------------------------------------------------------+
| ACME                  Dashboard       Projects      Reports          [JD]  |
|                                                                            |
+------------------+---------------------------------------------------------+
|                  |                                                         |
|                  |    Overview                                  [+ New]    |
| Overview         |                                                         |
|                  |  +--------------+  +--------------+  +--------------+   |
| Projects         |  |              |  |              |  |              |   |
|                  |  | 1,284        |  | 36           |  | 99.9%        |   |
| Tasks            |  | Users        |  | Active       |  | Uptime       |   |
|                  |  +--------------+  +--------------+  +--------------+   |
| Settings         |                                                         |
|                  |                                                         |
|                  |  +--------------------------------------------------+   |
|                  |  | Traffic                           ###            |   |
|                  |  |                       ###         ###            |   |
|                  |  |           ###         ###         ###            |   |
|                  |  |           ###         ###   ###   ###            |   |
|                  |  |     ###   ###         ###   ###   ###   ###      |   |
|                  |  |     ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  |     ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  | 0   ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  +--------------------------------------------------+   |
|                  |                                                         |
+----------------------------------------------------------------------------+
```

The sidebar divider runs the full height and joins the header rule at a `+`.

### Table

```
+--------------------------------------------------------------------------+
| Users                                                                    |
| +------------------------+                             +--------------+  |
| | Search...              |                             |  [+ New]     |  |
| +------------------------+                             +--------------+  |
|  +----------------------+-------------+-------------+----------------+   |
|  | Name                 | Role        | Status      | Actions        |   |
|  +----------------------+-------------+-------------+----------------+   |
|  | Alice Chen           | Admin       | [x] Active  | [E] [D]        |   |
|  | Bob Liu              | Editor      | [x] Active  | [E] [D]        |   |
|  | Carol Wang           | Viewer      | [ ] Pending | [E] [D]        |   |
|  | Dan Zhou             | Viewer      | [ ] Invited | [E] [D]        |   |
|  |                      |             |             |                |   |
|  +----------------------+-------------+-------------+----------------+   |
|                                                                          |
| [x] select all          Delete selected                                  |
|                                                                          |
| Showing 1-4 of 128                  < Prev   1 2 3 ... 32   Next >       |
|                                                                          |
+--------------------------------------------------------------------------+
```

Draw the vertical rules for every data row first, then the separator rules, so
each `+` lands on the intersections. Column x-positions must match the rule
columns exactly; `colGrid(cols, y)` does both from one list.

### Mobile list

```
+----------------------------------+
| <            Inbox            ...|
|                                  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Search...                    | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 1 title                 | |
| | preview text             1m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 2 title                 | |
| | preview text             2m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 3 title                 | |
| | preview text             3m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 4 title                 | |
| | preview text             4m  | |
| +------------------------------+ |
|                                  |
+----------------------------------+
|                                  |
|  Home    Feed    Saved   Me      |
|                                  |
+----------------------------------+
```

Leave one blank row between stacked cards.

### Modal

```
+--------------------------------------------------------+
|                                                        |
|                                                        |
|     +============================================+     |
|     | New Project                             [X]|     |
|     +============================================+     |
|     |                                            |     |
|     | Name                                       |     |
|     | +------------------------------------+     |     |
|     | | My project                         |     |     |
|     | +------------------------------------+     |     |
|     |                                            |     |
|     | Cancel                       [ Create ]    |     |
|     +============================================+     |
|                                                        |
+--------------------------------------------------------+
```

A dialog is a heavier frame: `box(x, y, w, h, { h: '=' })`.

## Workflow

1. **Plan the boxes.** List every region and its label; note which nest.
2. **Size the canvas.** Outer frame two columns wider than the widest content,
   with a blank row between stacked boxes.
3. **Draw borders first**, all of them, with `box`, `hline`, `vline`, `colGrid`.
4. **Write text second.** A non-empty `c.errors` means a label overran a frame;
   move it and redraw rather than trimming characters.
5. **Verify** with `verify(text)` or the CLI.
6. **Present in a fenced code block.**

To revise a layout, change the grid coordinates and re-render.
