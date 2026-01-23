// Wyrd Workout - Screen Rendering

import { DIE_SIZES, SUBCLASSES, CATEGORIES, getRecommendedHP, getAvailableCategories, getSubclassesForCategory } from './constants.js';

// Helper to generate exercise options for a select dropdown
function getExerciseOptions(subclass, category, exerciseDie) {
  const subclassData = SUBCLASSES[subclass];
  if (!subclassData || !subclassData.exercises[category]) {
    return [];
  }
  const exercises = subclassData.exercises[category];
  const options = [];

  // Only show options up to the number of available exercises (no duplicates)
  const maxOptions = Math.min(exerciseDie, exercises.length);
  for (let i = 1; i <= maxOptions; i++) {
    const exerciseName = exercises[i - 1] || `${category} ${i}`;
    options.push({ value: i, label: `${i}. ${exerciseName}` });
  }

  return options;
}
import * as State from './state.js';

// Render the setup screen
export function renderSetupScreen(container) {
  const state = State.getState();
  const config = state.sessionConfig;

  container.innerHTML = `
    <div class="screen">
      <header class="title-header">
        <h1>Wyrd of the World Tree</h1>
        <h2 class="subtitle">Workout Tracker</h2>
      </header>

      <div class="screen-content">
        <div class="form-group">
          <div class="label-row">
            <label>Choose Your Class</label>
            <label class="multiclass-toggle">
              <input type="checkbox" id="multiclass-toggle" ${config.multiclass ? 'checked' : ''}>
              <span>Multiclass</span>
            </label>
          </div>
          <div class="subclass-grid">
            ${Object.entries(SUBCLASSES).map(([key, subclass]) => `
              <div class="subclass-option">
                <input type="${config.multiclass ? 'checkbox' : 'radio'}"
                       id="subclass-${key}"
                       name="subclass"
                       value="${key}"
                       ${config.subclasses.includes(key) ? 'checked' : ''}>
                <label for="subclass-${key}">
                  <span class="subclass-name">${subclass.name}</span>
                  <span class="subclass-equipment">${subclass.equipment}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>Exercise Die</label>
          <div class="die-selector">
            ${DIE_SIZES.map(size => `
              <div class="die-option">
                <input type="radio"
                       id="exercise-die-${size}"
                       name="exerciseDie"
                       value="${size}"
                       ${config.exerciseDie === size ? 'checked' : ''}>
                <label for="exercise-die-${size}">D${size}</label>
              </div>
            `).join('')}
            <div class="die-option die-option--custom">
              <input type="radio"
                     id="exercise-die-custom"
                     name="exerciseDie"
                     value="custom"
                     ${!DIE_SIZES.includes(config.exerciseDie) ? 'checked' : ''}>
              <label for="exercise-die-custom" id="exercise-die-custom-label">D${!DIE_SIZES.includes(config.exerciseDie) ? config.exerciseDie : '?'}</label>
            </div>
          </div>
          <div class="die-guide">Beginner: D4–D6 · Intermediate: D6–D20 · Advanced: D20</div>
        </div>

        <div class="die-link-row">
          <button type="button" class="die-link-btn ${config.diceLocked ? 'die-link-btn--active' : ''}" id="dice-link-toggle">
            ${config.diceLocked ? '&#x1F517;' : '&#x26D3;'}
          </button>
          <span class="die-link-label">${config.diceLocked ? 'Linked' : 'Unlinked'}</span>
        </div>

        <div class="form-group">
          <label>Rep Die</label>
          <div class="die-selector">
            ${DIE_SIZES.map(size => `
              <div class="die-option">
                <input type="radio"
                       id="rep-die-${size}"
                       name="repDie"
                       value="${size}"
                       ${config.repDie === size ? 'checked' : ''}>
                <label for="rep-die-${size}">D${size}</label>
              </div>
            `).join('')}
            <div class="die-option die-option--custom">
              <input type="radio"
                     id="rep-die-custom"
                     name="repDie"
                     value="custom"
                     ${!DIE_SIZES.includes(config.repDie) ? 'checked' : ''}>
              <label for="rep-die-custom" id="rep-die-custom-label">D${!DIE_SIZES.includes(config.repDie) ? config.repDie : '?'}</label>
            </div>
          </div>
          <div class="die-guide">Beginner: D4–D6 · Intermediate: D8–D12 · Advanced: D12–D20</div>
        </div>

        <div class="form-group">
          <label>Encounter HP</label>
          <div class="hp-input-group">
            <input type="number"
                   id="hp-threshold"
                   value="${config.hpThreshold}"
                   min="50"
                   max="1000"
                   step="10">
            <span class="hp-recommendation">Recommended: ${getRecommendedHP(config.repDie)}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Rep Mode</label>
          <div class="toggle-group">
            <div class="toggle-option">
              <input type="radio"
                     id="rep-mode-fixed"
                     name="repMode"
                     value="fixed"
                     ${config.repMode === 'fixed' ? 'checked' : ''}>
              <label for="rep-mode-fixed">Fixed</label>
            </div>
            <div class="toggle-option">
              <input type="radio"
                     id="rep-mode-round"
                     name="repMode"
                     value="per-round"
                     ${config.repMode === 'per-round' ? 'checked' : ''}>
              <label for="rep-mode-round">Per Round</label>
            </div>
          </div>
        </div>
      </div>

      <div class="screen-footer">
        <button class="btn btn--full" id="begin-workout">Begin Workout</button>
      </div>
    </div>
  `;

  // Attach event listeners
  attachSetupListeners(container);
}

function attachSetupListeners(container) {
  // Helper to update subclass grid without full re-render
  function updateSubclassGrid() {
    const state = State.getState();
    const config = state.sessionConfig;
    const grid = container.querySelector('.subclass-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(SUBCLASSES).map(([key, subclass]) => `
      <div class="subclass-option">
        <input type="${config.multiclass ? 'checkbox' : 'radio'}"
               id="subclass-${key}"
               name="subclass"
               value="${key}"
               ${config.subclasses.includes(key) ? 'checked' : ''}>
        <label for="subclass-${key}">
          <span class="subclass-name">${subclass.name}</span>
          <span class="subclass-equipment">${subclass.equipment}</span>
        </label>
      </div>
    `).join('');

    // Re-attach subclass listeners
    attachSubclassListeners();
  }

  // Attach listeners to subclass inputs
  function attachSubclassListeners() {
    container.querySelectorAll('input[name="subclass"]').forEach(input => {
      input.addEventListener('change', () => {
        const checked = Array.from(container.querySelectorAll('input[name="subclass"]:checked'))
          .map(el => el.value);
        if (checked.length > 0) {
          State.updateConfig({ subclasses: checked });
        } else {
          // Prevent deselecting all - recheck this one
          input.checked = true;
        }
      });
    });
  }

  // Multiclass toggle
  const multiclassToggle = container.querySelector('#multiclass-toggle');
  if (multiclassToggle) {
    multiclassToggle.addEventListener('change', () => {
      const isMulticlass = multiclassToggle.checked;
      const state = State.getState();
      // If turning off multiclass, keep only the first selected class
      if (!isMulticlass && state.sessionConfig.subclasses.length > 1) {
        State.updateConfig({ multiclass: isMulticlass, subclasses: [state.sessionConfig.subclasses[0]] });
      } else {
        State.updateConfig({ multiclass: isMulticlass });
      }
      // Update just the subclass grid
      updateSubclassGrid();
    });
  }

  // Initial subclass listeners
  attachSubclassListeners();

  // Dice link toggle
  const diceLinkBtn = container.querySelector('#dice-link-toggle');
  if (diceLinkBtn) {
    diceLinkBtn.addEventListener('click', () => {
      const state = State.getState();
      const newLocked = !state.sessionConfig.diceLocked;
      State.updateConfig({ diceLocked: newLocked });
      // Update button appearance
      diceLinkBtn.classList.toggle('die-link-btn--active', newLocked);
      diceLinkBtn.innerHTML = newLocked ? '&#x1F517;' : '&#x26D3;';
      const linkLabel = container.querySelector('.die-link-label');
      if (linkLabel) linkLabel.textContent = newLocked ? 'Linked' : 'Unlinked';
      // If locking, sync rep die to exercise die
      if (newLocked) {
        const exerciseDie = state.sessionConfig.exerciseDie;
        const recommended = getRecommendedHP(exerciseDie);
        State.updateConfig({ repDie: exerciseDie, hpThreshold: recommended });
        updateDieUI('rep', exerciseDie);
        updateHPUI(recommended);
      }
    });
  }

  // Helper to update die selector UI without re-render
  function updateDieUI(type, value) {
    const isCustom = !DIE_SIZES.includes(value);
    // Uncheck all
    container.querySelectorAll(`input[name="${type === 'exercise' ? 'exerciseDie' : 'repDie'}"]`).forEach(input => {
      input.checked = false;
    });
    if (isCustom) {
      const customRadio = container.querySelector(`#${type}-die-custom`);
      const customLabel = container.querySelector(`#${type}-die-custom-label`);
      if (customRadio) customRadio.checked = true;
      if (customLabel) customLabel.textContent = `D${value}`;
    } else {
      const radio = container.querySelector(`#${type}-die-${value}`);
      if (radio) radio.checked = true;
      // Reset custom label
      const customLabel = container.querySelector(`#${type}-die-custom-label`);
      if (customLabel) customLabel.textContent = 'D?';
    }
  }

  // Helper to update HP UI
  function updateHPUI(recommended) {
    const hpInput = container.querySelector('#hp-threshold');
    const hpRec = container.querySelector('.hp-recommendation');
    if (hpInput) hpInput.value = recommended;
    if (hpRec) hpRec.textContent = `Recommended: ${recommended}`;
  }

  // Helper to apply die value with linked sync
  function applyDieValue(type, value) {
    const state = State.getState();
    const recommended = getRecommendedHP(value);

    if (state.sessionConfig.diceLocked) {
      State.updateConfig({ exerciseDie: value, repDie: value, hpThreshold: recommended });
      // Update both die selectors
      updateDieUI('exercise', value);
      updateDieUI('rep', value);
      updateHPUI(recommended);
    } else if (type === 'exercise') {
      State.updateConfig({ exerciseDie: value });
      updateDieUI('exercise', value);
    } else {
      State.updateConfig({ repDie: value, hpThreshold: recommended });
      updateDieUI('rep', value);
      updateHPUI(recommended);
    }
  }

  // Show custom die modal
  function showCustomDieModal(type) {
    const state = State.getState();
    const currentValue = type === 'exercise' ? state.sessionConfig.exerciseDie : state.sessionConfig.repDie;
    const initialValue = DIE_SIZES.includes(currentValue) ? '' : currentValue;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h2>Custom Die</h2>
        <div class="modal-input-group">
          <label>D</label>
          <input type="number" id="custom-die-input" min="1" max="100" value="${initialValue}" placeholder="?">
        </div>
        <div class="modal-buttons">
          <button class="btn btn--full" id="custom-die-confirm">Confirm</button>
          <button class="btn btn--full btn--secondary" id="custom-die-cancel">Cancel</button>
        </div>
      </div>
    `;

    container.appendChild(overlay);

    const input = overlay.querySelector('#custom-die-input');
    input.focus();
    input.select();

    const confirm = () => {
      const value = parseInt(input.value);
      if (value && value >= 1) {
        applyDieValue(type, value);
      }
      overlay.remove();
    };

    overlay.querySelector('#custom-die-confirm').addEventListener('click', confirm);
    overlay.querySelector('#custom-die-cancel').addEventListener('click', () => overlay.remove());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
      if (e.key === 'Escape') overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // Exercise die radio buttons
  container.querySelectorAll('input[name="exerciseDie"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.value === 'custom') {
        showCustomDieModal('exercise');
        // Revert to previous selection until modal confirms
        const state = State.getState();
        updateDieUI('exercise', state.sessionConfig.exerciseDie);
        return;
      }
      applyDieValue('exercise', parseInt(input.value));
    });
  });

  // Rep die radio buttons
  container.querySelectorAll('input[name="repDie"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.value === 'custom') {
        showCustomDieModal('rep');
        // Revert to previous selection until modal confirms
        const state = State.getState();
        updateDieUI('rep', state.sessionConfig.repDie);
        return;
      }
      applyDieValue('rep', parseInt(input.value));
    });
  });

  // HP threshold
  const hpInput = container.querySelector('#hp-threshold');
  if (hpInput) {
    hpInput.addEventListener('change', () => {
      State.updateConfig({ hpThreshold: parseInt(hpInput.value) || 150 });
    });
  }

  // Rep mode
  container.querySelectorAll('input[name="repMode"]').forEach(input => {
    input.addEventListener('change', () => {
      State.updateConfig({ repMode: input.value });
    });
  });

  // Begin workout button
  const beginBtn = container.querySelector('#begin-workout');
  if (beginBtn) {
    beginBtn.addEventListener('click', () => {
      State.initSession();
      State.setScreen('roll');
    });
  }
}

// Render the roll phase screen
export function renderRollScreen(container) {
  const state = State.getState();
  const session = state.session;

  if (!session) {
    State.setScreen('setup');
    return;
  }

  const isNewRound = session.currentRound > 1 && session.config.repMode === 'per-round';

  container.innerHTML = `
    <div class="screen">
      <h1>${isNewRound ? `Round ${session.currentRound}` : 'Roll Your Fate'}</h1>
      ${!isNewRound ? '<p class="roll-subheader">Use inputs for physical dice</p>' : ''}

      <div class="screen-content">
        ${renderAllAtOnceMode(session, isNewRound)}
      </div>

      <div class="screen-footer">
        <button class="btn btn--full btn--secondary mb-md"
                id="enter-workout"
                ${!canEnterWorkout(session, isNewRound) ? 'disabled' : ''}>
          Enter the Grounds
        </button>
        ${!isNewRound ? `
          <button class="btn btn--full btn--danger" id="back-to-setup">
            Back to Setup
          </button>
        ` : ''}
      </div>
    </div>
  `;

  attachRollListeners(container, session, isNewRound);
}

// Render a single slot's HTML
function renderSingleSlot(session, slot, index, isNewRound) {
  const isMulticlass = session.config.multiclass && session.config.subclasses.length > 1;
  const canEdit = !isNewRound;
  const hasSubclass = slot.subclass !== null;
  const hasExercise = slot.exerciseIndex !== null;
  const hasReps = slot.repRoll !== null;
  const subclassName = hasSubclass ? (SUBCLASSES[slot.subclass]?.name || slot.subclass) : '???';
  const categoryDisplay = slot.category;
  const canRerollExercise = !isNewRound && hasExercise;
  const canRerollClass = !isNewRound && isMulticlass && hasSubclass && !hasExercise;
  const canRerollReps = !isNewRound && hasReps;
  const canDelete = canEdit && session.slots.length > 1;
  const isFirst = index === 0;
  const isLast = index === session.slots.length - 1;

  // Determine if we need controls (select/input + button)
  const hasControls = (!isNewRound && isMulticlass && !hasSubclass) ||
                      (!isNewRound && hasSubclass && !hasExercise) ||
                      (hasExercise && !hasReps);

  return `
    <div class="roll-slot ${hasExercise && hasReps ? 'roll-slot--complete' : ''}" data-slot-index="${index}">
      ${canEdit ? `
        <div class="slot-controls-left">
          <button class="slot-btn slot-btn--move" data-move-up="${index}" ${isFirst ? 'disabled' : ''} title="Move Up">▲</button>
          <button class="slot-btn slot-btn--move" data-move-down="${index}" ${isLast ? 'disabled' : ''} title="Move Down">▼</button>
        </div>
      ` : ''}
      <div class="roll-slot-main">
        <div class="roll-slot-header">
          <span class="roll-slot-category" data-category="${slot.category}">${categoryDisplay}</span>
          ${hasExercise ? `
            <span class="roll-slot-result">
              ${canRerollExercise ? `<button class="reroll-btn" data-reroll="${index}" title="Reroll Exercise">↻</button>` : ''}
              ${slot.exerciseName}
              ${hasReps ? `${canRerollReps ? `<button class="reroll-btn" data-reroll-reps="${index}" title="Reroll Reps">↻</button>` : ''}<strong>× ${slot.actualReps}</strong>` : ''}
              <span class="text-muted">(${subclassName})</span>
            </span>
          ` : `<span class="roll-slot-subclass text-muted">${canRerollClass ? `<button class="reroll-btn" data-reroll-class="${index}" title="Reroll Class">↻</button>` : ''}${subclassName}</span>`}
        </div>
        ${hasControls ? `
          <div class="roll-controls">
            ${!isNewRound && isMulticlass && !hasSubclass ? (() => {
              const validSubclasses = getSubclassesForCategory(session.config.subclasses, slot.category);
              return `
              <select class="roll-select" data-slot="${index}" data-type="subclass">
                <option value="">Select...</option>
                ${validSubclasses.map(key => `
                  <option value="${key}">${SUBCLASSES[key]?.name || key}</option>
                `).join('')}
              </select>
              <button class="btn btn--small" data-roll-subclass="${index}">Roll<br>Class</button>
            `;
            })() : ''}
            ${!isNewRound && hasSubclass && !hasExercise ? `
              <select class="roll-select" data-slot="${index}" data-type="exercise">
                <option value="">Select...</option>
                ${getExerciseOptions(slot.subclass, slot.category, session.config.exerciseDie).map(opt => `
                  <option value="${opt.value}">${opt.label}</option>
                `).join('')}
              </select>
              <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
            ` : ''}
            ${hasExercise && !hasReps ? `
              <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                     min="1" max="${session.config.repDie}">
              <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll<br>Reps</button>
            ` : ''}
          </div>
        ` : ''}
      </div>
      ${canEdit ? `
        <div class="slot-controls-right">
          <button class="slot-btn" data-duplicate="${index}" title="Duplicate">⧉</button>
          <button class="slot-btn slot-btn--delete" data-delete="${index}" ${!canDelete ? 'disabled' : ''} title="Delete">×</button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderAllAtOnceMode(session, isNewRound) {
  const canEdit = !isNewRound;

  const slotsHtml = session.slots.map((slot, index) =>
    renderSingleSlot(session, slot, index, isNewRound)
  ).join('');

  if (canEdit) {
    return slotsHtml + `
      <div class="slot-actions-container">
        <button class="btn btn--small btn--secondary" id="add-exercise-card">+ Add Exercise</button>
        <button class="btn btn--small" id="roll-all-btn">Roll All</button>
      </div>
    `;
  }

  return slotsHtml;
}

// Refresh all slot indices after structural changes (move/delete/duplicate/add)
function refreshAllSlots(container, session, isNewRound) {
  const slotsContainer = container.querySelector('.screen-content');
  if (!slotsContainer) return;

  // Get existing slot elements
  const slotElements = slotsContainer.querySelectorAll('.roll-slot');

  // Update each slot's HTML in place
  session.slots.forEach((slot, index) => {
    const newHtml = renderSingleSlot(session, slot, index, isNewRound);
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const newSlotEl = temp.firstElementChild;

    if (slotElements[index]) {
      slotElements[index].replaceWith(newSlotEl);
    } else {
      // New slot (from duplicate/add) - insert before action buttons
      const addContainer = slotsContainer.querySelector('.slot-actions-container');
      if (addContainer) {
        addContainer.insertAdjacentElement('beforebegin', newSlotEl);
      } else {
        slotsContainer.appendChild(newSlotEl);
      }
    }
  });

  // Remove extra slots if any were deleted
  const updatedSlotElements = slotsContainer.querySelectorAll('.roll-slot');
  for (let i = session.slots.length; i < updatedSlotElements.length; i++) {
    updatedSlotElements[i].remove();
  }

  // Re-attach listeners to the updated slots
  reattachSlotListeners(container, session, isNewRound);
}

// Re-attach all slot-related listeners after DOM updates
function reattachSlotListeners(container, session, isNewRound) {
  // Re-attach roll controls listeners
  container.querySelectorAll('.roll-controls').forEach(controlsEl => {
    attachSlotListeners(container, controlsEl, session, isNewRound);
  });

  // Re-attach reroll listeners
  container.querySelectorAll('[data-reroll]').forEach(btn => {
    attachRerollListener(container, btn, session, isNewRound);
  });
  container.querySelectorAll('[data-reroll-class]').forEach(btn => {
    attachRerollClassListener(container, btn, session, isNewRound);
  });
  container.querySelectorAll('[data-reroll-reps]').forEach(btn => {
    attachRerollRepsListener(container, btn, session, isNewRound);
  });

  // Re-attach manipulation listeners
  if (!isNewRound) {
    attachSlotManipulationListeners(container, session, isNewRound);
  }

  // Update enter button state
  updateEnterButton(container, session, isNewRound);
}

function renderRevealMode(session) {
  // Find the current slot to reveal
  let currentIndex = 0;
  for (let i = 0; i < session.slots.length; i++) {
    if (session.slots[i].exerciseIndex === null || session.slots[i].repRoll === null) {
      currentIndex = i;
      break;
    }
    if (i === session.slots.length - 1) {
      currentIndex = i; // All done
    }
  }

  return session.slots.map((slot, index) => {
    const hasExercise = slot.exerciseIndex !== null;
    const hasReps = slot.repRoll !== null;
    const isCurrent = index === currentIndex;
    const isHidden = index > currentIndex;
    const subclassName = SUBCLASSES[slot.subclass]?.name || slot.subclass;
    const categoryDisplay = slot.category;
    const hasControls = isCurrent && (!hasExercise || !hasReps);

    if (isHidden) {
      return `
        <div class="roll-slot" style="opacity: 0.3">
          <div class="roll-slot-main">
            <div class="roll-slot-header">
              <span class="roll-slot-category" data-category="${slot.category}">${slot.category}</span>
              <span class="roll-slot-subclass text-muted">???</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="roll-slot ${isCurrent ? 'roll-slot--active' : ''} ${hasExercise && hasReps ? 'roll-slot--complete' : ''}">
        <div class="roll-slot-main">
          <div class="roll-slot-header">
            <span class="roll-slot-category" data-category="${slot.category}">${categoryDisplay}</span>
            ${hasExercise ? `
              <span class="roll-slot-result">
                ${slot.exerciseName}
                ${hasReps ? `<strong>× ${slot.actualReps}</strong>` : ''}
                <span class="text-muted">(${subclassName})</span>
              </span>
            ` : `<span class="roll-slot-subclass text-muted">${subclassName}</span>`}
          </div>
          ${hasControls ? `
            <div class="roll-controls">
              ${!hasExercise ? `
                <input type="number" class="roll-input" data-slot="${index}" data-type="exercise"
                       min="1" max="${session.config.exerciseDie}">
                <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
              ` : !hasReps ? `
                <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                       min="1" max="${session.config.repDie}">
                <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll</button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function canEnterWorkout(session, isNewRound) {
  if (isNewRound) {
    // Just need reps rolled
    return session.slots.every(slot => slot.repRoll !== null);
  }
  // Check subclasses are selected (for multiclass)
  const allSubclassesSelected = session.slots.every(slot => slot.subclass !== null);
  return allSubclassesSelected && State.allExercisesRolled() && State.allRepsRolled();
}

// Update a single roll slot's DOM without full re-render
function updateRollSlot(container, session, index, isNewRound) {
  const slot = session.slots[index];
  const slotEl = container.querySelectorAll('.roll-slot')[index];
  if (!slotEl) return;

  const hasSubclass = slot.subclass !== null;
  const hasExercise = slot.exerciseIndex !== null;
  const hasReps = slot.repRoll !== null;
  const subclassName = hasSubclass ? (SUBCLASSES[slot.subclass]?.name || slot.subclass) : '???';
  const isMulticlass = session.config.multiclass && session.config.subclasses.length > 1;
  const canRerollExercise = !isNewRound && hasExercise;
  const canRerollClass = !isNewRound && isMulticlass && hasSubclass && !hasExercise;
  const canRerollReps = !isNewRound && hasReps;

  // Determine if we need controls
  const hasControls = (!isNewRound && isMulticlass && !hasSubclass) ||
                      (!isNewRound && hasSubclass && !hasExercise) ||
                      (hasExercise && !hasReps);

  // Update complete state
  if (hasExercise && hasReps) {
    slotEl.classList.add('roll-slot--complete');
  } else {
    slotEl.classList.remove('roll-slot--complete');
  }

  // Update the header content (category + result/subclass)
  const headerEl = slotEl.querySelector('.roll-slot-header');
  if (headerEl) {
    if (hasExercise) {
      // Replace subclass span with result span if needed
      const subclassEl = headerEl.querySelector('.roll-slot-subclass');
      if (subclassEl) {
        const resultSpan = document.createElement('span');
        resultSpan.className = 'roll-slot-result';
        resultSpan.innerHTML = `
          ${canRerollExercise ? `<button class="reroll-btn" data-reroll="${index}" title="Reroll Exercise">↻</button>` : ''}
          ${slot.exerciseName}
          ${hasReps ? `${canRerollReps ? `<button class="reroll-btn" data-reroll-reps="${index}" title="Reroll Reps">↻</button>` : ''}<strong>× ${slot.actualReps}</strong>` : ''}
          <span class="text-muted">(${subclassName})</span>
        `;
        subclassEl.replaceWith(resultSpan);
      } else {
        // Update existing result span
        const resultEl = headerEl.querySelector('.roll-slot-result');
        if (resultEl) {
          resultEl.innerHTML = `
            ${canRerollExercise ? `<button class="reroll-btn" data-reroll="${index}" title="Reroll Exercise">↻</button>` : ''}
            ${slot.exerciseName}
            ${hasReps ? `${canRerollReps ? `<button class="reroll-btn" data-reroll-reps="${index}" title="Reroll Reps">↻</button>` : ''}<strong>× ${slot.actualReps}</strong>` : ''}
            <span class="text-muted">(${subclassName})</span>
          `;
        }
      }

      // Attach reroll listeners
      const rerollExerciseBtn = headerEl.querySelector('[data-reroll]');
      if (rerollExerciseBtn) {
        attachRerollListener(container, rerollExerciseBtn, session, isNewRound);
      }
      const rerollRepsBtn = headerEl.querySelector('[data-reroll-reps]');
      if (rerollRepsBtn) {
        attachRerollRepsListener(container, rerollRepsBtn, session, isNewRound);
      }
    } else {
      // Update subclass display
      const subclassEl = headerEl.querySelector('.roll-slot-subclass');
      if (subclassEl) {
        subclassEl.innerHTML = `${canRerollClass ? `<button class="reroll-btn" data-reroll-class="${index}" title="Reroll Class">↻</button>` : ''}${subclassName}`;

        const rerollClassBtn = subclassEl.querySelector('[data-reroll-class]');
        if (rerollClassBtn) {
          attachRerollClassListener(container, rerollClassBtn, session, isNewRound);
        }
      }
    }
  }

  // Update controls
  const mainEl = slotEl.querySelector('.roll-slot-main');
  let controlsEl = slotEl.querySelector('.roll-controls');

  if (hasControls) {
    let newControls = '';

    if (!isNewRound && isMulticlass && !hasSubclass) {
      const validSubclasses = getSubclassesForCategory(session.config.subclasses, slot.category);
      newControls = `
        <select class="roll-select" data-slot="${index}" data-type="subclass">
          <option value="">Select...</option>
          ${validSubclasses.map(key => `
            <option value="${key}">${SUBCLASSES[key]?.name || key}</option>
          `).join('')}
        </select>
        <button class="btn btn--small" data-roll-subclass="${index}">Roll<br>Class</button>
      `;
    } else if (!isNewRound && hasSubclass && !hasExercise) {
      newControls = `
        <select class="roll-select" data-slot="${index}" data-type="exercise">
          <option value="">Select...</option>
          ${getExerciseOptions(slot.subclass, slot.category, session.config.exerciseDie).map(opt => `
            <option value="${opt.value}">${opt.label}</option>
          `).join('')}
        </select>
        <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
      `;
    } else if (hasExercise && !hasReps) {
      newControls = `
        <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
               min="1" max="${session.config.repDie}">
        <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll<br>Reps</button>
      `;
    }

    if (controlsEl) {
      controlsEl.innerHTML = newControls;
    } else {
      // Create controls element if it doesn't exist
      controlsEl = document.createElement('div');
      controlsEl.className = 'roll-controls';
      controlsEl.innerHTML = newControls;
      mainEl.appendChild(controlsEl);
    }

    // Re-attach listeners for the new controls
    attachSlotListeners(container, controlsEl, session, isNewRound);
  } else if (controlsEl) {
    // Remove controls if no longer needed
    controlsEl.remove();
  }
}

// Attach reroll exercise button listener
function attachRerollListener(container, btn, session, isNewRound) {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.reroll);
    State.clearExerciseForSlot(index);
    updateRollSlot(container, State.getState().session, index, isNewRound);
    updateEnterButton(container, State.getState().session, isNewRound);
  });
}

// Attach reroll class button listener
function attachRerollClassListener(container, btn, session, isNewRound) {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.rerollClass);
    State.clearSubclassForSlot(index);
    updateRollSlot(container, State.getState().session, index, isNewRound);
    updateEnterButton(container, State.getState().session, isNewRound);
  });
}

// Attach reroll reps button listener
function attachRerollRepsListener(container, btn, session, isNewRound) {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.rerollReps);
    State.clearRepsForSlot(index);
    updateRollSlot(container, State.getState().session, index, isNewRound);
    updateEnterButton(container, State.getState().session, isNewRound);
  });
}

// Update the Enter button disabled state
function updateEnterButton(container, session, isNewRound) {
  const enterBtn = container.querySelector('#enter-workout');
  if (enterBtn) {
    enterBtn.disabled = !canEnterWorkout(session, isNewRound);
  }
}

// Attach listeners to a single slot's controls
function attachSlotListeners(container, controlsEl, session, isNewRound) {
  // Roll subclass button
  const subclassBtn = controlsEl.querySelector('[data-roll-subclass]');
  if (subclassBtn) {
    subclassBtn.addEventListener('click', () => {
      const index = parseInt(subclassBtn.dataset.rollSubclass);
      const select = controlsEl.querySelector(`select[data-type="subclass"]`);
      const manualValue = select && select.value ? select.value : null;

      subclassBtn.classList.add('dice-roll');
      State.rollSubclassForSlot(index, manualValue);

      setTimeout(() => {
        updateRollSlot(container, State.getState().session, index, isNewRound);
        updateEnterButton(container, State.getState().session, isNewRound);
      }, 100);
    });
  }

  // Subclass select
  const subclassSelect = controlsEl.querySelector('select[data-type="subclass"]');
  if (subclassSelect) {
    subclassSelect.addEventListener('change', () => {
      if (subclassSelect.value) {
        const index = parseInt(subclassSelect.dataset.slot);
        State.rollSubclassForSlot(index, subclassSelect.value);

        setTimeout(() => {
          updateRollSlot(container, State.getState().session, index, isNewRound);
          updateEnterButton(container, State.getState().session, isNewRound);
        }, 100);
      }
    });
  }

  // Exercise select
  const exerciseSelect = controlsEl.querySelector('select[data-type="exercise"]');
  if (exerciseSelect) {
    exerciseSelect.addEventListener('change', () => {
      if (exerciseSelect.value) {
        const index = parseInt(exerciseSelect.dataset.slot);
        State.rollExerciseForSlot(index, parseInt(exerciseSelect.value));

        setTimeout(() => {
          updateRollSlot(container, State.getState().session, index, isNewRound);
          updateEnterButton(container, State.getState().session, isNewRound);
        }, 100);
      }
    });
  }

  // Roll exercise button
  const exerciseBtn = controlsEl.querySelector('[data-roll-exercise]');
  if (exerciseBtn) {
    exerciseBtn.addEventListener('click', () => {
      const index = parseInt(exerciseBtn.dataset.rollExercise);
      const select = controlsEl.querySelector(`select[data-type="exercise"]`);
      const manualValue = select && select.value ? parseInt(select.value) : null;

      exerciseBtn.classList.add('dice-roll');
      State.rollExerciseForSlot(index, manualValue);

      setTimeout(() => {
        updateRollSlot(container, State.getState().session, index, isNewRound);
        updateEnterButton(container, State.getState().session, isNewRound);
      }, 100);
    });
  }

  // Roll reps button
  const repsBtn = controlsEl.querySelector('[data-roll-reps]');
  if (repsBtn) {
    repsBtn.addEventListener('click', () => {
      const index = parseInt(repsBtn.dataset.rollReps);
      const input = controlsEl.querySelector(`input[data-type="reps"]`);
      const manualValue = input && input.value ? parseInt(input.value) : null;

      repsBtn.classList.add('dice-roll');
      State.rollRepsForSlot(index, manualValue);

      setTimeout(() => {
        updateRollSlot(container, State.getState().session, index, isNewRound);
        updateEnterButton(container, State.getState().session, isNewRound);
      }, 100);
    });
  }

  // Reps input - change button text when user types
  const repsInput = controlsEl.querySelector('input[data-type="reps"]');
  if (repsInput && repsBtn) {
    repsInput.addEventListener('input', () => {
      if (repsInput.value) {
        repsBtn.classList.add('btn--has-input');
        repsBtn.innerHTML = 'Confirm<br>Input';
      } else {
        repsBtn.classList.remove('btn--has-input');
        repsBtn.innerHTML = 'Roll<br>Reps';
      }
    });
  }
}

function attachRollListeners(container, session, isNewRound) {
  // Attach listeners to each slot's controls
  container.querySelectorAll('.roll-controls').forEach(controlsEl => {
    attachSlotListeners(container, controlsEl, session, isNewRound);
  });

  // Attach reroll exercise button listeners
  container.querySelectorAll('[data-reroll]').forEach(btn => {
    attachRerollListener(container, btn, session, isNewRound);
  });

  // Attach reroll class button listeners
  container.querySelectorAll('[data-reroll-class]').forEach(btn => {
    attachRerollClassListener(container, btn, session, isNewRound);
  });

  // Attach reroll reps button listeners
  container.querySelectorAll('[data-reroll-reps]').forEach(btn => {
    attachRerollRepsListener(container, btn, session, isNewRound);
  });

  // Slot manipulation listeners (only on initial roll)
  if (!isNewRound) {
    attachSlotManipulationListeners(container, session, isNewRound);
  }

  // Enter workout button
  const enterBtn = container.querySelector('#enter-workout');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      State.startTimer();
      State.setScreen('workout');
    });
  }

  // Back to setup button
  const backBtn = container.querySelector('#back-to-setup');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      State.clearSession();
      State.setScreen('setup');
    });
  }
}

// Attach listeners for slot manipulation (move, delete, duplicate, add)
function attachSlotManipulationListeners(container, session, isNewRound) {
  // Move up buttons
  container.querySelectorAll('[data-move-up]').forEach(btn => {
    // Remove existing listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const index = parseInt(newBtn.dataset.moveUp);
      if (State.moveSlot(index, -1)) {
        refreshAllSlots(container, State.getState().session, isNewRound);
      }
    });
  });

  // Move down buttons
  container.querySelectorAll('[data-move-down]').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const index = parseInt(newBtn.dataset.moveDown);
      if (State.moveSlot(index, 1)) {
        refreshAllSlots(container, State.getState().session, isNewRound);
      }
    });
  });

  // Delete buttons
  container.querySelectorAll('[data-delete]').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const index = parseInt(newBtn.dataset.delete);
      if (State.deleteSlot(index)) {
        refreshAllSlots(container, State.getState().session, isNewRound);
      }
    });
  });

  // Duplicate buttons
  container.querySelectorAll('[data-duplicate]').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const index = parseInt(newBtn.dataset.duplicate);
      if (State.duplicateSlot(index)) {
        refreshAllSlots(container, State.getState().session, isNewRound);
      }
    });
  });

  // Add exercise button
  const addBtn = container.querySelector('#add-exercise-card');
  if (addBtn) {
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    newAddBtn.addEventListener('click', () => {
      showAddExerciseModal(container, State.getState().session, isNewRound);
    });
  }

  // Roll All button
  const rollAllBtn = container.querySelector('#roll-all-btn');
  if (rollAllBtn) {
    const newRollAllBtn = rollAllBtn.cloneNode(true);
    rollAllBtn.parentNode.replaceChild(newRollAllBtn, rollAllBtn);
    newRollAllBtn.addEventListener('click', () => {
      rollAllPending(container, isNewRound);
    });
  }
}

// Roll all pending slots sequentially with visual feedback
function rollAllPending(container, isNewRound) {
  const rollDelay = 280; // ~3.5 per second

  // Collect all pending roll buttons in order
  function collectPendingButtons() {
    const buttons = [];
    container.querySelectorAll('.roll-slot').forEach(slot => {
      // Check for subclass roll button
      const subclassBtn = slot.querySelector('[data-roll-subclass]');
      if (subclassBtn) {
        buttons.push(subclassBtn);
        return; // Only one action per slot per pass
      }
      // Check for exercise roll button
      const exerciseBtn = slot.querySelector('[data-roll-exercise]');
      if (exerciseBtn) {
        buttons.push(exerciseBtn);
        return;
      }
      // Check for reps roll button
      const repsBtn = slot.querySelector('[data-roll-reps]');
      if (repsBtn) {
        buttons.push(repsBtn);
      }
    });
    return buttons;
  }

  function rollNext() {
    const buttons = collectPendingButtons();
    if (buttons.length === 0) return;

    const btn = buttons[0];
    btn.click();

    // Schedule next roll after delay
    setTimeout(rollNext, rollDelay);
  }

  rollNext();
}

// Show modal to select a category for adding a new exercise
function showAddExerciseModal(container, session, isNewRound) {
  const availableCategories = State.getAvailableCategoriesForSession();

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Add Exercise</h3>
        <button class="modal-close" title="Close">×</button>
      </div>
      <div class="modal-content">
        <p>Select a category:</p>
        <div class="category-options">
          ${availableCategories.map(cat =>
            `<button class="btn btn--small btn--secondary category-btn" data-category="${cat}">${cat}</button>`
          ).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Category buttons
  modal.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      State.addSlot(category);
      modal.remove();
      refreshAllSlots(container, State.getState().session, isNewRound);
    });
  });
}

// Render the workout screen
export function renderWorkoutScreen(container) {
  const state = State.getState();
  const session = state.session;

  if (!session) {
    State.setScreen('setup');
    return;
  }

  const currentSlot = State.getCurrentSlot();
  const hpPercent = Math.max(0, (session.hpRemaining / session.config.hpThreshold) * 100);
  const remainingInRound = session.slots.length - session.currentSlotIndex;
  const isFinal = State.isFinalExercise();
  const minReps = State.getMinRepsToFinish();
  const isPaused = State.isTimerPaused();

  container.innerHTML = `
    <div class="screen">
      <div class="workout-header">
        <div class="timer-row">
          <div class="timer ${isPaused ? 'timer--paused' : ''}">${State.getFormattedTime()}</div>
          <button class="btn btn--small btn--pause" id="pause-timer">
            ${isPaused ? '&#9654;' : '&#10074;&#10074;'}
          </button>
        </div>
        <div class="round-indicator">Round ${session.currentRound}</div>
      </div>

      <div class="screen-content workout-content">
        <div class="workout-center">
          <div class="hp-bar-container">
            <div class="hp-bar">
              <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
              <div class="hp-bar-text">${session.hpRemaining} / ${session.config.hpThreshold}</div>
            </div>
          </div>

          ${currentSlot ? `
            <div class="exercise-card">
              <div class="exercise-category" data-category="${currentSlot.category}">${currentSlot.category}</div>
              <div class="exercise-name">${currentSlot.exerciseName}</div>
              <div class="exercise-reps" id="rep-display">${currentSlot.actualReps}</div>
              <div class="exercise-reps-label">reps</div>
              ${isFinal ? `
                <div class="final-rep-slider">
                  <input type="range" id="rep-slider"
                         min="${minReps}" max="${currentSlot.actualReps}"
                         value="${currentSlot.actualReps}">
                  <div class="slider-labels">
                    <span>${minReps} (min)</span>
                    <span>${currentSlot.actualReps} (full)</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="screen-footer">
        <div class="round-progress">
          ${session.slots.map((slot, index) => `
            <div class="round-dot ${slot.completed ? 'round-dot--completed' : ''} ${index === session.currentSlotIndex ? 'round-dot--current' : ''}"></div>
          `).join('')}
        </div>
        <button class="btn btn--full btn--complete mb-md" id="complete-exercise">
          ${isFinal ? 'Finish Workout' : 'Complete'}
        </button>
        <button class="btn btn--full btn--danger" id="complete-round">
          Complete Round (${remainingInRound} exercises)
        </button>
      </div>
    </div>
  `;

  attachWorkoutListeners(container, isFinal);
}

function attachWorkoutListeners(container, isFinal) {
  // Pause/resume button
  const pauseBtn = container.querySelector('#pause-timer');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      const timerEl = container.querySelector('.timer');
      if (State.isTimerPaused()) {
        State.resumeTimer();
        // Update UI without full re-render
        if (timerEl) timerEl.classList.remove('timer--paused');
        pauseBtn.innerHTML = '&#10074;&#10074;';
      } else {
        State.pauseTimer();
        // Update UI without full re-render
        if (timerEl) timerEl.classList.add('timer--paused');
        pauseBtn.innerHTML = '&#9654;';
      }
    });
  }

  // Slider for final exercise
  const slider = container.querySelector('#rep-slider');
  const repDisplay = container.querySelector('#rep-display');
  if (slider && repDisplay) {
    slider.addEventListener('input', () => {
      repDisplay.textContent = slider.value;
    });
  }

  const completeBtn = container.querySelector('#complete-exercise');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      // Use slider value if this is the final exercise
      const customReps = isFinal && slider ? parseInt(slider.value) : null;
      State.completeCurrentExercise(customReps);
      // Re-render if still on workout screen (victory transition handled by state)
      const state = State.getState();
      if (state.currentScreen === 'workout' && window.wyrdForceRender) {
        window.wyrdForceRender();
      }
    });
  }

  const completeRoundBtn = container.querySelector('#complete-round');
  if (completeRoundBtn) {
    completeRoundBtn.addEventListener('click', () => {
      State.completeRound();
      // Re-render if still on workout screen
      const state = State.getState();
      if (state.currentScreen === 'workout' && window.wyrdForceRender) {
        window.wyrdForceRender();
      }
    });
  }
}

// Render the victory screen
export function renderVictoryScreen(container) {
  const stats = State.getSessionStats();

  if (!stats) {
    State.setScreen('setup');
    return;
  }

  // Group exercises by round
  const exercisesByRound = {};
  stats.exerciseHistory.forEach(ex => {
    if (!exercisesByRound[ex.round]) {
      exercisesByRound[ex.round] = [];
    }
    exercisesByRound[ex.round].push(ex);
  });

  container.innerHTML = `
    <div class="screen">
      <h1 class="victory-title">The Encounter Ends</h1>

      <div class="screen-content">
        <div class="victory-stats">
          <div class="victory-stat">
            <div class="victory-stat-value">${stats.totalTime}</div>
            <div class="victory-stat-label">Time</div>
          </div>
          <div class="victory-stat">
            <div class="victory-stat-value">${stats.totalRounds}</div>
            <div class="victory-stat-label">Rounds</div>
          </div>
          <div class="victory-stat">
            <div class="victory-stat-value">${stats.totalReps}</div>
            <div class="victory-stat-label">Reps</div>
          </div>
        </div>

        <div class="victory-history">
          ${Object.entries(exercisesByRound).map(([round, exercises]) => `
            <div class="victory-round">
              <div class="victory-round-header">Round ${round}</div>
              <div class="victory-exercises">
                ${exercises.map(ex => `
                  <div class="victory-exercise">
                    <span class="victory-exercise-name">${ex.exerciseName}</span>
                    <span class="victory-exercise-reps">× ${ex.reps}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="screen-footer">
        <button class="btn btn--full" id="new-workout">New Workout</button>
      </div>
    </div>
  `;

  const newBtn = container.querySelector('#new-workout');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      State.clearSession();
      State.setScreen('setup');
    });
  }
}

// Render the resume modal
export function renderResumeModal(container, onResume, onAbandon) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Unfinished Battle</h2>
      <p>You have a workout in progress. Do you wish to continue the fight?</p>
      <div class="modal-buttons">
        <button class="btn btn--full" id="resume-workout">Resume Workout</button>
        <button class="btn btn--full btn--secondary" id="abandon-workout">Abandon & Start Fresh</button>
      </div>
    </div>
  `;

  container.appendChild(overlay);

  overlay.querySelector('#resume-workout').addEventListener('click', () => {
    overlay.remove();
    onResume();
  });

  overlay.querySelector('#abandon-workout').addEventListener('click', () => {
    overlay.remove();
    onAbandon();
  });
}
