# design.md — Resetwatch (Overwatch weekly / season reset tracker)

Design spec for a small web app that shows countdowns to Overwatch daily / weekly / event / season resets plus a challenge checklist. Visual target: the **current Overwatch in-game menu (the top-bar UI introduced with the Season 1, Feb 2026 redesign)**, not the Overwatch 1 / early OW2 menus.

Revision 2: rebuilt from 13 real in-game screenshots (Home, Events, Battle Pass, Shop, Story, Challenges, Career, Achievements, Arcade, pause menu, currency modal, plus Blizzard's "New In-Game Look" Spotlight frames). Hex values were sampled from those screenshots.

---

## 0. How solid is this?

| Tag | Meaning |
|---|---|
| **[obs]** | Seen directly in the screenshots |
| **[hex]** | Color sampled from a screenshot pixel. Screenshots are scaled and compressed, so expect about ±3% drift. Re-sample from a lossless capture before shipping |
| **[rep]** | Reported in press / forum feedback, not seen in the screenshots |
| **[3p]** | Third-party claim (palette / font blogs) |
| **[dec]** | My design decision for the tracker, not something Blizzard did |

Still unknown: Blizzard's official token names, exact UI font names, official reset clock times. Blizzard has not published a style guide for this UI.

Sources outside the screenshots:
[allthings.how](https://allthings.how/overwatch-drops-the-2-and-launches-10-new-heroes-in-2026/) ·
[PiunikaWeb](https://piunikaweb.com/2026/02/05/overwatch-2-menu-redesign-player-backlash-toggle-old-ui/) ·
[Blizzard forums: menu feedback](https://us.forums.blizzard.com/en/overwatch/t/new-main-menus-ui-feedback/1002880) ·
[Blizzard forums: UI/UX review](https://us.forums.blizzard.com/en/overwatch/t/a-comprehensive-uiux-overhaul-review-ux-feedback/1003648) ·
[Kotaku Spotlight recap](https://kotaku.com/overwatch-2-spotlight-story-vendetta-cinematic-new-heroes-2000665327) ·
[brandpalettes.com](https://brandpalettes.com/overwatch-color-codes/) [3p] ·
[madegooddesigns font post](https://madegooddesigns.com/overwatch-font/) [3p] ·
[Blizzard forums: reset times](https://us.forums.blizzard.com/en/overwatch/t/when-do-challenges-reset-nowadays/1002833) (player claims)

---

## 1. The current Overwatch menu, as observed

### 1.1 Frame
- **Persistent top bar**, about 56px at 1500px frame width, near-black navy **[hex] `#0D1424`–`#111623`**.
- Left: Home icon tab, then text tabs `HEROES · EVENTS · BATTLE PASS · SHOP · STORY` **[obs]**.
- Centre: **PLAY plate**. A blue chamfered trapezoid that hangs below the bar, bright cyan-blue 2px edge, italic slanted `PLAY` word plus logo mark **[obs]**. It is the only element that breaks out of the bar. Mid-search it becomes a "SEARCHING" capsule with a timer **[obs, 2nd screenshot]**.
- Right: currencies (cyan triangle prism + gold coin, number only), stack/loot icon, challenges medal, bell, group icon with count, player avatar square, settings gear **[obs]**.
- **Active tab = solid blue fill** **[hex] `#0361AF`–`#065898`** with a 2px lighter cyan underline. Inactive = no fill, white text **[obs]**.
- **Unread dot**: small orange dot above the label of a tab or icon (Heroes, Battle Pass, Shop, bell, Customization) **[obs]**.
- Second row on many screens: **sub-tabs** on a slightly lighter navy strip **[hex] `#1D253B`**, tab shapes slanted (parallelogram), active one blue. Examples: `CURRENT PASS / UNVAULTED PASSES`, `FEATURED / ON SALE / MYTHIC / SEASONAL …`, Arcade mode switcher **[obs]**.
- **Back screens** (Challenges, Career, pause menu): Home icon is replaced by `‹` or `‹ BACK`, and the Play plate disappears **[obs]**.
- **Bottom corners: key hints.** Left `[ENTER] CHAT`, right `[F1] INFO  [ESC] HOME` or `[ESC] BACK`. Keycap = outlined dark square with small text, label in bold caps **[obs]**.
- Info text such as the build string sits top-left under the bar and is barely visible.

### 1.2 Backgrounds
Three families **[obs]**:
1. **Deep indigo + large faint triangle/chevron pattern.** Challenges, pause menu. Page bg **[hex] `#0C1020`–`#10192D`**, menu **[hex] `#0C0F35`–`#111843`**, with horizontal blue light streaks on the pause menu.
2. **Mid slate-periwinkle, blurred, with the same triangle pattern.** Career, Achievements, Arcade, Story, Shop **[hex] `#566481`–`#90A5C0`**. The panels on top are opaque dark navy, so this is not a "light theme".
3. **Full-bleed hero art** with a coloured wash and big stylised title. Home faction screen splits red (Talon) and cyan (Overwatch) with a white lightning seam; Events, Battle Pass and Shop banners are art-led.

### 1.3 Panels and components
- **Rows / panels:** square corners, opaque blue-slate fill **[hex] `#2D374F`**, darker icon cell on the left **[hex] `#0D1424`**. Dense lists use 1px gaps.
- **Modal:** full-width horizontal band **[hex] `#1D253B`** across the screen centre, background blurred and dimmed, centred title, two dark cards **[hex] `#111729`**, one white `CANCEL` button **[obs]**.
- **Buttons are flat rectangles, no radius, no skew:**
  - Primary: orange **[hex] `#EA5F12`**, white bold caps text, short orange flare streak on its left edge for the hero CTA. (`UPGRADE BATTLE PASS`, `JOIN TALON`.)
  - Secondary: near-white **[hex] `#F5F5F5`**, dark text. (`INSPECT REWARDS`, `CANCEL`, all pause-menu entries.)
  - Dropdowns are also white with dark text and a chevron.
- **Cards** (game modes, shop items): corner radius about 6–10px **[obs]**. Arcade cards are flat saturated colour fields with big white glyph, small yellow `5V5`-style meta line, italic display title: teal `#026958`, crimson `#8F1636`, blue `#0068AD`, plus purple / orange **[hex]**.
- **Reward carousel frame** (Events): dark strip with an angular **red** chamfered frame **[hex] `#FA2422`** and notch details; items are small tiles with a `FREE` / `PREMIUM` caption, check badge, tier number pill **[obs]**.
- **Price pill:** yellow **[hex] `#FCC705`**, dark text, coin glyph, full radius **[obs]**.
- **Status:** check in a round badge, `OWNED` pill, green **[hex] `#22C439`** bright / `#00A700` filled. `NEW!` is a small yellow tag **[obs]**.
- **Progress bars** (Career): thick flat bars on a grey track, colour by category (blue `#0966EF`, green `#01BB01`, pink `#DF416A`, orange) **[hex]**.
- **Circular counters** (Challenges): ring with italic `0/3`, linked by a vertical hairline **[obs]**.
- Icons: **flat, single-colour glyphs, white** on UI chrome; rank / progression badges are rich 3D art **[obs]** (players criticize the mix **[rep]**).

### 1.4 Typography
- **Nav, buttons, labels:** bold condensed sans, **uppercase**, small tracking **[obs]**.
- **Page titles:** large **italic condensed display**, white with a vertical fade / ghosting at the top, with a smaller italic subtitle underneath. (`CHALLENGES / DAILY`, `STORY`, `BATTLE PASS / 2026: SEASON 5`, `EVENT PASS / TAKING REIGN`.) Faction titles use a silver chrome gradient **[obs]**.
- **Body:** regular-weight humanist sans in **sentence case** for descriptions (`Win a game.`) **[obs]**.
- **Numbers:** bold, large for rewards (`3000`), italic for counters (`0/1`), blue numerals inside "PROGRESS: **0** OF **3**" **[obs]**.
- Font names unconfirmed. Logo relatives: Big Noodle Titling / Big Noodle Too **[3p]**.

### 1.5 Countdown language (directly relevant)
All of these are static text, not ticking clocks, and they round to the coarsest unit **[obs]**:

| Where | Wording |
|---|---|
| Challenges, top-right | **`19 HOURS`** big bold, **`TIME LEFT`** small below, right-aligned |
| Events | `EVENT ENDS IN 21 DAYS` |
| Battle Pass | `TIME REMAINING: 21 DAYS`, title `2026: SEASON 5` |
| Shop section header, right | clock icon + `STORE REFRESH IN 1 HOUR` |
| Faction event | `PHASE ENDS IN:` with `TALON 0 WINS` / `OVERWATCH 0 WINS` |

Challenges are tabbed `DAILY · WEEKLY · EVENT · LIFETIME · HERO · STADIUM · COMPETITIVE`. Each tab has its own time-left. Rows show icon, `TITLE`, description, `PROGRESS: x OF y`, completed rows show a check. The right column is a milestone ladder: orange shield glyph + `3000`, `COMPLETE 1 DAILY CHALLENGE`, `REWARD: BATTLE PASS XP`, ring counter. A warning line (`Most challenges cannot be completed in Custom Games or Practice Vs AI.`) sits above the list, filter dropdown to its right.

### 1.6 Motion
Reported, not capturable in stills **[rep]**: animated lightning on the Play button, slide/fade transitions between screens.

### 1.7 What players dislike **[rep]**, used here as anti-patterns
Generic / mobile-like look; hidden labels and collapsed lists (challenges collapsed by default, hero names not shown, competitive buttons without text); UI that moves (searching banner changing position, hover expanding the right cluster); two Back buttons; carousel that feels like an ad reel; Competitive and Drives countdowns shown separately, which implied separate rewards.

---

## 2. Design principles for Resetwatch

1. **Answer "what resets next and when?" in one glance.** Mirrors the in-game `19 HOURS TIME LEFT` block, but exact.
2. **Look like it belongs next to the game's menu**: top bar, blue active tabs, flat orange and white buttons, italic display titles, indigo triangle backgrounds. Do not copy hero art, the logo, or trademarked marks (see §10).
3. **Labels always.** No icon-only buttons.
4. **Nothing moves except countdown digits.** Fixed layout, no hover reflow, no carousels.
5. **Honest times.** Show source and "last verified" for any reset time not published by Blizzard.
6. **Keyboard-first.** Key hints in the bottom corners like the game does.

---

## 3. Color tokens

Sampled values are **[hex]**, the rest **[dec]**.

```css
:root {
  /* Surfaces (from screenshots) */
  --bar:        #0D1424;  /* top bar, icon cells */
  --bg-indigo:  #0F1246;  /* pause-menu / challenges page field */
  --bg-night:   #0C1020;  /* deepest page bg */
  --panel:      #1D253B;  /* sub-tab strip, modal band, dark panels */
  --panel-deep: #111729;  /* cards inside modal */
  --row:        #2D374F;  /* list rows */
  --bg-slate:   #566481;  /* blurred mid-tone page bg (career/story) */
  --bg-slate-hi:#90A5C0;  /* lighter end of the same bg family (shop) */

  /* Interactive */
  --blue:        #0361AF; /* active tab fill */
  --blue-edge:   #3FA9FF; /* underline / plate edge, approximated */   /* [dec] */
  --blue-bar:    #0966EF; /* progress, numerals */
  --orange:      #EA5F12; /* primary button */
  --orange-flare:#FF8A2B; /* button flare, hover */                    /* [dec] */
  --white-btn:   #F5F5F5; /* secondary button bg */
  --ink:         #0D1424; /* text on white */

  /* Status */
  --ok:          #22C439; /* check, owned, done */
  --ok-fill:     #00A700;
  --gold:        #FCC705; /* price pills, NEW tag */
  --crit:        #FA2422; /* premium frame / urgent */
  --pink:        #DF416A; /* category bar */
  --teal:        #026958;
  --crimson:     #8F1636;

  /* Text */
  --text:        #FFFFFF;
  --text-dim:    #B4BDCF;                                              /* [dec] */
  --text-faint:  #7C879D;                                              /* [dec] */

  /* Brand mark only */
  --ow-logo-orange: #FC9D1F;  /* [3p] logo orange. Do NOT use for buttons: UI orange is redder */
}
```

Findings that change earlier assumptions:
- **UI orange (`#EA5F12`) is redder than the logo orange (`#FC9D1F`).** Use the former for buttons.
- **Primary accent for navigation is blue, not orange.** Orange is reserved for the one primary action per screen. White is the secondary button colour.
- Green is for done/owned only, yellow for money/new, red for premium or urgent.
- Backgrounds are dark indigo or mid slate-periwinkle with triangle texture. Panels are always dark and opaque on top of them.

Contrast: white on `--row`, `--panel`, `--bar`, `--blue` all pass AA. White on `--orange` is about 3.6:1: acceptable for large bold button text only, keep ≥18px bold.

---

## 4. Typography

| Role | Spec | Fallback stack (free) |
|---|---|---|
| Page title | Italic condensed display, 64–72px, uppercase, white, top 30% fades to 40% opacity | `"Big Noodle Titling Oblique"` (check license), else **Barlow Condensed 800 italic** |
| Subtitle under title | Same family, 28px italic | Barlow Condensed 700 italic |
| Nav / buttons / labels | Bold condensed, uppercase, 0.04em tracking, 16–18px | **Barlow Condensed 700** |
| Body / descriptions | Humanist sans, sentence case, 14–16px, line-height 1.4 | **Barlow 400/500** |
| Big numbers | Bold condensed, tabular numerals | Barlow Condensed 700 `font-variant-numeric: tabular-nums` |
| Counters `0/3` | Italic condensed, 28px | Barlow Condensed 600 italic |

Scale `[dec]`: 12 / 14 / 16 / 18 / 28 / 48 / 72.

---

## 5. Shape, depth, motion

- **Top bar:** rectangular, 56px, `--bar`, 1px darker bottom edge. No radius.
- **Nav tab:** rectangular. Active = `--blue` fill + 2px `--blue-edge` underline.
- **Sub-tabs:** parallelogram, `skewX(-12deg)` with counter-skewed label, on `--panel` strip.
- **Center plate (the "PLAY" analogue):** chamfered trapezoid hanging 12px below the bar, blue gradient, 2px `--blue-edge` border. In Resetwatch it holds the **next reset** (`WEEKLY · 2D 14H`), not a play button.
- **Buttons:** rectangles, 0 radius, 44px high, text bold caps. Primary orange with a 6px left-edge flare. Secondary white. Never slanted.
- **Cards:** 8px radius. **Rows:** 0 radius. **Chips:** full radius.
- **Reward-style strip:** angular red frame for premium / urgent only. Use once per screen at most.
- **Background texture:** large triangle pattern at 4–6% white on indigo, 15% on slate. Add a slow-moving horizontal blue light streak on the menu-like screens only if `prefers-reduced-motion` is off.
- **Depth:** by fill step (`--bar → --panel → --row`), no drop shadows except a glow on the centre plate.
- **Motion** `[dec]`: screen transition 200ms slide+fade. Hover on primary button: 350ms flare sweep. Countdown digits update in place, no flip. All off under `prefers-reduced-motion`.

---

## 6. Layout and screens

### 6.1 Shell
```
┌ bar ──────────────────────────────────────────────────────────────────────┐
│ ⌂  RESETS  CHALLENGES  SEASONS  HELP      ╲ NEXT · WEEKLY 2D 14H ╱   TZ  🔔  ⚙ │
├ sub-tabs (slanted) ───────────────────────────────────────────────────────┤
│ DAILY  WEEKLY  EVENT  SEASON                                               │
│                                                                            │
│ [ENTER] ...                                                      [ESC] BACK │
└────────────────────────────────────────────────────────────────────────────┘
```
Back screens swap `⌂` for `‹ BACK`.

### 6.2 Resets (home)
- Big italic title `RESETS`, subtitle = current season (`2026: SEASON 5`).
- **Top-right block copies the in-game pattern:** large `2D 14H 37M` + small `TIME LEFT`. Below it the original time in ET and the user's local time.
- Cards in a row (8px radius, `--panel`): Daily, Weekly, Event, Season. Each: label, exact countdown, `ENDS IN 21 DAYS` style summary, small source chip.
- Event and season timers are **separate cards**, each labelled with what actually ends (avoid the "implied separate rewards" confusion).
- States: normal / under 24h `--gold` chip `ENDS SOON` / under 1h `--crit` chip. Text + icon, not only colour.

### 6.3 Challenges (mirrors the game's Challenges screen)
- Tabs: `DAILY · WEEKLY · EVENT · LIFETIME`. (HERO / STADIUM / COMPETITIVE optional later.)
- Left: list of `--row` rows with icon cell, `TITLE`, description, `PROGRESS: x OF y` (numerals `--blue-bar`), checkbox state.
- Right: milestone ladder with ring counters `0/1 · 0/2 · 0/3` and reward text.
- Top-right: `TIME LEFT` block, same as the game.
- Warning line + filter dropdown (white, dark text) above the list.
- User ticks rows manually. Progress is stored locally.

### 6.4 Seasons
- Title `2026: SEASON 5` style, `TIME REMAINING: N DAYS`, week N of M, ticks for each weekly reset.

### 6.5 Settings / notifications
- Modal style from §1.3: full-width `--panel` band, centred title, white `CANCEL`.
- Notifications are one hub (bell). Options: "30 min before weekly reset", "24h before season end".

### 6.6 Footer hints
Left `[ENTER] ...`, right `[ESC] BACK / HOME`, plus `[?] SHORTCUTS`. Keycap: 1px outline, 4px radius, 11px text.

### 6.7 Spacing and grid
4-pt base: 4 / 8 / 12 / 16 / 24 / 32 / 48. Max content width 1200px, 12 columns. Under 720px: bar becomes a bottom tab bar with labels, center plate becomes a sticky header strip.

---

## 7. Reset data (config, not code)

Everything here is unverified.

| Reset | What we know | Confidence |
|---|---|---|
| Daily | Game shows e.g. `19 HOURS TIME LEFT` on the Daily tab. Players say it rolls 20h after your first login/claim **[rep]** | Medium |
| Weekly | Players say Tuesday ~2 PM US Eastern (another source says 1 PM) **[rep]** | Low. Sources disagree by 1h |
| Event | In-game `EVENT ENDS IN 21 DAYS` on the Events screen | High for that screenshot, date unknown |
| Season | Battle Pass title `2026: SEASON 5`, `TIME REMAINING: 21 DAYS` in the screenshot. Season 1 began Tue 10 Feb 2026 **[rep]** | Need the screenshot date to turn "21 days" into an end date |

Rules
- Store resets in `resets.json`: `id, label, rule, anchor, tz, source, verifiedAt`.
- Every timer shows source + `verifiedAt`. Older than 30 days → "may be outdated" chip.
- Show the original ET time next to the local time.
- Dailies: manual "I claimed" button starts a 20h timer, stored locally.
- Prefer the game's own coarse phrasing (`19 HOURS`, `21 DAYS`) as the summary line, exact seconds in the card.

---

## 8. Voice
Short, uppercase labels (`TIME LEFT`, `ENDS IN`, `REWARD:`), sentence case for descriptions. Disclaimers plain: "Community-reported. Blizzard has not published this."

---

## 9. Accessibility
AA contrast. White on orange only for ≥18px bold. Visible focus: 2px `--blue-edge` outline with 2px offset on dark, `--orange` on white buttons. Full keyboard nav. Timers `role="timer"`, announce only on minute/hour change and threshold crossings. State never by colour alone. 44px touch targets. Reduced-motion variant.

---

## 10. Legal / IP
Resetwatch is a fan tool. Do not ship Blizzard's logo, hero art, icons, or the actual font files unless licensed. Recreate the look with own shapes and open fonts, add "Not affiliated with Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc." in the footer.

---

## 11. Open items
1. Re-capture screenshots losslessly (PNG, 1440p+) and re-sample tokens in §3.
2. Confirm the weekly reset time on a Tuesday and record `verifiedAt`.
3. Note the date of the Battle Pass screenshot to compute the Season 5 end date, then fill Seasons 6+ from Blizzard patch notes.
4. Identify the in-game UI font by glyph comparison, then pick the closest legal match.
5. Record the Play-button lightning and tab transitions on video to match timing.
