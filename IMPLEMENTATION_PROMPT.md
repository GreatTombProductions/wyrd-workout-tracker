**Implementation Prompt: Wyrd Workout Tracker**

---

## Overview

Mobile-optimized web app for tracking "Roll for Workout" style exercise sessions. Norse/grimoire aesthetic. No backend—all state in localStorage with session persistence.

---

## Core Mechanics

**Dice available:** D4, D6, D8, D10, D12, D20

**HP Thresholds (by rep die):**
```javascript
const HP_RECOMMENDATIONS = {
  4: 100,
  6: 150,
  8: 200,
  10: 250,
  12: 300,
  20: 550
};
// Interpolate for intermediate values if needed
```

**Rep calculation:** `actualReps = roll + dieSides` (so D6 roll of 3 = 9 reps)

**Exercise lists:** Cap at die value (D8 can only access exercises 1-8 in the list). Higher numbers = harder exercises.

---

## Data Model

```typescript
type DieSize = 4 | 6 | 8 | 10 | 12 | 20;

type Category = string; // "Push" | "Pull" | "Squat/Hinge" | "Lunge" | "Core" | "Cardio" | etc.

type Subclass = {
  name: string;
  equipment: string;
  exercises: Record<Category, string[]>; // ordered easiest→hardest, up to 20
};

type RoundTemplate = { category: Category; count: number }[]; // ordered

type SessionConfig = {
  subclasses: string[];           // allows multiclass
  exerciseDie: DieSize;
  repDie: DieSize;
  hpThreshold: number;
  roundTemplate: RoundTemplate;
  rollMode: "all-at-once" | "reveal";
  repMode: "fixed" | "per-round";
};

type ExerciseSlot = {
  category: Category;
  subclass: string;               // which subclass this was rolled from
  exerciseIndex: number;          // 1-indexed roll result
  exerciseName: string;
  repRoll: number | null;         // null if not yet rolled (reveal mode)
  actualReps: number | null;      // repRoll + repDie
  completed: boolean;
};

type Session = {
  config: SessionConfig;
  slots: ExerciseSlot[];          // the round template, populated with rolls
  currentSlotIndex: number;
  currentRound: number;
  hpRemaining: number;
  timer: {
    elapsed: number;              // milliseconds
    running: boolean;
    lastTick: number | null;
  };
  baseRepRolls: Record<number, number>; // slot index → rep roll, for fixed mode
};
```

---

## Subclass Definitions (Placeholder Content)

```javascript
const SUBCLASSES = {
  ranger: { name: "Ranger", equipment: "Bodyweight", exercises: { /* ... */ } },
  barbarian: { name: "Barbarian", equipment: "Hammer", exercises: { /* ... */ } },
  fighter: { name: "Fighter", equipment: "Dumbbell", exercises: { /* ... */ } },
  grappler: { name: "Grappler", equipment: "Sandbag", exercises: { /* ... */ } },
  guardian: { name: "Guardian", equipment: "Weightplate", exercises: { /* ... */ } },
  berserker: { name: "Berserker", equipment: "Kettlebell", exercises: { /* ... */ } },
  archer: { name: "Archer", equipment: "Resistance Band", exercises: { /* ... */ } },
};

const DEFAULT_ROUND_TEMPLATE = [
  { category: "Push", count: 1 },
  { category: "Pull", count: 1 },
  { category: "Squat/Hinge", count: 1 },
  { category: "Lunge", count: 1 },
  { category: "Core", count: 1 },
];
```

Populate each subclass's exercise lists with 20 placeholder exercises per category (e.g., "Push 1", "Push 2"... or thematically appropriate placeholders). These will be updated when Tank releases the full lists.

**Multiclass roll:** When multiple subclasses selected, for each slot, randomly select which subclass's exercise list to use before rolling exercise index.

---

## UX Flow

### Screen 1: Character Setup
- Select subclass(es) (multi-select for multiclass)
- Select exercise die (default: D6)
- Select rep die (default: D6, coupled to exercise die by default with option to decouple)
- HP threshold with recommended value shown, editable
- Roll mode toggle: "All at once" (default) / "Reveal as you go"
- Rep mode toggle: "Fixed" (default) / "Per round"
- "Begin Workout" button

### Screen 2: Roll Phase

**All-at-once mode:**
- Display full round template with roll buttons/inputs for each slot
- For each slot: show category, roll button (generates random), OR manual input field
- Once all exercises rolled, roll reps for each (same generate/input pattern)
- "Enter the Grounds" button when complete

**Reveal mode:**
- Show first slot only
- Roll exercise → show result → roll reps → show result → "Next" to advance
- Continue until all slots have rolls
- "Enter the Grounds" button

### Screen 3: Workout Active

**Header:** 
- Timer (mm:ss), running
- HP bar showing `hpRemaining / hpThreshold`
- Current round number

**Main area:**
- Current exercise prominently displayed (name, category, rep count)
- Visual indicator of position in round (dots or similar)

**Actions:**
- "Complete" button → marks current slot done, subtracts reps from HP, advances to next slot
- "Complete Round" button → marks all remaining slots in round done, subtracts total remaining reps

**Round transition:**
- When last slot of round completed, if HP > 0:
  - If `repMode === "per-round"`: show brief roll phase for new rep values
  - If `repMode === "fixed"`: auto-populate from baseRepRolls, continue immediately
- Increment round counter, reset to first slot

**Victory condition:**
- When `hpRemaining <= 0`: stop timer, show victory screen

### Screen 4: Victory
- "The Encounter Ends"
- Total time
- Rounds completed
- Total reps performed
- "New Workout" button

---

## Session Persistence

- Save to localStorage on every state change
- On app load, check for existing session
- If found: prompt "Resume workout?" or "Abandon and start fresh"
- Abandoned sessions are cleared

---

## Aesthetic Direction

**Palette:**
- Background: dark aged parchment texture (#2a2520 base)
- Primary accent: muted burgundy (#6b3a3a)
- Secondary accent: deep forest green (#3a4a3a)
- Text: warm off-white (#e8e0d5)
- HP bar: gradient from burgundy (full) to forest green (depleted)

**Typography:**
- Headers: serif with slight uncial influence (consider Cinzel or similar)
- Body: clean readable serif

**Vibe:** Grimoire that's seen use. World Tree roots going *down*. Witchy-Nordic rather than heroic-Nordic. Hel's hospitality.

**Micro-interactions:**
- Dice rolls: brief tumble animation
- Exercise complete: subtle pulse/fade
- Victory: something satisfying but not over-the-top

---

## Technical Notes

- React or vanilla JS, single-page app
- Mobile-first, touch targets minimum 44px
- Timer uses `requestAnimationFrame` or `setInterval` with drift correction
- All config (subclasses, round templates, HP table) in clearly separated constants file for easy editing
- No build step preferred (or minimal—Vite if needed)

---

## Out of Scope for MVP

- User accounts / cloud sync
- Workout history / analytics
- Custom exercise list editing in-app
- Social features / sharing

---

*End of spec. This should be implementable in a single Claude Code session.*