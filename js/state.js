// Wyrd Workout - State Management

import {
  STORAGE_KEY,
  DEFAULT_SESSION_CONFIG,
  DEFAULT_ROUND_TEMPLATE,
  SUBCLASSES,
  PREFS_STORAGE_KEY,
  getAvailableCategories,
  getSubclassesForCategory
} from './constants.js';

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
    repMode: sessionConfig.repMode,
    advancedDiceMode: sessionConfig.advancedDiceMode,
    categoryDice: sessionConfig.categoryDice
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

// Template priority for accessibility classes (highest priority first)
const TEMPLATE_PRIORITY = ['wheelchair', 'battleseer'];

// Get effective round template based on selected classes
export function getEffectiveRoundTemplate(config) {
  // Check for priority templates first (accessibility classes)
  for (const priorityClass of TEMPLATE_PRIORITY) {
    if (config.subclasses.includes(priorityClass)) {
      const subclass = SUBCLASSES[priorityClass];
      if (subclass && subclass.defaultTemplate) {
        return subclass.defaultTemplate;
      }
    }
  }

  // If only one class selected, use its default template if available
  if (config.subclasses.length === 1) {
    const subclass = SUBCLASSES[config.subclasses[0]];
    if (subclass && subclass.defaultTemplate) {
      return subclass.defaultTemplate;
    }
  }

  // For multiclass or classes without custom templates, use configured or default
  return config.roundTemplate || DEFAULT_ROUND_TEMPLATE;
}

// Check if a category has identical exercise pools across all given subclasses
// Returns true if all classes share the exact same exercises (same array reference or identical content)
export function isCategorySharedPool(subclasses, category) {
  if (subclasses.length <= 1) return false;

  const validSubclasses = getSubclassesForCategory(subclasses, category);
  if (validSubclasses.length <= 1) return false;

  // Get the exercise arrays for each class
  const exerciseArrays = validSubclasses.map(key => SUBCLASSES[key]?.exercises[category]);

  // Check if any are undefined or empty
  if (exerciseArrays.some(arr => !arr || arr.length === 0)) return false;

  // Check if all arrays are the same reference (shared constant like SHARED_CORE_EXERCISES)
  const firstArray = exerciseArrays[0];
  if (exerciseArrays.every(arr => arr === firstArray)) {
    return true;
  }

  // Check if all arrays have identical content (same exercises in same order)
  const firstJson = JSON.stringify(firstArray);
  return exerciseArrays.every(arr => JSON.stringify(arr) === firstJson);
}

// Determine subclass for a slot based on category and config
// Returns: subclass key, or null if user needs to select
function determineSubclassForCategory(config, category) {
  if (!config.multiclass || config.subclasses.length <= 1) {
    // Single class - use it
    return config.subclasses[0];
  }

  // For multiclass, check if category is only available in one class
  const validSubclasses = getSubclassesForCategory(config.subclasses, category);
  if (validSubclasses.length === 1) {
    // Auto-assign the only valid class
    return validSubclasses[0];
  }

  // Check if this category uses a shared pool (identical exercises across classes)
  if (isCategorySharedPool(config.subclasses, category)) {
    // Randomly select a class - user can reroll if they want different "vibes"
    return validSubclasses[Math.floor(Math.random() * validSubclasses.length)];
  }

  // Leave null for user to roll/select (classes have different exercises)
  return null;
}

// Create exercise slots from round template
export function createSlots(config, templateOverride = null) {
  const slots = [];
  const template = templateOverride || getEffectiveRoundTemplate(config);

  for (const templateItem of template) {
    for (let i = 0; i < templateItem.count; i++) {
      const subclass = determineSubclassForCategory(config, templateItem.category);

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
  // Only consider subclasses that have the slot's category available
  const validSubclasses = getSubclassesForCategory(session.config.subclasses, slot.category);
  const availableSubclasses = validSubclasses.length > 0 ? validSubclasses : session.config.subclasses;

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
    totalRepsCompleted: 0,
    exerciseHistory: []
  };

  saveSession();
  notify();
}

// Get the categoryDice key for a slot (handles multiclass format)
function getCategoryDiceKey(config, category, subclass) {
  if (config.multiclass && config.subclasses.length > 1 && subclass) {
    return `${subclass}:${category}`;
  }
  return category;
}

// Get exercise die for a slot (respects advanced mode)
export function getExerciseDieForSlot(config, category, subclass = null) {
  if (!config.advancedDiceMode) return config.exerciseDie;

  const key = getCategoryDiceKey(config, category, subclass);
  if (config.categoryDice[key]) {
    return config.categoryDice[key].exerciseDie || config.exerciseDie;
  }
  // Fallback to category-only key for backwards compatibility
  if (config.categoryDice[category]) {
    return config.categoryDice[category].exerciseDie || config.exerciseDie;
  }
  return config.exerciseDie;
}

// Get rep die for a slot (respects advanced mode)
export function getRepDieForSlot(config, category, subclass = null) {
  if (!config.advancedDiceMode) return config.repDie;

  const key = getCategoryDiceKey(config, category, subclass);
  if (config.categoryDice[key]) {
    return config.categoryDice[key].repDie || config.repDie;
  }
  // Fallback to category-only key for backwards compatibility
  if (config.categoryDice[category]) {
    return config.categoryDice[category].repDie || config.repDie;
  }
  return config.repDie;
}

// Roll exercise for a slot (no notify - caller handles re-render)
export function rollExerciseForSlot(slotIndex, manualValue = null) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  const maxExercise = getExerciseDieForSlot(session.config, slot.category, slot.subclass);

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
  const repDie = getRepDieForSlot(session.config, slot.category, slot.subclass);

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

// Pause the timer (user-initiated, preserves elapsed time)
export function pauseTimer() {
  if (!session || !session.timer.running) return;
  session.timer.running = false;
  session.timer.lastTick = null;
  saveSession();
}

// Resume the timer from paused state
export function resumeTimer() {
  if (!session) return;
  session.timer.running = true;
  session.timer.lastTick = Date.now();
  saveSession();
}

// Check if timer is paused (has elapsed time but not running)
export function isTimerPaused() {
  if (!session) return false;
  return !session.timer.running && session.timer.elapsed > 0;
}

// Complete current exercise (with optional custom rep count for final exercise)
export function completeCurrentExercise(customReps = null) {
  if (!session) return;

  const slot = session.slots[session.currentSlotIndex];
  if (!slot || slot.completed) return;

  // Resume timer if it was paused
  if (!session.timer.running) {
    resumeTimer();
  }

  // Use custom reps if provided, otherwise use full reps
  const repsCompleted = customReps !== null ? customReps : slot.actualReps;

  slot.completed = true;
  session.hpRemaining -= repsCompleted;
  session.totalRepsCompleted += repsCompleted;

  // Record to exercise history
  session.exerciseHistory.push({
    round: session.currentRound,
    category: slot.category,
    subclass: slot.subclass,
    exerciseName: slot.exerciseName,
    reps: repsCompleted
  });

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

  // Resume timer if it was paused
  if (!session.timer.running) {
    resumeTimer();
  }

  // Complete all remaining slots in current round
  const startIndex = session.currentSlotIndex;
  const slotsPerRound = session.slots.length;

  for (let i = startIndex; i < slotsPerRound; i++) {
    const slot = session.slots[i];
    if (!slot.completed) {
      slot.completed = true;
      session.hpRemaining -= slot.actualReps;
      session.totalRepsCompleted += slot.actualReps;

      // Record to exercise history
      session.exerciseHistory.push({
        round: session.currentRound,
        category: slot.category,
        subclass: slot.subclass,
        exerciseName: slot.exerciseName,
        reps: slot.actualReps
      });
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
        const repDie = getRepDieForSlot(session.config, newSlots[i].category, newSlots[i].subclass);
        newSlots[i].repRoll = baseRoll;
        newSlots[i].actualReps = baseRoll + repDie;
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
      // Pause timer on load to prevent accumulating time while page was closed
      // User must explicitly resume, which will set lastTick to current time
      if (session.timer) {
        session.timer.running = false;
        session.timer.lastTick = null;
      }
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
    totalReps: session.totalRepsCompleted,
    exerciseHistory: session.exerciseHistory || [],
    exerciseWeights: session.exerciseWeights || {}
  };
}

// Get weight for an exercise (optionally for a specific round)
export function getExerciseWeight(exerciseName, round = null) {
  if (!session || !session.exerciseWeights) return '';

  const weight = session.exerciseWeights[exerciseName];
  if (!weight) return '';

  // If weight is an object with per-round values
  if (typeof weight === 'object' && round !== null) {
    return weight[round] || '';
  }

  // If weight is a string (all rounds same)
  if (typeof weight === 'string') {
    return weight;
  }

  return '';
}

// Set weight for an exercise
// If round is null, sets for all rounds (linked mode)
// If round is provided, sets for that specific round (unlinked mode)
export function setExerciseWeight(exerciseName, weight, round = null) {
  if (!session) return;

  if (!session.exerciseWeights) {
    session.exerciseWeights = {};
  }

  if (round === null) {
    // Linked mode - same weight for all rounds
    session.exerciseWeights[exerciseName] = weight;
  } else {
    // Unlinked mode - per-round weights
    const existing = session.exerciseWeights[exerciseName];
    if (typeof existing === 'string') {
      // Convert from linked to unlinked
      session.exerciseWeights[exerciseName] = {};
    }
    if (typeof session.exerciseWeights[exerciseName] !== 'object') {
      session.exerciseWeights[exerciseName] = {};
    }
    session.exerciseWeights[exerciseName][round] = weight;
  }

  saveSession();
}

// Clear all weights (for cancel operation)
export function clearExerciseWeights() {
  if (!session) return;
  session.exerciseWeights = {};
  saveSession();
}

// Set all exercise weights at once (for confirm operation)
export function setAllExerciseWeights(weights) {
  if (!session) return;
  session.exerciseWeights = weights;
  saveSession();
}

// Check if completing current exercise would end the workout
export function isFinalExercise() {
  if (!session) return false;
  const slot = session.slots[session.currentSlotIndex];
  if (!slot) return false;
  return session.hpRemaining - slot.actualReps <= 0;
}

// Get minimum reps needed to finish (for final exercise slider)
export function getMinRepsToFinish() {
  if (!session) return 1;
  return Math.max(1, session.hpRemaining);
}

// Clear exercise for rerolling (no notify - caller handles re-render)
export function clearExerciseForSlot(slotIndex) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  slot.exerciseIndex = null;
  slot.exerciseName = null;
  slot.repRoll = null;
  slot.actualReps = null;

  // Also clear from baseRepRolls if in fixed mode
  if (session.baseRepRolls[slotIndex] !== undefined) {
    delete session.baseRepRolls[slotIndex];
  }

  saveSession();
}

// Clear subclass for rerolling (no notify - caller handles re-render)
// Also clears exercise and reps since they depend on subclass
export function clearSubclassForSlot(slotIndex) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  slot.subclass = null;
  slot.exerciseIndex = null;
  slot.exerciseName = null;
  slot.repRoll = null;
  slot.actualReps = null;

  // Also clear from baseRepRolls if in fixed mode
  if (session.baseRepRolls[slotIndex] !== undefined) {
    delete session.baseRepRolls[slotIndex];
  }

  saveSession();
}

// Clear reps for rerolling (no notify - caller handles re-render)
// Keeps exercise intact
export function clearRepsForSlot(slotIndex) {
  if (!session || !session.slots[slotIndex]) return;

  const slot = session.slots[slotIndex];
  slot.repRoll = null;
  slot.actualReps = null;

  // Also clear from baseRepRolls if in fixed mode
  if (session.baseRepRolls[slotIndex] !== undefined) {
    delete session.baseRepRolls[slotIndex];
  }

  saveSession();
}

// Move a slot up or down (no notify - caller handles re-render)
export function moveSlot(slotIndex, direction) {
  if (!session) return false;

  const newIndex = slotIndex + direction;
  if (newIndex < 0 || newIndex >= session.slots.length) return false;

  // Swap slots
  const temp = session.slots[slotIndex];
  session.slots[slotIndex] = session.slots[newIndex];
  session.slots[newIndex] = temp;

  // Also swap base rep rolls if they exist
  const tempRepRoll = session.baseRepRolls[slotIndex];
  const otherRepRoll = session.baseRepRolls[newIndex];

  if (tempRepRoll !== undefined || otherRepRoll !== undefined) {
    if (otherRepRoll !== undefined) {
      session.baseRepRolls[slotIndex] = otherRepRoll;
    } else {
      delete session.baseRepRolls[slotIndex];
    }
    if (tempRepRoll !== undefined) {
      session.baseRepRolls[newIndex] = tempRepRoll;
    } else {
      delete session.baseRepRolls[newIndex];
    }
  }

  saveSession();
  return true;
}

// Delete a slot (no notify - caller handles re-render)
export function deleteSlot(slotIndex) {
  if (!session || session.slots.length <= 1) return false;

  session.slots.splice(slotIndex, 1);

  // Rebuild baseRepRolls with updated indices
  const newBaseRepRolls = {};
  Object.keys(session.baseRepRolls).forEach(key => {
    const idx = parseInt(key);
    if (idx < slotIndex) {
      newBaseRepRolls[idx] = session.baseRepRolls[idx];
    } else if (idx > slotIndex) {
      newBaseRepRolls[idx - 1] = session.baseRepRolls[idx];
    }
    // Skip the deleted index
  });
  session.baseRepRolls = newBaseRepRolls;

  saveSession();
  return true;
}

// Duplicate a slot (category only, no rolled values) - no notify - caller handles re-render
export function duplicateSlot(slotIndex) {
  if (!session || !session.slots[slotIndex]) return false;

  const originalSlot = session.slots[slotIndex];
  const subclass = determineSubclassForCategory(session.config, originalSlot.category);

  const newSlot = {
    category: originalSlot.category,
    subclass,
    exerciseIndex: null,
    exerciseName: null,
    repRoll: null,
    actualReps: null,
    completed: false
  };

  // Insert after the original slot
  session.slots.splice(slotIndex + 1, 0, newSlot);

  // Rebuild baseRepRolls with updated indices
  const newBaseRepRolls = {};
  Object.keys(session.baseRepRolls).forEach(key => {
    const idx = parseInt(key);
    if (idx <= slotIndex) {
      newBaseRepRolls[idx] = session.baseRepRolls[idx];
    } else {
      newBaseRepRolls[idx + 1] = session.baseRepRolls[idx];
    }
  });
  session.baseRepRolls = newBaseRepRolls;

  saveSession();
  return true;
}

// Add a new slot with a specific category (no notify - caller handles re-render)
export function addSlot(category) {
  if (!session) return false;

  const subclass = determineSubclassForCategory(session.config, category);

  const newSlot = {
    category,
    subclass,
    exerciseIndex: null,
    exerciseName: null,
    repRoll: null,
    actualReps: null,
    completed: false
  };

  session.slots.push(newSlot);
  saveSession();
  return true;
}

// Get union of available categories across all selected subclasses
export function getAvailableCategoriesForSession() {
  if (!session) return [];

  const allCategories = new Set();
  session.config.subclasses.forEach(subclass => {
    getAvailableCategories(subclass).forEach(cat => allCategories.add(cat));
  });

  return Array.from(allCategories);
}
