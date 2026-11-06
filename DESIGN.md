---
name: VX44 AI Monitoring
description: AI monitoring for the cameras you already own. Dark, calm and precise, with gold kept for the next action.
colors:
  night-ink: "#05080f"
  deep-navy: "#0b1d3a"
  panel-wash: "rgba(255, 255, 255, 0.025)"
  panel-solid: "#0b111d"
  footage-well: "#0d1421"
  hairline: "rgba(255, 255, 255, 0.08)"
  field-stroke: "rgba(255, 255, 255, 0.2)"
  signal-white: "#eef2f8"
  body-slate: "#a9b4c8"
  muted-steel: "#7c8aa5"
  shift-gold: "#cfa23a"
  detection-cyan: "#5ce1e6"
  rec-red: "#ff5a5f"
  resolved-green: "#3dd68c"
typography:
  display:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.4vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.14em"
  hud:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.12em"
  hud-compact:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.12em"
rounded:
  none: "0px"
  dot: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "24px"
  container: "72rem"
  section-gap: "7rem"
  section-gap-lg: "10rem"
components:
  button-primary:
    backgroundColor: "{colors.shift-gold}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "44px"
  button-primary-compact:
    backgroundColor: "{colors.shift-gold}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    textColor: "{colors.signal-white}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.panel-wash}"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  panel:
    backgroundColor: "{colors.panel-wash}"
    rounded: "{rounded.none}"
    padding: "32px"
  nav:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.body-slate}"
    height: "64px"
---

# Design System: VX44 AI Monitoring

## Overview

**Creative North Star: "The Night Shift Desk"**

VX44 should feel modern, calm, premium and confident, like a quiet control room after hours: never loud, cluttered or hyped. Simple beats busy. The room is dark and quiet. Everything on the desk is precise, and one thing at a time is marked for action. The near-black background is the room. Slate text is the steady hum of information. Gold is the light that says *act here*. Nothing competes for attention, because the operator on a night shift needs the signal, not the noise.

The camera's own language is the main decorative system: mono HUD labels (`CAM 01 · FORECOURT`, `LIVE`), corner brackets on footage, a pulsing red record dot and cyan detection boxes. Everything else steps back. Panels are barely-there washes of white, borders are hairlines, and depth comes from tone rather than shadow. A soft gold glow appears only behind the hero and the final call to action, like a lamp over the desk.

The system is square today: no rounded corners on buttons, panels or fields. The founders are open to gentle rounding later, so treat the square corners as the current state, not a permanent law. Any softening must apply to every component at once, never to one component on its own.

Motion is calm and has one authored moment: the hero alert arriving. On load the headline, sub-line, buttons and footage rise in. The detection box locks on to its subject. Then the AI alert card slides up, and a beat later its "Verified" line lands, showing detect then verify. Everywhere else, motion is quieter:
- **Scroll reveals:** content fades in and rises 12px once as it enters (600ms, `cubic-bezier(0.16, 1, 0.3, 1)`, siblings staggered 80ms). This runs through the Web Animations API, so markup stays visible if the script fails.
- **Ambient loops:** the hero grid and glow drift, a faint scan line crosses the final CTA, and the LIVE dot pulses. They pause off screen.
- **Hover:** feedback takes 180ms.
- **Reduced motion:** every movement is removed and only short fades remain.
- **Properties:** transform and opacity only.

**Key Characteristics:**
- Near-black ground (`#05080f`) with low-contrast panel washes and hairline borders
- Gold used sparingly, only for the next action
- Camera HUD vocabulary (mono labels, corner brackets, LIVE dot, detection boxes) as the signature
- Big, tight Sora headlines over relaxed Inter body copy
- Flat surfaces; depth from tone, not shadow
- Square corners for now, with room to soften later as a system-wide change

## Colors

The palette is a night palette: blue-black neutrals, one warm brand accent, and three signal colours borrowed from security equipment, each with a single job.

### Primary
- **Shift Gold** (`shift-gold`): the brand and the next action. It's used for primary buttons, the "44" in the wordmark, focus rings, checkbox accents, inline links, the Respond step bar and the gold border on the pricing card (at 70%). At 16% opacity it forms the radial glow behind the hero and the final CTA.

### Signal colours (functional, never decorative)
- **Detection Cyan** (`detection-cyan`): AI only. Detection boxes and labels on footage, the "AI ALERT" line, and the Detect step bar.
- **Rec Red** (`rec-red`): live and recording indicators, plus form errors.
- **Resolved Green** (`resolved-green`): verified, online and success states. Examples are "Verified. Site contact notified." and the Report step bar.

### Neutral
- **Night Ink** (`night-ink`): page background, the sticky nav and the text on gold buttons.
- **Deep Navy** (`deep-navy`): the second background colour in the brand brief. It isn't used in the code yet. When it is, use it for whole section bands or large surfaces that need to stand apart from Night Ink, never for small accents.
- **Panel Wash** (`panel-wash`): section bands, cards, the footer, form fields. It reads as a faint lift off the ground.
- **Panel Solid** (`panel-solid`): opaque raised surfaces that sit over other content, such as the floating alert card, the lead-form card and the Calendly well.
- **Footage Well** (`footage-well`): the frame behind video before it loads.
- **Hairline** (`hairline`): borders on panels, footage frames and table rows.
- **Field Stroke** (`field-stroke`): input borders, slightly stronger than a hairline so fields are easy to find.
- **Signal White** (`signal-white`): headings, labels, active nav and emphasised text.
- **Body Slate** (`body-slate`): default body copy and nav links.
- **Muted Steel** (`muted-steel`): secondary text, table headers, the "AI MONITORING" wordmark tag and the copyright line.

### Named Rules
**The Gold Means Act Rule.** Gold marks what the visitor should do next, plus the wordmark "44" and focus rings. Never use it for large fills, decorative icons, dividers or background panels. If a screen has more than a few gold elements, one of them is wrong.

**The One Job Rule.** Cyan means AI detection and live data, red means live, recording or error, and green means resolved or OK. Never use a signal colour for decoration or for a different meaning.

**The AA Floor Rule.** All text meets WCAG AA contrast. Every text colour above passes on Night Ink, Panel Solid and Deep Navy; the tightest pair is Muted Steel on Deep Navy (4.82:1). Never put Muted Steel on anything lighter than Deep Navy, and never lower a text colour's opacity to soften it.

## Typography

**Display Font:** Sora (with system-ui, sans-serif)
**Body Font:** Inter (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** Sora's geometric headlines are large and tightly tracked, confident without shouting. Inter carries the reading. JetBrains Mono is the voice of the equipment: camera IDs, timecodes and alert lines, always uppercase and widely tracked.

### Hierarchy
- **Display** (600, 2.5rem on phones rising to 4.25rem, line-height 1.08, -0.03em): the hero headline only, set as two stacked lines.
- **Headline** (600, 2.25rem rising to 3rem at `sm`, line-height 1.08, -0.03em, balanced wrapping): section titles and the final CTA (up to 3.75rem there).
- **Title** (600, 1.25–1.5rem): step, feature and card titles; FAQ questions at 1.125rem.
- **Body** (400, 1rem, relaxed leading, pretty wrapping): default copy in Body Slate, capped around 65ch in FAQ answers.
- **Lead** (400, 1.125–1.25rem): section intros and the hero sub-line.
- **Label** (400 mono, 13px, 0.14em tracking, uppercase): alert headers (`AI ALERT · CAM 01`), status lines (`REQUEST RECEIVED`) and loading lines.
- **HUD** (400 mono, 11px, or 10px on phones, 0.12em tracking, uppercase, tabular numerals): text printed over footage, such as camera IDs, LIVE, REC timecodes and detection tags. It always carries a dark text halo. These labels are decorative and hidden from screen readers. The stock-footage disclosure is sans, 11px, and stays readable.

### Named Rules
**The Equipment Voice Rule.** Mono is only for things a camera or a monitoring console would print: camera IDs, LIVE, timecodes and alert headers. Never set body copy, buttons, headlines or labels above headings in mono.

**The No Eyebrow Rule.** Headings stand on their own. Never put a small label above a heading to announce the section.

**The Tight Top Rule.** Display and headline sizes always carry negative tracking (-0.03em) and tight leading (1.08). Body text never does.

## Layout

- **Container and gutters:** content sits in a centred container capped at 72rem, with 16px side gutters on phones and 24px from `sm` up.
- **Section spacing:** sections are widely separated, 7rem apart on phones and 10rem from `lg`, so each one reads as its own moment.
- **Headings:** section headings are left-aligned and capped at 48rem. The hero and the final CTA are the only centred compositions.
- **Grids:**
  - The step timeline is 4 columns at `md`.
  - Live AI is 3 columns.
  - Features and FAQ use a 1:2 split at `lg`: the heading on the left, content on the right.
  - The pricing card is a 1:1.3 split at `md`.
  - Everything collapses to a single column on phones.
- **Full-width bands:** Panel Wash breaks the rhythm for the compatibility line and the footer.
- **Nav:** sticky, 64px tall, with anchor links hidden below `md` behind a mobile menu.
- **Footer:** ends with an oversized "VX44" wordmark (up to 26rem, line-height 0.8) that bleeds off the bottom edge.

## Elevation & Depth

The system is flat. Depth comes from tone: Night Ink is the floor, Panel Wash is a faint lift, and Panel Solid is a raised opaque surface for anything that floats over other content. Hairline borders define edges. The gold radial glow is atmosphere, not elevation.

### Shadow Vocabulary
- **Floating card** (`box-shadow: 0 24px 48px -12px rgba(0,0,0,0.6)`): only the alert card that overlaps the hero footage.
- **Menu drop** (`box-shadow: 0 12px 24px rgba(0,0,0,0.5)`): only the mobile menu sheet below the nav.

### Named Rules
**The Flat Desk Rule.** Surfaces are flat. A shadow is allowed only when something physically overlaps other content (a floating card or a dropdown sheet). Never use one to make a card look important.

## Shapes

The shape language is square. Buttons, panels, inputs, footage frames and cards all have 0px corners and 1px hairline borders. The only round shapes are status dots (6px circles for LIVE, verified and list bullets), and the FAQ "+" rotating to "×" when an item opens.

Footage frames carry corner brackets: 18px L-shaped ticks in each corner, inset 3%, in Signal White at 45% opacity. That is the signature silhouette of the system.

Rounding is open for future change. If it happens, introduce one small radius and apply it to every button, field, panel and footage frame together. Status dots stay circles.

## Components

Shared class lists for calls to action live in `src/components/marketing/styles.ts`. Use them rather than restating button classes.

### Buttons
Solid and certain, with no decoration.
- **Shape:** square (0px). Every button and text-link CTA is at least 44px tall.
- **Primary:** Shift Gold fill, Night Ink text, semibold, 12px × 24px. It goes full width on phones where it ends a form or a hero. The compact form (16px sides, small text) is used in the nav.
- **Hover / Active / Focus:** over 180ms, the button rises 1px and brightens to 110%; pressed, it drops to 90%. The global focus ring is a 2px gold outline, offset 2px. Disabled buttons drop to 60% opacity and don't lift.
- **Outline:** 1px white-20% border with Signal White text, turning gold on hover. It's the secondary action in the mobile menu.
- **Secondary (admin only):** 8% white fill with Signal White text, rising to 14% white on hover.
- **Text link CTA:** semibold Signal White, underlined with a 4px offset, turning gold on hover. It's used for the second action next to a primary button, e.g. "Check my cameras".

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** Panel Wash for in-flow content; Panel Solid for forms, floating cards and framed embeds.
- **Shadow Strategy:** none (see the Flat Desk Rule).
- **Border:** 1px Hairline. The pricing card, the one featured offer, uses a Shift Gold border at 70%.
- **Internal Padding:** 24px on phones, 32–40px from `sm` up. Admin panels use 16–20px.
- **Prefer ruled lists to boxes:** features, pricing inclusions and the FAQ sit on hairlines rather than in tiles.

### Inputs / Fields
- **Style:** Panel Wash fill, 1px Field Stroke border, square, at least 44px tall, Signal White text and a Muted Steel placeholder. Labels sit above in small medium-weight Signal White.
- **Hover / Focus:** on hover the border brightens to 35% white. On focus it turns Shift Gold, with no outline or glow.
- **Error / Disabled:** an invalid field gets a Rec Red border, with the message in small Rec Red text below. Disabled fields drop to 60% opacity.
- **Choices:** radio rows are 44px tall. Brand choices on the camera check are bordered tiles that turn gold when checked.
- **Selects:** the same field style, with dropdown options on Night Ink.

### Navigation
- **Desktop:** a sticky 64px bar with the wordmark on the left, and Body Slate anchor links (44px targets) that turn Signal White on hover. A compact gold "Book a demo" button sits on the right. Once the page scrolls, the bar gains a hairline and a light backdrop blur on its own layer.
- **Mobile:** the links move into a full-height Night Ink sheet that slides down from under the bar. It shows large Sora links on hairlines, with "Check my cameras" (outline) and "Book a demo" (primary) at the bottom. While it is open, page scroll locks and focus stays inside. It closes on Escape.
- **Skip link:** it appears in gold at the top left on first Tab.

### Footage Slot (signature)
- **Frame:** a 16:9 frame on Footage Well with a hairline border, showing a muted, looping, lazy-loaded clip with a poster image. To drop in real footage, change `src` and `poster`.
- **Overlays:**
  - corner brackets;
  - the camera ID top left;
  - a pulsing Rec Red dot plus LIVE top right, with a REC timecode beneath it that runs only while the frame is on screen;
  - a "Stock footage for illustration" tag bottom left.
- **Detection box:** cyan, with 2px corner ticks, a faint cyan fill and the label inside the box. It tracks the subject, and locks on (scales in from 135% and settles) once the clip starts.
- **Reduced motion:** only the poster shows, and the pulse, clock and lock-on are off.

### Alert Card (signature)
- **Layout:** a Panel Solid card with a hairline border and the floating-card shadow, set over the hero footage at the bottom right on desktop and below the frame on phones.
- **Content:**
  - a mono cyan "AI ALERT · CAM 01" header with a cyan dot;
  - a Sora event line;
  - a green verified status line.
- **Motion:** the card arrives 1.1s into the hero, and the verified line lands 0.8s after it.

### How It Works Track
- **Track:** four bars that meet into one line and draw left to right in order.
- **Colours with meaning:**
  - cyan: Detect (the AI);
  - Signal White: Verify (the operator);
  - Shift Gold: Respond (the action);
  - Resolved Green: Report.

### Section Heading
A tight Sora headline with an optional lead paragraph, both fading in as they arrive. No label above it (see the No Eyebrow Rule).

### No-Signal Frame (404)
A footage frame with no feed. It has faint flickering scan lines, "CAM 404" and "OFFLINE" in the HUD, and "404 · NO SIGNAL" centred.

## Do's and Don'ts

### Do:
- **Do** keep the page on Night Ink (`#05080f`) and build depth with Panel Wash, Panel Solid and hairline borders.
- **Do** reserve Shift Gold for primary actions, the wordmark "44", focus rings, the Respond bar and the featured pricing border.
- **Do** use the camera HUD vocabulary (mono labels, corner brackets, LIVE dot, REC timecode, cyan detection boxes) wherever footage or alerts appear.
- **Do** let headings stand on their own, and reveal content once, gently, as it enters.
- **Do** keep the gold radial glow to the hero and the final CTA.
- **Do** pause every looping animation off screen and give each one a reduced-motion path.
- **Do** label stock footage as illustration while it's in use.

### Don't:
- **Don't** use cyan for anything except AI detection and live data, red for anything except live, recording or errors, or green for anything except resolved or OK.
- **Don't** fill large areas with gold or use it for decoration.
- **Don't** add shadows to in-flow cards; shadows are only for content that floats over other content.
- **Don't** set body copy, buttons, headlines or labels above headings in mono.
- **Don't** add hover lift to anything that isn't clickable.
- **Don't** round one component on its own. Any rounding is a system-wide change.
- **Don't** show unblurred faces, readable number plates or brand logos in footage.
- **Don't** add client logo strips, star ratings, testimonial cards or stat counters until real ones exist.
