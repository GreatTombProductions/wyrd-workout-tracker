// Wyrd Workout - Screen Rendering

import { DIE_SIZES, SUBCLASSES, getRecommendedHP } from './constants.js';
import * as State from './state.js';

// Render the setup screen
export function renderSetupScreen(container) {
  const state = State.getState();
  const config = state.sessionConfig;

  container.innerHTML = `
    <div class="screen">
      <h1>Wyrd Workout</h1>

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
          </div>
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
          </div>
        </div>

        <div class="form-group">
          <label>HP Threshold</label>
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
      // Re-render to change input types
      renderSetupScreen(container);
    });
  }

  // Subclass selection (works for both radio and checkbox)
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

  // Dice link toggle
  const diceLinkBtn = container.querySelector('#dice-link-toggle');
  if (diceLinkBtn) {
    diceLinkBtn.addEventListener('click', () => {
      const state = State.getState();
      const newLocked = !state.sessionConfig.diceLocked;
      State.updateConfig({ diceLocked: newLocked });
      // If locking, sync rep die to exercise die
      if (newLocked) {
        const exerciseDie = state.sessionConfig.exerciseDie;
        const recommended = getRecommendedHP(exerciseDie);
        State.updateConfig({ repDie: exerciseDie, hpThreshold: recommended });
      }
      renderSetupScreen(container);
    });
  }

  // Exercise die - syncs rep die if locked
  container.querySelectorAll('input[name="exerciseDie"]').forEach(input => {
    input.addEventListener('change', () => {
      const value = parseInt(input.value);
      const state = State.getState();
      if (state.sessionConfig.diceLocked) {
        const recommended = getRecommendedHP(value);
        State.updateConfig({ exerciseDie: value, repDie: value, hpThreshold: recommended });
        // Update rep die UI
        const repDieInput = container.querySelector(`input[name="repDie"][value="${value}"]`);
        if (repDieInput) repDieInput.checked = true;
        // Update HP
        const hpInput = container.querySelector('#hp-threshold');
        const hpRec = container.querySelector('.hp-recommendation');
        if (hpInput) hpInput.value = recommended;
        if (hpRec) hpRec.textContent = `Recommended: ${recommended}`;
      } else {
        State.updateConfig({ exerciseDie: value });
      }
    });
  });

  // Rep die - auto-sets HP, syncs exercise die if locked
  container.querySelectorAll('input[name="repDie"]').forEach(input => {
    input.addEventListener('change', () => {
      const value = parseInt(input.value);
      const recommended = getRecommendedHP(value);
      const state = State.getState();
      if (state.sessionConfig.diceLocked) {
        State.updateConfig({ exerciseDie: value, repDie: value, hpThreshold: recommended });
        // Update exercise die UI
        const exerciseDieInput = container.querySelector(`input[name="exerciseDie"][value="${value}"]`);
        if (exerciseDieInput) exerciseDieInput.checked = true;
      } else {
        State.updateConfig({ repDie: value, hpThreshold: recommended });
      }
      // Update HP input and recommendation text
      const hpInput = container.querySelector('#hp-threshold');
      const hpRec = container.querySelector('.hp-recommendation');
      if (hpInput) hpInput.value = recommended;
      if (hpRec) hpRec.textContent = `Recommended: ${recommended}`;
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
        <button class="btn btn--full btn--secondary"
                id="enter-workout"
                ${!canEnterWorkout(session, isNewRound) ? 'disabled' : ''}>
          Enter the Grounds
        </button>
      </div>
    </div>
  `;

  attachRollListeners(container, session, isNewRound);
}

function renderAllAtOnceMode(session, isNewRound) {
  return session.slots.map((slot, index) => {
    const hasExercise = slot.exerciseIndex !== null;
    const hasReps = slot.repRoll !== null;
    const subclassName = SUBCLASSES[slot.subclass]?.name || slot.subclass;

    return `
      <div class="roll-slot ${hasExercise && hasReps ? 'roll-slot--complete' : ''}">
        <div class="roll-slot-info">
          <div class="roll-slot-category">${slot.category}</div>
          ${hasExercise ? `
            <div class="roll-slot-result">
              ${slot.exerciseName}
              ${hasReps ? `<strong>× ${slot.actualReps}</strong>` : ''}
              <span class="text-muted">(${subclassName})</span>
            </div>
          ` : `<div class="roll-slot-result text-muted">${subclassName}</div>`}
        </div>
        <div class="roll-controls">
          ${!isNewRound ? `
            ${!hasExercise ? `
              <input type="number" class="roll-input" data-slot="${index}" data-type="exercise"
                     min="1" max="${session.config.exerciseDie}" placeholder="1-${session.config.exerciseDie}">
              <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
            ` : ''}
          ` : ''}
          ${hasExercise && !hasReps ? `
            <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                   min="1" max="${session.config.repDie}" placeholder="1-${session.config.repDie}">
            <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll<br>Reps</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
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

    if (isHidden) {
      return `
        <div class="roll-slot" style="opacity: 0.3">
          <div class="roll-slot-info">
            <div class="roll-slot-category">${slot.category}</div>
            <div class="roll-slot-result text-muted">???</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="roll-slot ${isCurrent ? 'roll-slot--active' : ''} ${hasExercise && hasReps ? 'roll-slot--complete' : ''}">
        <div class="roll-slot-info">
          <div class="roll-slot-category">${slot.category}</div>
          ${hasExercise ? `
            <div class="roll-slot-result">
              ${slot.exerciseName}
              ${hasReps ? `<strong>× ${slot.actualReps}</strong>` : ''}
              <span class="text-muted">(${subclassName})</span>
            </div>
          ` : `<div class="roll-slot-result text-muted">${subclassName}</div>`}
        </div>
        ${isCurrent ? `
          <div class="roll-controls">
            ${!hasExercise ? `
              <input type="number" class="roll-input" data-slot="${index}" data-type="exercise"
                     min="1" max="${session.config.exerciseDie}" placeholder="1-${session.config.exerciseDie}">
              <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
            ` : !hasReps ? `
              <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                     min="1" max="${session.config.repDie}" placeholder="1-${session.config.repDie}">
              <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll</button>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function canEnterWorkout(session, isNewRound) {
  if (isNewRound) {
    // Just need reps rolled
    return session.slots.every(slot => slot.repRoll !== null);
  }
  return State.allExercisesRolled() && State.allRepsRolled();
}

function attachRollListeners(container, session, isNewRound) {
  // Roll exercise buttons
  container.querySelectorAll('[data-roll-exercise]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.rollExercise);
      const input = container.querySelector(`input[data-slot="${index}"][data-type="exercise"]`);
      const manualValue = input && input.value ? parseInt(input.value) : null;

      // Add animation class
      btn.classList.add('dice-roll');

      State.rollExerciseForSlot(index, manualValue);

      // Re-render after a brief delay for animation
      setTimeout(() => {
        if (window.wyrdForceRender) window.wyrdForceRender();
      }, 100);
    });
  });

  // Roll reps buttons
  container.querySelectorAll('[data-roll-reps]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.rollReps);
      const input = container.querySelector(`input[data-slot="${index}"][data-type="reps"]`);
      const manualValue = input && input.value ? parseInt(input.value) : null;

      // Add animation class
      btn.classList.add('dice-roll');

      State.rollRepsForSlot(index, manualValue);

      // Re-render after a brief delay for animation
      setTimeout(() => {
        if (window.wyrdForceRender) window.wyrdForceRender();
      }, 100);
    });
  });

  // Enter workout button
  const enterBtn = container.querySelector('#enter-workout');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      State.startTimer();
      State.setScreen('workout');
    });
  }
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

  container.innerHTML = `
    <div class="screen">
      <div class="workout-header">
        <div class="timer">${State.getFormattedTime()}</div>
        <div class="round-indicator">Round ${session.currentRound}</div>
      </div>

      <div class="hp-bar-container">
        <div class="hp-bar">
          <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
          <div class="hp-bar-text">${session.hpRemaining} / ${session.config.hpThreshold}</div>
        </div>
      </div>

      <div class="screen-content">
        <div class="round-progress">
          ${session.slots.map((slot, index) => `
            <div class="round-dot ${slot.completed ? 'round-dot--completed' : ''} ${index === session.currentSlotIndex ? 'round-dot--current' : ''}"></div>
          `).join('')}
        </div>

        ${currentSlot ? `
          <div class="exercise-card">
            <div class="exercise-category">${currentSlot.category}</div>
            <div class="exercise-name">${currentSlot.exerciseName}</div>
            <div class="exercise-reps">${currentSlot.actualReps}</div>
            <div class="exercise-reps-label">reps</div>
          </div>
        ` : ''}
      </div>

      <div class="screen-footer">
        <button class="btn btn--full btn--pulse mb-md" id="complete-exercise">
          Complete
        </button>
        <button class="btn btn--full btn--secondary" id="complete-round">
          Complete Round (${remainingInRound})
        </button>
      </div>
    </div>
  `;

  attachWorkoutListeners(container);
}

function attachWorkoutListeners(container) {
  const completeBtn = container.querySelector('#complete-exercise');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      State.completeCurrentExercise();
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

  container.innerHTML = `
    <div class="screen victory-screen">
      <h1 class="victory-title">The Encounter Ends</h1>

      <div class="victory-stats">
        <div class="victory-stat">
          <div class="victory-stat-value">${stats.totalTime}</div>
          <div class="victory-stat-label">Total Time</div>
        </div>
        <div class="victory-stat">
          <div class="victory-stat-value">${stats.totalRounds}</div>
          <div class="victory-stat-label">Rounds Completed</div>
        </div>
        <div class="victory-stat">
          <div class="victory-stat-value">${stats.totalReps}</div>
          <div class="victory-stat-label">Total Reps</div>
        </div>
      </div>

      <button class="btn btn--full" id="new-workout">New Workout</button>
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
