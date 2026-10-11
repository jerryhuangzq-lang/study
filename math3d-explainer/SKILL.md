---
name: math-3d-explainer
description: Use when the user sends a screenshot or text of a math/physics page (theorem, lemma, derivation) and asks for a 3D picture, an interactive figure, or a more intuitive explanation — e.g. "做个3d图", "这页来张3d图解释一下", "更直观的解释", "3d展示一下", "画个图". Builds an inline Three.js widget with mode tabs, sliders and live numeric readouts via mcp__visualize__show_widget, then explains it in Chinese.
---

# math-3d-explainer

Turn one textbook page into 1–3 small interactive 3D scenes where every symbol in the statement is a visible object and the theorem's claim shows up as a live number.

Needs `mcp__visualize__show_widget` (Claude Code / CCD desktop). If it's not connected, say so; no fallback.

## Steps

1. **Read the page.** Screenshot or text. Name the claim(s): statement lines, "Why it works", "Common trap". If it's not clear which result the user means, ask once.
2. **Verify the math first, by hand.** Check every formula you will put in a readout (sign conventions, which side an inequality flips). Wrong formula + pretty picture is worse than no picture.
3. **Plan modes.** One mode = one idea. Max 3. Map each symbol to an object (point, arrow, plane, arc) and each claim to a number or color that changes live.
   - Equality / edge case reachable by a slider (so the user sees when `≤` becomes `=`).
   - A "break it" control for the trap on the page (flip handedness, reverse direction, θ+φ > π).
   - Invariants shown as cards that stay constant while the picture moves (v, κ, τ; ‖y−x‖; triple product).
4. **Load design rules.** `mcp__visualize__read_me` with `modules: ["interactive"]`, `platform: "desktop"`. Mandatory before `show_widget`.
5. **Build from `scaffold.html`** (same folder; installed copy: `~/.claude/skills/math-3d-explainer/scaffold.html`). Read it, keep the infrastructure untouched, replace `MODE ONE/TWO`, `PARAM`, `update()`. Pass the result as `widget_code`.
6. **Explain after the widget, in Chinese**, per mode: what each object is, 3–4 "try this" actions with the expected result, then the link back to the page's Common trap. Don't repeat what the widget already shows. Don't bold mid-sentence.

## Widget rules (all learned the hard way)

- Three.js from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` only. `cdn.plot.ly` (Plotly) is blocked by the widget CSP. No `OrbitControls` on cdnjs r128: use the drag-rotate in the scaffold.
- No `position: fixed`, no fullscreen API, no comments in the code, no font under 11px, colors via CSS variables so dark mode works.
- Labels are HTML divs projected each frame, not sprites. Create them in `update()` via `lbl()`; `clear()` removes them.
- Rebuild the whole `dyn` group on every slider input. Cheap at this size; avoids stale-state bugs.
- Colors encode meaning: blue/green/coral for `u1,u2,u3` or analogous triples; purple for the main curve; gray for reference/target; `--bg-success` / `--bg-danger` cards for pass/fail states. Light tints for transformed copies of a frame.
- Round every displayed number (`toFixed`). Sliders with `step`.
- Compute curvature-like quantities numerically from the drawn curve (central differences, h=0.01) rather than from the formula being demonstrated, so the readout is a check, not a tautology.
- Angles about an axis: use `atan2(axis·(a×b), a·b)` mod 360, not `acos`, past 180°.
- Reflection in the plane ⟂ n: `q − 2(q·n)n`. Handedness = sign of `(f1×f2)·f3`.
- Great-circle arcs: slerp `sin((1−t)Ω)/sinΩ · a + sin(tΩ)/sinΩ · b`; guard Ω≈0.
- Keep each mode readable at 680px width; ≤ 3 sliders per mode.

## Past scenes (patterns to reuse)

| Page | Modes |
|---|---|
| Geodesics on S², rotation = two reflections | minor arc + chord + constant-speed dots; mirror circles + axis u×v + measured 2θ |
| Coordinate invariance, standard helix | old frame vs new frame slider; y_j as a dashed box path; κ,τ in x and y coords; flip u3 → τ sign |
| Thm 29 shortest path, S² metric | bend/backtrack sliders with ∫‖x′‖ vs ‖y−x‖; sphere triangle with ψ slider, equality at ψ=180° |
| Handedness, Thm 31/32 | one mirror flips det; two mirrors step-through to target frame; mirror sweep = rotation by 2tα |

## Install

Edit the repo copy, then install from a real terminal (the Claude Code sandbox can't write `~/.claude/skills`):

```bash
mkdir -p ~/.claude/skills/math-3d-explainer && cp "$HOME/claude app/math3d-explainer/SKILL.md" "$HOME/claude app/math3d-explainer/scaffold.html" ~/.claude/skills/math-3d-explainer/
```

Never edit the installed copy.
