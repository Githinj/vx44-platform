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
  field: "12px"
  frame: "16px"
  card: "20px"
  pill: "9999px"
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
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "44px"
  button-primary-compact:
    backgroundColor: "{colors.shift-gold}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-outline:
    textColor: "{colors.signal-white}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "44px"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    textColor: "{colors.signal-white}"
    rounded: "8px"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.panel-wash}"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.panel-wash}"
    rounded: "{rounded.card}"
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

The system is soft: actions are pills, fields have 12px corners, footage frames 16px and cards 20px. The rounding was applied to every component at once (marketing and admin), and any future change to it must be too.

Motion borrows the camera's own behaviour, and has one authored moment: the hero alert arriving.
- **Hero:** the headline pulls focus (it rises from a 12px blur to sharp). The hero feed "acquires signal": one bright band sweeps the frame, and the HUD prints in. The detection box locks on to its subject. The AI alert card slides up, a white bar fills while the operator reviews it, then "Verified" lands with a single green ring. Detect, review, verify.
- **Section headings:** pull focus the same way as they enter (900ms).
- **Live AI frames:** switch on like monitors. A bright horizontal line opens into the picture.
- **Rules and step bars:** draw from the left before their content rises onto them.
- **Final CTA:** viewfinder brackets close in around it.
- **Other content:** fades in and rises 14px (650ms, `cubic-bezier(0.16, 1, 0.3, 1)`, siblings staggered 80ms).

All scroll reveals run once, through the Web Animations API, so markup stays visible if the script fails. Ambient loops:
- the hero grid and glow drift;
- the LIVE dot pulses and the alert's cyan dot pings;
- a glint travels the How it works track every 7 seconds;
- a faint scan line crosses the final CTA.

They pause off screen. Hover takes 180ms. Under reduced motion, every movement, blur and loop is removed and only short fades remain. Animated properties are transform and opacity, plus a one-time blur on headings and a brightness flash on monitors.

**Key Characteristics:**
- Near-black ground (`#05080f`) with low-contrast panel washes and hairline borders
- Gold used sparingly, only for the next action
- Camera HUD vocabulary (mono labels, corner brackets, LIVE dot, detection boxes) as the signature
- Big, tight Sora headlines over relaxed Inter body copy
- Quiet depth: lit top edges, film grain over the room, and a navy band behind the monitor wall
- Soft corners everywhere: pill actions, rounded fields, frames and cards

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
- **Deep Navy** (`deep-navy`): the second background colour in the brand brief. It takes one whole surface: the band behind the Live AI monitor wall, fading in and out of Night Ink. Use it only for whole section bands, never for small accents.
- **Gold metal ramp** (`#ddb350` → `#cfa23a` → `#c4952c`): the vertical gradient on gold buttons only, with a lit top edge. It reads as Shift Gold.
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
- **Footer:** a quiet four-column block on Panel Wash: wordmark with a one-line description, Explore links, Get started links, and labelled contact details. A hairline separates the copyright and legal links below. Two link columns sit side by side on phones.

## Elevation & Depth

Depth is quiet and mostly comes from tone. Night Ink is the floor, Panel Wash is a faint lift, and raised cards (`.surface`) are Panel Solid with a lit top edge (a 1px inner highlight and a faint white gradient over the top 140px). Hairline borders define edges.

Atmosphere does the rest:
- the gold radial glow behind the hero and final CTA;
- static film grain over the whole page (6%);
- a cool "desk glow" of monitor light under the hero frame;
- the navy band behind the monitor wall.

Footage carries "glass": a vignette, faint scan lines and an inner hairline.

### Shadow Vocabulary
- **Floating card** (`box-shadow: 0 24px 48px -12px rgba(0,0,0,0.6)`): the alert card over the hero footage.
- **Hero monitor** (`0 40px 80px -32px rgba(0,0,0,0.9)`): the hero footage frame only.
- **Nav capsule** (`0 12px 32px -12px rgba(0,0,0,0.7)`): the floating nav once the page scrolls.
- **Gold button**: a 1px drop, plus a soft gold bloom that grows on hover (`0 14px 32px -10px` at 60%).

### Named Rules
**The Soft Desk Rule.** In-flow cards get a lit edge, never a drop shadow. Shadows belong to things that float (the alert card, the nav capsule, the hero monitor) and to the gold action.

**The Pointer Light Rule.** Cards with `.spotlight` carry a faint white light that follows a mouse pointer. Never tint it gold or cyan.

## Shapes

The shape language is soft and consistent, with four steps:
- **Pill** (9999px): every button, nav link highlight and icon button.
- **Field** (12px, `rounded-field`): inputs, selects, choice tiles and the Calendly well.
- **Frame** (16px, `rounded-frame`): footage frames, including the 404 frame.
- **Card** (20px, `rounded-card`): forms, the pricing card, the alert card and FAQ items.

The admin console uses the same idea one size smaller: 8px controls and 12px panels. Status dots stay 6px circles. Detection boxes keep near-square 3px corners, because they are measurement, not decoration.

Footage frames carry corner brackets: L-shaped ticks in each corner (18px, inset 3%, Signal White at 45%). That is the signature silhouette of the system. The same brackets, at 32–44px, frame the final CTA as a viewfinder.

## Components

Shared class lists for calls to action live in `src/components/marketing/styles.ts`. Use them rather than restating button classes.

### Buttons
Soft, warm and certain.
- **Shape:** pills. Every button and text-link CTA is at least 44px tall.
- **Primary (`.btn-gold`):** Shift Gold metal (the gold ramp with a lit top edge), Night Ink text, semibold, 12px × 28px. It goes full width on phones where it ends a form or a hero. The compact form (20px sides, small text) is used in the nav.
- **Hover / Active / Focus:**
  - On hover, the button lifts 2px, its gold bloom grows, and a sheen crosses it once (750ms).
  - Pressed, it settles to 98% scale.
  - The global focus ring is a 2px gold outline, offset 3px.
  - Disabled buttons drop to 60% opacity, with no lift or sheen.
- **Outline:** a 1px white-20% pill with Signal White text, turning gold with a faint gold wash on hover. It's the secondary action in the mobile menu.
- **Secondary (admin only):** an 8px-radius control with an 8% white fill and Signal White text, rising to 14% white on hover.
- **Text link CTA (`.link-draw`):** semibold Signal White with a 1px drawn underline. On hover the underline retracts to the right and redraws in gold. It's used for the second action next to a primary button, e.g. "Check my cameras".

### Cards / Containers
- **Corner Style:** 20px (`rounded-card`).
- **Background:** `.surface`, which is Panel Solid with a lit top edge, for forms, the pricing card and framed embeds.
- **Shadow Strategy:** none in flow (see the Soft Desk Rule). Cards from `cardClass` carry the pointer spotlight.
- **Border:** 1px Hairline. The pricing card, the one featured offer, uses a Shift Gold border at 60%.
- **Internal Padding:** 24px on phones, 32–40px from `sm` up. Admin panels use 16–20px.
- **Ruled lists:** features and pricing inclusions sit on hairlines, which draw in from the left.
- **FAQ:** soft rounded rows that open smoothly to their height. The plus sits in a round button that turns to "×".

### Inputs / Fields
- **Style:** a faint white fill (3%), a 1px Field Stroke border and 12px corners. Fields are at least 44px tall, with Signal White text and a Muted Steel placeholder. Labels sit above in small medium-weight Signal White.
- **Hover / Focus:** on hover the border brightens to 35% white. On focus it turns Shift Gold with a soft 4px gold halo, and no outline.
- **Error / Disabled:** an invalid field gets a Rec Red border, with the message in small Rec Red text below. Disabled fields drop to 60% opacity.
- **Choices:** radio rows are 44px tall. Brand choices on the camera check are bordered tiles that turn gold when checked.
- **Selects:** the same field style, with dropdown options on Night Ink.

### Navigation
- **Desktop:** a sticky 64px bar with the wordmark on the left, and Body Slate anchor links (44px targets) that turn Signal White on hover. A compact gold "Book a demo" button sits on the right. Once the page scrolls, the flat bar lifts into a floating rounded capsule with a backdrop blur (it lives on its own layer). On the homepage, a soft pill slides under the link for the section in view (`aria-current="location"`).
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
- **Glass and arrival:** a vignette and faint scan lines sit over every feed. The hero frame boots with one bright sweep, while the Live AI frames switch on like monitors as they scroll in.
- **Reduced motion:** only the poster shows, and the pulse, clock and lock-on are off.

### Alert Card (signature)
- **Layout:** a Panel Solid card with a hairline border and the floating-card shadow, set over the hero footage at the bottom right on desktop and below the frame on phones.
- **Content:**
  - a mono cyan "AI ALERT · CAM 01" header with a cyan dot;
  - a Sora event line;
  - a green verified status line.
- **Motion:**
  - The card arrives 1.1s into the hero.
  - The cyan dot pings on a loop.
  - A white review bar fills from 1.7s to 2.5s.
  - At 2.55s the verified line rises in, with a single green ring.

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
- **Don't** add drop shadows to in-flow cards; use the lit edge. Shadows are for floating things and the gold action.
- **Don't** mix square and rounded components; every new component takes a step from the shape scale.
- **Don't** set body copy, buttons, headlines or labels above headings in mono.
- **Don't** add hover lift to anything that isn't clickable.
- **Don't** round one component on its own. Any rounding is a system-wide change.
- **Don't** show unblurred faces, readable number plates or brand logos in footage.
- **Don't** add client logo strips, star ratings, testimonial cards or stat counters until real ones exist.
