// Wyrd Workout - State Management

import { STORAGE_KEY, DEFAULT_SESSION_CONFIG, SUBCLASSES, PREFS_STORAGE_KEY } from './constants.js';

// App state
let currentScreen = 'setup'; // 'setup' | 'roll' | 'workout' | 'victory'
let sessionConfig = { ...DEFAULT_SESSION_CONFIG };
let session = null;
let listeners = [];

// Load saved preferences on init
function loadPreferences() {
  const saved = localStorage.getItem(PREFS_STORAGE_KEY);
  if (saved) {
    try {
      const prefs = JSON.parse(saved);
      sessionConfig = { ...DEFAULT_SESSION_CONFIG, ...prefs };
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }
}

// Save preferences to localStorage
function savePreferences() {
  const prefs = {
    subclasses: sessionConfig.subclasses,
    multiclass: sessionConfig.multiclass,
    exerciseDie: sessionConfig.exerciseDie,
    repDie: sessionConfig.repDie,
    diceLocked: sessionConfig.diceLocked,
    hpThreshold: sessionConfig.hpThreshold,
    repMode: sessionConfig.repMode
  };
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

// Initialize preferences
loadPreferences();

// Subscribe to state changes
export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Notify all listeners of state change
function notify() {
  listeners.forEach(listener => listener(getState()));
}

// Get current state
export function getState() {
  return {
    currentScreen,
    sessionConfig,
    session
  };
}

// Set current screen
export function setScreen(screen) {
  currentScreen = screen;
  notify();
}

// Update session config (no notify - setup screen handles its own state)
export function updateConfig(updates) {
  sessionConfig = { ...sessionConfig, ...updates };
  savePreferences();
}

// Roll a die
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Get exercise for a slot
export function getExercise(subclass, category, index) {
  const subclassData = SUBCLASSES[subclass];
  if (!subclassData || !subclassData.exercises[category]) {
    return `Unknown Exercise`;
  }
  const exercises = subclassData.exercises[category];
  // Index is 1-based, clamp to available exercises
  const safeIndex = Math.min(index, exercises.length) - 1;
  return exercises[safeIndex] || `${category} ${index}`;
}

// Create exercise slots from round template
export function createSlots(config) {
  const slots = [];

  for (const templateItem of config.roundTemplate) {
    for (let i = 0; i < templateItem.count; i++) {
      // If multiclass with multiple subclasses, leave null for user to roll/select
      // Otherwise, use the single subclass
      const subclass = (config.multiclass && config.subclasses.length > 1)
        ? null
        : config.subclasses[0];

      slots.push({
        category: templateItem.category,
        subclass,
        exerciseIndex: null,
        exerciseName: null,
        repRoll: null,
        actualReps: null,
        completed: false
      });
    }
  }

  return slots;
}

// Roll or set subclass for a slot (no notify - caller handles re-render)
export function rollSubclassForSlot(slotIndex, manualValue = null) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  const availableSubclasses = session.config.subclasses;

  // Use manual value or roll randomly
  if (manualValue !== null && availableSubclasses.includes(manualValue)) {
    slot.subclass = manualValue;
  } else {
    slot.subclass = availableSubclasses[Math.floor(Math.random() * availableSubclasses.length)];
  }

  saveSession();
}

// Initialize a new session
export function initSession() {
  const slots = createSlots(sessionConfig);

  session = {
    config: { ...sessionConfig },
    slots,
    currentSlotIndex: 0,
    currentRound: 1,
    hpRemaining: sessionConfig.hpThreshold,
    timer: {
      elapsed: 0,
      running: false,
      lastTick: null
    },
    baseRepRolls: {},
    totalRepsCompleted: 0
  };

  saveSession();
  notify();
}

// Roll exercise for a slot (no notify - caller handles re-render)
export function rollExerciseForSlot(slotIndex, manualValue = null) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  const maxExercise = session.config.exerciseDie;

  // Use manual value or roll
  const roll = manualValue !== null
    ? Math.max(1, Math.min(maxExercise, manualValue))
    : rollDie(maxExercise);

  slot.exerciseIndex = roll;
  slot.exerciseName = getExercise(slot.subclass, slot.category, roll);

  saveSession();
}

// Roll reps for a slot (no notify - caller handles re-render)
export function rollRepsForSlot(slotIndex, manualValue = null) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  const repDie = session.config.repDie;

  // Use manual value or roll
  const roll = manualValue !== null
    ? Math.max(1, Math.min(repDie, manualValue))
    : rollDie(repDie);

  slot.repRoll = roll;
  slot.actualReps = roll + repDie;

  // Store base rep roll for fixed mode
  if (session.config.repMode === 'fixed') {
    session.baseRepRolls[slotIndex] = roll;
  }

  saveSession();
}

// Check if all slots have subclasses selected
export function allSubclassesSelected() {
  if (!session) return false;
  return session.slots.every(slot => slot.subclass !== null);
}

// Check if all slots have exercises rolled
export function allExercisesRolled() {
  if (!session) return false;
  return session.slots.every(slot => slot.exerciseIndex !== null);
}

// Check if all slots have reps rolled
export function allRepsRolled() {
  if (!session) return false;
  return session.slots.every(slot => slot.repRoll !== null);
}

// Start the workout timer (no notify - called before setScreen)
export function startTimer() {
  if (!session) return;
  session.timer.running = true;
  session.timer.lastTick = Date.now();
  saveSession();
}

// Update timer (call this from animation frame) - no notify, caller updates display
export function updateTimer() {
  if (!session || !session.timer.running) return;

  const now = Date.now();
  if (session.timer.lastTick) {
    session.timer.elapsed += now - session.timer.lastTick;
  }
  session.timer.lastTick = now;
}

// Stop the timer (no notify - called before setScreen)
export function stopTimer() {
  if (!session) return;
  session.timer.running = false;
  session.timer.lastTick = null;
  saveSession();
}

// Complete current exercise
export function completeCurrentExercise() {
  if (!session) return;

  const slot = session.slots[session.currentSlotIndex];
  if (!slot || slot.completed) return;

  slot.completed = true;
  session.hpRemaining -= slot.actualReps;
  session.totalRepsCompleted += slot.actualReps;

  // Check for victory
  if (session.hpRemaining <= 0) {
    stopTimer();
    saveSession();
    setScreen('victory');
    return;
  }

  // Move to next slot
  advanceToNextSlot();
}

// Complete entire round
export function completeRound() {
  if (!session) return;

  // Complete all remaining slots in current round
  const startIndex = session.currentSlotIndex;
  const slotsPerRound = session.slots.length;

  for (let i = startIndex; i < slotsPerRound; i++) {
    const slot = session.slots[i];
    if (!slot.completed) {
      slot.completed = true;
      session.hpRemaining -= slot.actualReps;
      session.totalRepsCompleted += slot.actualReps;
    }
  }

  // Check for victory
  if (session.hpRemaining <= 0) {
    stopTimer();
    saveSession();
    setScreen('victory');
    return;
  }

  // Start new round
  startNewRound();
}

// Advance to next slot (no notify - caller handles re-render)
function advanceToNextSlot() {
  if (!session) return;

  const nextIndex = session.currentSlotIndex + 1;

  if (nextIndex >= session.slots.length) {
    // End of round
    startNewRound();
  } else {
    session.currentSlotIndex = nextIndex;
    saveSession();
  }
}

// Start a new round
function startNewRound() {
  if (!session) return;

  session.currentRound++;
  session.currentSlotIndex = 0;

  // Reset slots for new round
  const newSlots = createSlots(session.config);

  // Copy exercise rolls (they stay the same)
  for (let i = 0; i < newSlots.length; i++) {
    const oldSlot = session.slots[i];
    newSlots[i].exerciseIndex = oldSlot.exerciseIndex;
    newSlots[i].exerciseName = oldSlot.exerciseName;
    newSlots[i].subclass = oldSlot.subclass;

    if (session.config.repMode === 'fixed') {
      // Use base rep rolls
      const baseRoll = session.baseRepRolls[i];
      if (baseRoll !== undefined) {
        newSlots[i].repRoll = baseRoll;
        newSlots[i].actualReps = baseRoll + session.config.repDie;
      }
    }
    // For per-round mode, reps stay null and will be rolled
  }

  session.slots = newSlots;

  // If per-round mode and reps not rolled, go to roll screen
  if (session.config.repMode === 'per-round' && !session.slots[0].repRoll) {
    saveSession();
    setScreen('roll');
    return;
  }

  saveSession();
  // No notify - caller (workout listener) handles re-render
}

// Save session to localStorage
export function saveSession() {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

// Load session from localStorage
export function loadSession() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      session = JSON.parse(saved);
      sessionConfig = session.config;
      return true;
    } catch (e) {
      console.error('Failed to load session:', e);
      return false;
    }
  }
  return false;
}

// Clear saved session
export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  session = null;
  notify();
}

// Check if there's a saved session
export function hasSavedSession() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Get formatted timer string
export function getFormattedTime() {
  if (!session) return '00:00';

  const totalSeconds = Math.floor(session.timer.elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Get current exercise slot
export function getCurrentSlot() {
  if (!session) return null;
  return session.slots[session.currentSlotIndex];
}

// Get session stats for victory screen
export function getSessionStats() {
  if (!session) return null;

  return {
    totalTime: getFormattedTime(),
    totalRounds: session.currentRound,
    totalReps: session.totalRepsCompleted
  };
}
