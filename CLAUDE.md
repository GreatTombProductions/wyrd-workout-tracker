# CLAUDE.md — wyrd-workouts/

Gamified workout tracker with RPG-style character progression and dice-based workout generation.

---

## What This Is

Single-page web app ("Worldtree Workout") that gamifies strength training using RPG mechanics. Choose a character class based on equipment (Dumbbell Fighter, Hammer Barbarian, Sandbag Grappler, etc.), roll dice to generate workouts, track progress through experience and levels, and complete 12-week campaigns. Each class has ~60-100 exercises across movement patterns (push, pull, squat/hinge, lunge, core, cardio).

**Target users:** Community tool for Ray's fitness-interested audience. Wyrd Workout Tracker for 12-week campaigns.

---

## Tech Stack

**Pure Frontend:**
- Vanilla JavaScript (ES6 modules)
- Local Storage (all state persists client-side)
- HTML5 + CSS3
- html2canvas (for summary screenshots)
- Zero build process, zero backend

**Fonts:**
- Cinzel (fantasy headers)
- Crimson Text (body)

---

## How to Run Locally

```bash
cd /Users/rayheberer/Documents/greattomb/community-tools/wyrd-workouts
# Open index.html in browser, or:
python3 -m http.server 8000
# Visit http://localhost:8000
```

For remote verification:
```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

---

## Current State

**Status:** Maintenance mode - 12-week campaign runs through mid-April 2026

**Last Activity:** January 25, 2026
- 953c483 Change button text
- c337c6c Tweak edit icon positioning
- 3e3c420 Tweak button sizes

**Implementation Status:**
- Core workout generation: ✅ Complete
- Character classes: ✅ 9 classes with full exercise libraries
- Dice system: ✅ Roll-based workout generation
- Progress tracking: ✅ XP, levels, campaign tracking
- Screenshot sharing: ✅ Summary image generation
- Exercise database: 🟡 Partial - some classes still need screenshots

**Classes & Data Collection:**
- ✅ Combat Wheelchair (12 push, 12 pull, 10 cardio)
- ✅ Battleseer Staff (20 upper, 12 lower, 20 core, 4 cardio)
- ✅ Fighter Dumbbell (12/10/12/10/20)
- ✅ Barbarian Hammer (14/14/13/20/20)
- ✅ Grappler Sandbag (12/12/12/14/20)
- ✅ Guardian Weight Plate (8/12/10/12/20)
- 🟡 Ranger Bodyweight (need screenshots)
- 🟡 Berserker Kettlebell (placeholders)
- 🟡 Archer Resistance Band (placeholders)

---

## Key Files & Entry Points

**Main Files:**
- `index.html` - Entry point, app container
- `styles.css` - All visual styling
- `js/app.js` - App initialization, routing
- `js/screens.js` - All screen components (character select, workout, summary, etc.)
- `js/state.js` - State management, local storage persistence
- `js/constants.js` - Exercise database, class definitions

**Documentation:**
- `EXERCISE_TRACKING.md` - Progress table for exercise data collection
- `IMPLEMENTATION_PROMPT.md` - Original implementation spec

**Assets:**
- `screenshots/` - Exercise demonstration images (organized by class)
  - `bodyweight/`, `dumbbell/`, `hammer/`, `plate/`, `sandbag/`, `staff/`, `wheelchair/`

---

## Patterns & Conventions

**Character Classes:**
Each class maps to equipment type:
- Combat Wheelchair: Seated DB/Band/Weapon
- Battleseer Staff: Staff
- Fighter Dumbbell: Single Dumbbell
- Barbarian Hammer: Hammer/Mace
- Grappler Sandbag: Sandbag
- Guardian Weight Plate: Weight Plate
- Ranger Bodyweight: Bodyweight
- Berserker Kettlebell: Kettlebell
- Archer Resistance Band: Resistance Band

**Movement Patterns:**
Exercises organized by pattern:
- Push (chest, shoulders, triceps)
- Pull (back, biceps)
- Squat/Hinge (legs, glutes, lower back)
- Lunge (unilateral leg work)
- Core (abs, obliques, anti-rotation)
- Cardio (conditioning, weapon strikes)

**Dice System:**
- Strength Die: Determines load/difficulty (1d6: 40/50/60/70/80/90%)
- Exercise Dice: Randomly select exercises from class library
- Hit Points: Total reps/work to complete (12-20 per exercise)
- Workout Structure: Roll generates 5-6 exercises, distributed across patterns

**Progression:**
- XP awarded per workout completion
- Level up every X workouts
- 12-week campaign format
- Summary screenshots for social sharing

**State Management:**
- All data stored in localStorage
- State structure: character, campaign, workout history, settings
- Auto-save on state changes
- Export/import functionality

---

## Notes

**Current Campaign:**
12-week campaign runs through mid-April 2026. Community tool—users track their own progress.

**Data Collection Status:**
- 6 classes fully documented with screenshots
- 3 classes need exercise screenshots (Ranger, Berserker, Archer)
- Priority: Complete Ranger Bodyweight (most accessible class)

**Screenshot System:**
Uses html2canvas to generate shareable summary images:
- Workout summary (exercises completed, XP earned)
- Campaign progress
- Character stats

**Mobile Considerations:**
- Progressive Web App capable
- Apple mobile web app meta tags
- Touch-optimized interface
- Works offline after first load

**Design Aesthetic:**
- Fantasy RPG theme (not generic fitness tracker)
- Dark earthy palette (#2a2520 brown-black)
- Cinzel font for headers (fantasy feel)
- Crimson Text for readability

---

## Related Projects

Part of Ray's fitness content ecosystem. Complements:
- Megan Ash content (strength/fashion pillar)
- Infinite Necromancy (habit tracking with different mechanics)

---

*Community tool for 12-week campaign runs. Maintenance mode—stable, functional, occasional UI tweaks. Mid-April 2026 campaign completion target.*
