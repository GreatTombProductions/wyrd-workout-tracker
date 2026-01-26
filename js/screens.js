// Wyrd Workout - Screen Rendering

import { DIE_SIZES, SUBCLASSES, CATEGORIES, getRecommendedHP, getRecommendedHPAdvanced, getAvailableCategories, getSubclassesForCategory } from './constants.js';

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
    // Last option gets "N+" to indicate higher rolls map here
    const numLabel = (i === maxOptions && exerciseDie > exercises.length) ? `${i}+` : `${i}`;
    options.push({ value: i, label: `${numLabel}. ${exerciseName}` });
  }

  return options;
}

// Helper to get all available categories for selected subclasses
function getAvailableCategoriesForConfig(config) {
  const allCategories = new Set();
  config.subclasses.forEach(subclass => {
    getAvailableCategories(subclass).forEach(cat => allCategories.add(cat));
  });
  return Array.from(allCategories);
}

// Helper to get all category+class combinations for advanced dice table
function getAdvancedDiceRows(config) {
  const rows = [];

  if (config.multiclass && config.subclasses.length > 1) {
    // Multiclass: show class+category combinations, grouped by category
    const allCategories = getAvailableCategoriesForConfig(config);

    for (const category of allCategories) {
      // Find all classes that have this category
      for (const subclassKey of config.subclasses) {
        const subclass = SUBCLASSES[subclassKey];
        if (!subclass) continue;

        const subclassCategories = getAvailableCategories(subclassKey);
        if (subclassCategories.includes(category)) {
          rows.push({
            key: `${subclassKey}:${category}`,
            label: `${category} (${subclass.name})`,
            category,
            subclass: subclassKey
          });
        }
      }
    }
  } else {
    // Single class: just show categories
    const categories = getAvailableCategoriesForConfig(config);
    for (const category of categories) {
      rows.push({
        key: category,
        label: category,
        category,
        subclass: null
      });
    }
  }

  return rows;
}

// Helper to render the advanced dice settings table
function renderAdvancedDiceTable(config) {
  const rows = getAdvancedDiceRows(config);

  return `
    <table class="advanced-dice-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Exercise Die</th>
          <th>Rep Die</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => {
          const catDice = config.categoryDice[row.key] || { exerciseDie: config.exerciseDie, repDie: config.repDie };
          return `
            <tr data-key="${row.key}">
              <td class="category-cell" data-category="${row.category}">${row.label}</td>
              <td>
                <button class="advanced-die-btn"
                        data-key="${row.key}"
                        data-type="exerciseDie"
                        data-value="${catDice.exerciseDie}">D${catDice.exerciseDie}<span class="die-edit-icon">✎</span></button>
              </td>
              <td>
                <button class="advanced-die-btn"
                        data-key="${row.key}"
                        data-type="repDie"
                        data-value="${catDice.repDie}">D${catDice.repDie}<span class="die-edit-icon">✎</span></button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

import * as State from './state.js';
import { getExerciseDieForSlot, getRepDieForSlot } from './state.js';

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
            <div class="label-with-help">
              <label>Choose Your Class</label>
              <button type="button" class="help-btn" data-help="class">?</button>
            </div>
            <label class="multiclass-toggle">
              <input type="checkbox" id="multiclass-toggle" ${config.multiclass ? 'checked' : ''}>
              <span>Multiclass</span>
            </label>
          </div>
          <div class="help-tooltip" data-tooltip="class">Your class determines what equipment you bring to the battlefield, and what exercises may be required of you.</div>
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

        <div class="strength-modifiers-container">
          <div class="strength-modifiers-header">
            <div class="label-with-help">
              <label>Strength Modifiers</label>
              <button type="button" class="help-btn" data-help="strength-modifiers">?</button>
            </div>
            <label class="advanced-toggle">
              <input type="checkbox" id="advanced-dice-toggle" ${config.advancedDiceMode ? 'checked' : ''}>
              <span>Advanced</span>
            </label>
          </div>
          <div class="help-tooltip" data-tooltip="strength-modifiers">Configure your dice for exercises and reps. Advanced mode lets you set different dice per category.</div>

          <div id="basic-dice-settings" class="${config.advancedDiceMode ? 'hidden' : ''}">
            <div class="form-group">
              <div class="label-with-help">
                <label>Exercise Die</label>
                <button type="button" class="help-btn" data-help="exercise-die">?</button>
              </div>
              <div class="help-tooltip" data-tooltip="exercise-die">Exercises are ordered from easiest to hardest, so having more sides on your die means inviting greater potential challenge.</div>
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
          </div>

          <div id="advanced-dice-settings" class="${config.advancedDiceMode ? '' : 'hidden'}">
            ${renderAdvancedDiceTable(config)}
          </div>
        </div>

        <div class="form-group">
          <div class="label-with-help">
            <label>Encounter HP</label>
            <button type="button" class="help-btn" data-help="hp">?</button>
          </div>
          <div class="help-tooltip" data-tooltip="hp">Each rep will deal 1 damage to the encounter. The recommended encounter HP is determined by your selected Rep Die.</div>
          <div class="hp-input-group">
            <input type="number"
                   id="hp-threshold"
                   value="${config.hpThreshold}"
                   min="50"
                   max="1000"
                   step="10">
            <span class="hp-recommendation">Recommended: ${config.advancedDiceMode ? getRecommendedHPAdvanced(config.categoryDice) : getRecommendedHP(config.repDie)}</span>
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
        <button class="btn btn--full" id="begin-workout">Roll Workout</button>
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
          // Update advanced dice table if in advanced mode
          updateAdvancedDiceTable();
        } else {
          // Prevent deselecting all - recheck this one
          input.checked = true;
        }
      });
    });
  }

  // Helper to update the advanced dice table when subclasses change
  function updateAdvancedDiceTable() {
    const state = State.getState();
    if (!state.sessionConfig.advancedDiceMode) return;

    const advancedSettings = container.querySelector('#advanced-dice-settings');
    if (!advancedSettings) return;

    // Get new rows and preserve existing dice values
    const rows = getAdvancedDiceRows(state.sessionConfig);
    const oldCategoryDice = state.sessionConfig.categoryDice || {};
    const newCategoryDice = {};

    rows.forEach(row => {
      if (oldCategoryDice[row.key]) {
        newCategoryDice[row.key] = oldCategoryDice[row.key];
      } else {
        newCategoryDice[row.key] = {
          exerciseDie: state.sessionConfig.exerciseDie,
          repDie: state.sessionConfig.repDie
        };
      }
    });

    State.updateConfig({ categoryDice: newCategoryDice });

    // Re-render the table
    advancedSettings.innerHTML = renderAdvancedDiceTable(State.getState().sessionConfig);
    attachAdvancedDiceListeners(container);

    // Update HP recommendation
    updateHPRecommendation();
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
      // Update advanced dice table if in advanced mode
      updateAdvancedDiceTable();
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

  // Helper to update HP recommendation based on current mode
  function updateHPRecommendation() {
    const state = State.getState();
    const config = state.sessionConfig;
    let recommended;
    if (config.advancedDiceMode) {
      recommended = getRecommendedHPAdvanced(config.categoryDice);
    } else {
      recommended = getRecommendedHP(config.repDie);
    }
    State.updateConfig({ hpThreshold: recommended });
    updateHPUI(recommended);
  }

  // Attach listeners to advanced dice buttons
  function attachAdvancedDiceListeners(container) {
    container.querySelectorAll('.advanced-die-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const type = btn.dataset.type;
        const currentValue = parseInt(btn.dataset.value);
        showAdvancedDieModal(container, btn, key, type, currentValue);
      });
    });
  }

  // Show modal to edit die for advanced dice table
  function showAdvancedDieModal(container, btn, key, type, currentValue) {
    const label = type === 'exerciseDie' ? 'Exercise' : 'Rep';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${label} Die</h3>
          <button class="modal-close" title="Close">×</button>
        </div>
        <div class="modal-content">
          <div class="die-selector die-selector--modal">
            ${DIE_SIZES.map(size => `
              <div class="die-option">
                <input type="radio"
                       id="adv-die-${size}"
                       name="advDie"
                       value="${size}"
                       ${currentValue === size ? 'checked' : ''}>
                <label for="adv-die-${size}">D${size}</label>
              </div>
            `).join('')}
            <div class="die-option">
              <input type="radio"
                     id="adv-die-custom"
                     name="advDie"
                     value="custom"
                     ${!DIE_SIZES.includes(currentValue) ? 'checked' : ''}>
              <label for="adv-die-custom">D${!DIE_SIZES.includes(currentValue) ? currentValue : '?'}</label>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(modal);

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Custom die input modal
    function showCustomAdvDieModal() {
      const customModal = document.createElement('div');
      customModal.className = 'modal-overlay';
      customModal.innerHTML = `
        <div class="modal">
          <h2>Custom Die</h2>
          <div class="modal-input-group">
            <label>D</label>
            <input type="number" id="custom-adv-die-input" min="1" max="100" value="${!DIE_SIZES.includes(currentValue) ? currentValue : ''}" placeholder="?">
          </div>
          <div class="modal-buttons">
            <button class="btn btn--full" id="custom-adv-die-confirm">Confirm</button>
            <button class="btn btn--full btn--secondary" id="custom-adv-die-cancel">Cancel</button>
          </div>
        </div>
      `;

      container.appendChild(customModal);

      const input = customModal.querySelector('#custom-adv-die-input');
      input.focus();
      input.select();

      const confirmCustom = () => {
        const value = parseInt(input.value);
        if (value && value >= 1) {
          applyAdvancedDieValue(key, type, value, btn);
          customModal.remove();
          modal.remove();
        }
      };

      customModal.querySelector('#custom-adv-die-confirm').addEventListener('click', confirmCustom);
      customModal.querySelector('#custom-adv-die-cancel').addEventListener('click', () => customModal.remove());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmCustom();
        if (e.key === 'Escape') customModal.remove();
      });
      customModal.addEventListener('click', (e) => {
        if (e.target === customModal) customModal.remove();
      });
    }

    // Die option listeners
    modal.querySelectorAll('input[name="advDie"]').forEach(input => {
      input.addEventListener('change', () => {
        if (input.value === 'custom') {
          showCustomAdvDieModal();
        } else {
          const value = parseInt(input.value);
          applyAdvancedDieValue(key, type, value, btn);
          modal.remove();
        }
      });
    });
  }

  // Apply advanced die value
  function applyAdvancedDieValue(key, type, value, btn) {
    const state = State.getState();
    const categoryDice = { ...state.sessionConfig.categoryDice };

    if (!categoryDice[key]) {
      categoryDice[key] = { exerciseDie: 6, repDie: 6 };
    }
    categoryDice[key][type] = value;

    State.updateConfig({ categoryDice });

    // Update the button
    btn.dataset.value = value;
    btn.innerHTML = `D${value}<span class="die-edit-icon">✎</span>`;

    // Update HP recommendation if rep die changed
    if (type === 'repDie') {
      updateHPRecommendation();
    }
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

  // Advanced dice mode toggle
  const advancedToggle = container.querySelector('#advanced-dice-toggle');
  if (advancedToggle) {
    advancedToggle.addEventListener('change', () => {
      const isAdvanced = advancedToggle.checked;
      const basicSettings = container.querySelector('#basic-dice-settings');
      const advancedSettings = container.querySelector('#advanced-dice-settings');

      // If switching to advanced mode, initialize categoryDice from current values
      if (isAdvanced) {
        const state = State.getState();
        const rows = getAdvancedDiceRows(state.sessionConfig);
        const categoryDice = {};
        rows.forEach(row => {
          categoryDice[row.key] = {
            exerciseDie: state.sessionConfig.exerciseDie,
            repDie: state.sessionConfig.repDie
          };
        });
        State.updateConfig({ advancedDiceMode: true, categoryDice });

        // Update the table
        advancedSettings.innerHTML = renderAdvancedDiceTable(State.getState().sessionConfig);
        attachAdvancedDiceListeners(container);
      } else {
        State.updateConfig({ advancedDiceMode: false });
      }

      // Toggle visibility
      if (basicSettings) basicSettings.classList.toggle('hidden', isAdvanced);
      if (advancedSettings) advancedSettings.classList.toggle('hidden', !isAdvanced);

      // Update HP recommendation
      updateHPRecommendation();
    });
  }

  // Advanced dice input listeners
  attachAdvancedDiceListeners(container);

  // Help tooltips
  container.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const helpKey = btn.dataset.help;
      const tooltip = container.querySelector(`.help-tooltip[data-tooltip="${helpKey}"]`);
      if (tooltip) {
        // Close any other open tooltips
        container.querySelectorAll('.help-tooltip.active').forEach(t => {
          if (t !== tooltip) t.classList.remove('active');
        });
        tooltip.classList.toggle('active');
      }
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
      ${!isNewRound ? '<p class="roll-subheader">Brought your own dice? Input your rolls on the left!</p>' : ''}

      <div class="screen-content">
        ${renderAllAtOnceMode(session, isNewRound)}
      </div>

      <div class="screen-footer">
        <button class="btn btn--full btn--secondary mb-md"
                id="enter-workout"
                ${!canEnterWorkout(session, isNewRound) ? 'disabled' : ''}>
          Begin Encounter
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
  const validSubclassesForCategory = getSubclassesForCategory(session.config.subclasses, slot.category);
  const canRerollExercise = !isNewRound && hasExercise;
  const canRerollClass = !isNewRound && isMulticlass && hasSubclass && !hasExercise && validSubclassesForCategory.length > 1;
  const canRerollReps = hasReps; // Allow reroll during per-round rolling too
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
        </div>
        <div class="roll-slot-exercise">
          ${hasExercise ? `
            ${canRerollExercise ? `<button class="reroll-btn" data-reroll="${index}" title="Reroll Exercise">↻</button>` : ''}
            <span class="roll-slot-exercise-name">${slot.exerciseName}</span>
            <span class="roll-slot-subclass text-muted">(${subclassName})</span>
          ` : `
            ${canRerollClass ? `<button class="reroll-btn" data-reroll-class="${index}" title="Reroll Class">↻</button>` : ''}
            <span class="roll-slot-subclass text-muted">${subclassName}</span>
          `}
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
              <span class="die-indicator">D${validSubclasses.length}</span>
            `;
            })() : ''}
            ${!isNewRound && hasSubclass && !hasExercise ? (() => {
              const exerciseDie = getExerciseDieForSlot(session.config, slot.category, slot.subclass, slot);
              const hasOverride = slot.exerciseDieOverride !== null;
              return `
              <select class="roll-select" data-slot="${index}" data-type="exercise">
                <option value="">Select...</option>
                ${getExerciseOptions(slot.subclass, slot.category, exerciseDie).map(opt => `
                  <option value="${opt.value}">${opt.label}</option>
                `).join('')}
              </select>
              <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
              <button class="die-indicator die-indicator--editable ${hasOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="exercise" title="Edit exercise die">D${exerciseDie}<span class="die-edit-icon">✎</span></button>
            `;
            })() : ''}
            ${hasExercise && !hasReps ? (() => {
              const repDie = getRepDieForSlot(session.config, slot.category, slot.subclass, slot);
              const hasOverride = slot.repDieOverride !== null;
              return `
              <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                     min="1" max="${repDie}">
              <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll<br>Reps</button>
              <button class="die-indicator die-indicator--editable ${hasOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="reps" title="Edit reps die">D${repDie}<span class="die-edit-icon">✎</span></button>
            `;
            })() : ''}
          </div>
        ` : ''}
        ${hasExercise && hasReps ? `
          <div class="roll-slot-reps">
            ${canRerollReps ? `<button class="reroll-btn" data-reroll-reps="${index}" title="Reroll Reps">↻</button>` : ''}
            <strong>${slot.actualReps} reps</strong>
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

  // Per-round rolling - show Roll All button but not Add Exercise
  return slotsHtml + `
    <div class="slot-actions-container">
      <button class="btn btn--small" id="roll-all-btn">Roll All</button>
    </div>
  `;
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
            </div>
            <div class="roll-slot-exercise">
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
          </div>
          <div class="roll-slot-exercise">
            ${hasExercise ? `
              <span class="roll-slot-exercise-name">${slot.exerciseName}</span>
              <span class="roll-slot-subclass text-muted">(${subclassName})</span>
            ` : `
              <span class="roll-slot-subclass text-muted">${subclassName}</span>
            `}
          </div>
          ${hasControls ? (() => {
            const exerciseDie = getExerciseDieForSlot(session.config, slot.category, slot.subclass, slot);
            const repDie = getRepDieForSlot(session.config, slot.category, slot.subclass, slot);
            const hasExerciseOverride = slot.exerciseDieOverride !== null;
            const hasRepsOverride = slot.repDieOverride !== null;
            return `
            <div class="roll-controls">
              ${!hasExercise ? `
                <input type="number" class="roll-input" data-slot="${index}" data-type="exercise"
                       min="1" max="${exerciseDie}">
                <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
                <button class="die-indicator die-indicator--editable ${hasExerciseOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="exercise" title="Edit exercise die">D${exerciseDie}<span class="die-edit-icon">✎</span></button>
              ` : !hasReps ? `
                <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
                       min="1" max="${repDie}">
                <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll</button>
                <button class="die-indicator die-indicator--editable ${hasRepsOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="reps" title="Edit reps die">D${repDie}<span class="die-edit-icon">✎</span></button>
              ` : ''}
            </div>
          `;
          })() : ''}
          ${hasExercise && hasReps ? `
            <div class="roll-slot-reps">
              <strong>${slot.actualReps} reps</strong>
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
  const validSubclassesForCategory = getSubclassesForCategory(session.config.subclasses, slot.category);
  const canRerollExercise = !isNewRound && hasExercise;
  const canRerollClass = !isNewRound && isMulticlass && hasSubclass && !hasExercise && validSubclassesForCategory.length > 1;
  const canRerollReps = hasReps; // Allow reroll during per-round rolling too

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

  // Update exercise row (always present - shows exercise+subclass or just subclass)
  const mainEl = slotEl.querySelector('.roll-slot-main');
  const exerciseEl = slotEl.querySelector('.roll-slot-exercise');

  if (exerciseEl) {
    if (hasExercise) {
      exerciseEl.innerHTML = `
        ${canRerollExercise ? `<button class="reroll-btn" data-reroll="${index}" title="Reroll Exercise">↻</button>` : ''}
        <span class="roll-slot-exercise-name">${slot.exerciseName}</span>
        <span class="roll-slot-subclass text-muted">(${subclassName})</span>
      `;

      const rerollExerciseBtn = exerciseEl.querySelector('[data-reroll]');
      if (rerollExerciseBtn) {
        attachRerollListener(container, rerollExerciseBtn, session, isNewRound);
      }
    } else {
      exerciseEl.innerHTML = `
        ${canRerollClass ? `<button class="reroll-btn" data-reroll-class="${index}" title="Reroll Class">↻</button>` : ''}
        <span class="roll-slot-subclass text-muted">${subclassName}</span>
      `;

      const rerollClassBtn = exerciseEl.querySelector('[data-reroll-class]');
      if (rerollClassBtn) {
        attachRerollClassListener(container, rerollClassBtn, session, isNewRound);
      }
    }
  }

  // Update reps row (only shown when complete)
  let repsEl = slotEl.querySelector('.roll-slot-reps');

  if (hasExercise && hasReps) {
    const repsHtml = `
      ${canRerollReps ? `<button class="reroll-btn" data-reroll-reps="${index}" title="Reroll Reps">↻</button>` : ''}
      <strong>${slot.actualReps} reps</strong>
    `;

    if (repsEl) {
      repsEl.innerHTML = repsHtml;
    } else {
      // Create reps element at the end
      repsEl = document.createElement('div');
      repsEl.className = 'roll-slot-reps';
      repsEl.innerHTML = repsHtml;
      mainEl.appendChild(repsEl);
    }

    const rerollRepsBtn = repsEl.querySelector('[data-reroll-reps]');
    if (rerollRepsBtn) {
      attachRerollRepsListener(container, rerollRepsBtn, session, isNewRound);
    }
  } else if (repsEl) {
    repsEl.remove();
  }

  // Update controls
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
        <span class="die-indicator">D${validSubclasses.length}</span>
      `;
    } else if (!isNewRound && hasSubclass && !hasExercise) {
      const exerciseDie = getExerciseDieForSlot(session.config, slot.category, slot.subclass, slot);
      const hasExerciseOverride = slot.exerciseDieOverride !== null;
      newControls = `
        <select class="roll-select" data-slot="${index}" data-type="exercise">
          <option value="">Select...</option>
          ${getExerciseOptions(slot.subclass, slot.category, exerciseDie).map(opt => `
            <option value="${opt.value}">${opt.label}</option>
          `).join('')}
        </select>
        <button class="btn btn--small" data-roll-exercise="${index}">Roll<br>Exercise</button>
        <button class="die-indicator die-indicator--editable ${hasExerciseOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="exercise" title="Edit exercise die">D${exerciseDie}<span class="die-edit-icon">✎</span></button>
      `;
    } else if (hasExercise && !hasReps) {
      const repDie = getRepDieForSlot(session.config, slot.category, slot.subclass, slot);
      const hasRepsOverride = slot.repDieOverride !== null;
      newControls = `
        <input type="number" class="roll-input" data-slot="${index}" data-type="reps"
               min="1" max="${repDie}">
        <button class="btn btn--small btn--secondary" data-roll-reps="${index}">Roll<br>Reps</button>
        <button class="die-indicator die-indicator--editable ${hasRepsOverride ? 'die-indicator--override' : ''}" data-edit-die="${index}" data-die-type="reps" title="Edit reps die">D${repDie}<span class="die-edit-icon">✎</span></button>
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

// Attach die edit button listener
function attachDieEditListener(container, btn, session, isNewRound) {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.editDie);
    const dieType = btn.dataset.dieType;
    showSlotDieEditModal(container, index, dieType, isNewRound);
  });
}

// Show modal to edit die for a specific slot
function showSlotDieEditModal(container, slotIndex, dieType, isNewRound) {
  const session = State.getState().session;
  const slot = session.slots[slotIndex];
  const isExercise = dieType === 'exercise';

  // Get the current effective die value
  const currentDie = isExercise
    ? getExerciseDieForSlot(session.config, slot.category, slot.subclass, slot)
    : getRepDieForSlot(session.config, slot.category, slot.subclass, slot);

  // Get the base die value (without override)
  const baseDie = isExercise
    ? getExerciseDieForSlot(session.config, slot.category, slot.subclass, null)
    : getRepDieForSlot(session.config, slot.category, slot.subclass, null);

  const hasOverride = isExercise ? slot.exerciseDieOverride !== null : slot.repDieOverride !== null;
  const label = isExercise ? 'Exercise' : 'Reps';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit ${label} Die</h3>
        <button class="modal-close" title="Close">×</button>
      </div>
      <div class="modal-content">
        <p class="text-muted">Override the ${label.toLowerCase()} die for this slot only.</p>
        <div class="die-selector die-selector--modal">
          ${DIE_SIZES.map(size => `
            <div class="die-option">
              <input type="radio"
                     id="slot-die-${size}"
                     name="slotDie"
                     value="${size}"
                     ${currentDie === size ? 'checked' : ''}>
              <label for="slot-die-${size}">D${size}</label>
            </div>
          `).join('')}
          <div class="die-option">
            <input type="radio"
                   id="slot-die-custom"
                   name="slotDie"
                   value="custom"
                   ${!DIE_SIZES.includes(currentDie) ? 'checked' : ''}>
            <label for="slot-die-custom" id="slot-die-custom-label">D${!DIE_SIZES.includes(currentDie) ? currentDie : '?'}</label>
          </div>
        </div>
        ${hasOverride ? `
          <button class="btn btn--full btn--secondary" id="reset-die-override">Reset to Default (D${baseDie})</button>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Custom die input modal
  function showCustomSlotDieModal() {
    const customModal = document.createElement('div');
    customModal.className = 'modal-overlay';
    customModal.innerHTML = `
      <div class="modal">
        <h2>Custom Die</h2>
        <div class="modal-input-group">
          <label>D</label>
          <input type="number" id="custom-slot-die-input" min="1" max="100" value="${!DIE_SIZES.includes(currentDie) ? currentDie : ''}" placeholder="?">
        </div>
        <div class="modal-buttons">
          <button class="btn btn--full" id="custom-slot-die-confirm">Confirm</button>
          <button class="btn btn--full btn--secondary" id="custom-slot-die-cancel">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(customModal);

    const input = customModal.querySelector('#custom-slot-die-input');
    input.focus();
    input.select();

    const confirmCustom = () => {
      const value = parseInt(input.value);
      if (value && value >= 1) {
        State.setDieOverrideForSlot(slotIndex, dieType, value);
        customModal.remove();
        modal.remove();
        updateRollSlot(container, State.getState().session, slotIndex, isNewRound);
      }
    };

    customModal.querySelector('#custom-slot-die-confirm').addEventListener('click', confirmCustom);
    customModal.querySelector('#custom-slot-die-cancel').addEventListener('click', () => customModal.remove());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmCustom();
      if (e.key === 'Escape') customModal.remove();
    });
    customModal.addEventListener('click', (e) => {
      if (e.target === customModal) customModal.remove();
    });
  }

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Reset button
  const resetBtn = modal.querySelector('#reset-die-override');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      State.setDieOverrideForSlot(slotIndex, dieType, null);
      modal.remove();
      updateRollSlot(container, State.getState().session, slotIndex, isNewRound);
    });
  }

  // Die option listeners
  modal.querySelectorAll('input[name="slotDie"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.value === 'custom') {
        showCustomSlotDieModal();
      } else {
        const value = parseInt(input.value);
        State.setDieOverrideForSlot(slotIndex, dieType, value);
        modal.remove();
        updateRollSlot(container, State.getState().session, slotIndex, isNewRound);
      }
    });
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
        const slotIndex = parseInt(repsInput.dataset.slot);
        const slot = State.getState().session.slots[slotIndex];
        const repDie = getRepDieForSlot(State.getState().session.config, slot.category, slot.subclass, slot);
        repsBtn.classList.add('btn--has-input');
        repsBtn.innerHTML = `Confirm Roll<br><span class="btn-formula">Reps = ${repDie} + ${repsInput.value}</span>`;
      } else {
        repsBtn.classList.remove('btn--has-input');
        repsBtn.innerHTML = 'Roll<br>Reps';
      }
    });
  }

  // Die edit buttons
  controlsEl.querySelectorAll('[data-edit-die]').forEach(btn => {
    attachDieEditListener(container, btn, session, isNewRound);
  });
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

  // Roll All button (available in both initial and per-round rolling)
  const rollAllBtn = container.querySelector('#roll-all-btn');
  if (rollAllBtn) {
    const newRollAllBtn = rollAllBtn.cloneNode(true);
    rollAllBtn.parentNode.replaceChild(newRollAllBtn, rollAllBtn);
    newRollAllBtn.addEventListener('click', () => {
      rollAllPending(container, isNewRound);
    });
  }

  // Enter workout button
  const enterBtn = container.querySelector('#enter-workout');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      // Capture the roll state for workout link before starting
      State.captureWorkoutLinkData();
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

// Update workout UI without full re-render (preserves timer state)
function updateWorkoutUI(container) {
  const state = State.getState();
  const session = state.session;
  if (!session) return;

  const currentSlot = State.getCurrentSlot();
  const hpPercent = Math.max(0, (session.hpRemaining / session.config.hpThreshold) * 100);
  const remainingInRound = session.slots.length - session.currentSlotIndex;
  const isFinal = State.isFinalExercise();
  const minReps = State.getMinRepsToFinish();

  // Update HP bar
  const hpFill = container.querySelector('.hp-bar-fill');
  const hpText = container.querySelector('.hp-bar-text');
  if (hpFill) hpFill.style.width = `${hpPercent}%`;
  if (hpText) hpText.textContent = `${session.hpRemaining} / ${session.config.hpThreshold}`;

  // Update round indicator
  const roundIndicator = container.querySelector('.round-indicator');
  if (roundIndicator) roundIndicator.textContent = `Round ${session.currentRound}`;

  // Update exercise card
  if (currentSlot) {
    const categoryEl = container.querySelector('.exercise-category');
    const nameEl = container.querySelector('.exercise-name');
    const repsEl = container.querySelector('#rep-display');

    if (categoryEl) {
      categoryEl.textContent = currentSlot.category;
      categoryEl.dataset.category = currentSlot.category;
    }
    if (nameEl) nameEl.textContent = currentSlot.exerciseName;
    if (repsEl) repsEl.textContent = currentSlot.actualReps;

    // Handle final rep slider
    const exerciseCard = container.querySelector('.exercise-card');
    const existingSlider = container.querySelector('.final-rep-slider');

    if (isFinal && !existingSlider && exerciseCard) {
      // Add slider for final exercise
      const sliderDiv = document.createElement('div');
      sliderDiv.className = 'final-rep-slider';
      sliderDiv.innerHTML = `
        <input type="range" id="rep-slider"
               min="${minReps}" max="${currentSlot.actualReps}"
               value="${currentSlot.actualReps}">
        <div class="slider-labels">
          <span>${minReps} (min)</span>
          <span>${currentSlot.actualReps} (full)</span>
        </div>
      `;
      exerciseCard.appendChild(sliderDiv);

      // Attach slider listener
      const slider = sliderDiv.querySelector('#rep-slider');
      slider.addEventListener('input', () => {
        repsEl.textContent = slider.value;
      });
    } else if (!isFinal && existingSlider) {
      // Remove slider if no longer final
      existingSlider.remove();
    }
  }

  // Update round progress dots
  const dotsContainer = container.querySelector('.round-progress');
  if (dotsContainer) {
    dotsContainer.innerHTML = session.slots.map((slot, index) => `
      <div class="round-dot ${slot.completed ? 'round-dot--completed' : ''} ${index === session.currentSlotIndex ? 'round-dot--current' : ''}"></div>
    `).join('');
  }

  // Update button text
  const completeBtn = container.querySelector('#complete-exercise');
  const completeRoundBtn = container.querySelector('#complete-round');

  if (completeBtn) {
    completeBtn.textContent = isFinal ? 'Finish Workout' : 'Complete';
  }
  if (completeRoundBtn) {
    completeRoundBtn.textContent = `Complete Round (${remainingInRound} exercises)`;
  }

  // Re-attach completion listeners with updated isFinal state
  reattachCompletionListeners(container, isFinal);
}

// Re-attach completion listeners (needed after updating isFinal state)
function reattachCompletionListeners(container, isFinal) {
  const slider = container.querySelector('#rep-slider');

  const completeBtn = container.querySelector('#complete-exercise');
  if (completeBtn) {
    const newBtn = completeBtn.cloneNode(true);
    completeBtn.parentNode.replaceChild(newBtn, completeBtn);
    newBtn.addEventListener('click', () => {
      const customReps = isFinal && slider ? parseInt(slider.value) : null;
      State.completeCurrentExercise(customReps);
      const state = State.getState();
      if (state.currentScreen === 'workout') {
        updateWorkoutUI(container);
      }
    });
  }

  const completeRoundBtn = container.querySelector('#complete-round');
  if (completeRoundBtn) {
    const newBtn = completeRoundBtn.cloneNode(true);
    completeRoundBtn.parentNode.replaceChild(newBtn, completeRoundBtn);
    newBtn.addEventListener('click', () => {
      State.completeRound();
      const state = State.getState();
      if (state.currentScreen === 'workout') {
        updateWorkoutUI(container);
      }
    });
  }
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
      // Update UI if still on workout screen (victory transition handled by state)
      const state = State.getState();
      if (state.currentScreen === 'workout') {
        updateWorkoutUI(container);
      }
    });
  }

  const completeRoundBtn = container.querySelector('#complete-round');
  if (completeRoundBtn) {
    completeRoundBtn.addEventListener('click', () => {
      State.completeRound();
      // Update UI if still on workout screen
      const state = State.getState();
      if (state.currentScreen === 'workout') {
        updateWorkoutUI(container);
      }
    });
  }
}

// Render the victory screen
// Helper to get weight display for an exercise
function getWeightDisplay(exerciseName, round, weights) {
  if (!weights || !weights[exerciseName]) return '';

  const weight = weights[exerciseName];
  // If weight is an object with per-round values
  if (typeof weight === 'object') {
    return weight[round] || '';
  }
  // If weight is a string (all rounds same)
  return weight;
}

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

  // Get unique exercises for weight editing
  const uniqueExercises = [...new Set(stats.exerciseHistory.map(ex => ex.exerciseName))];
  const totalRounds = stats.totalRounds;

  container.innerHTML = `
    <div class="screen">
      <div id="victory-capture" class="victory-capture">
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

          <div class="victory-history" id="victory-history">
            ${Object.entries(exercisesByRound).map(([round, exercises]) => `
              <div class="victory-round">
                <div class="victory-round-header">Round ${round}</div>
                <div class="victory-exercises">
                  ${exercises.map(ex => {
                    const weight = getWeightDisplay(ex.exerciseName, parseInt(round), stats.exerciseWeights);
                    const weightDisplay = weight ? `<span class="victory-exercise-weight">${weight}</span> ` : '';
                    return `
                      <div class="victory-exercise">
                        <span class="victory-exercise-name">${ex.exerciseName}</span>
                        <span class="victory-exercise-reps">${weightDisplay}× ${ex.reps}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="victory-branding">Worldtree Workout</div>
      </div>

      <div class="screen-footer">
        <button class="btn btn--secondary btn--full" id="download-summary">View Summary Image</button>
        <button class="btn btn--neutral btn--full" id="add-weights">Add Weights</button>
        <button class="btn btn--neutral btn--full" id="copy-workout-link">Copy Encounter Dice Rolls Link</button>
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

  const addWeightsBtn = container.querySelector('#add-weights');
  if (addWeightsBtn) {
    addWeightsBtn.addEventListener('click', () => {
      renderWeightEditScreen(container, stats, uniqueExercises, totalRounds);
    });
  }

  const copyLinkBtn = container.querySelector('#copy-workout-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      const workoutUrl = State.generateWorkoutUrl();
      if (!workoutUrl) {
        copyLinkBtn.textContent = 'Link unavailable';
        setTimeout(() => { copyLinkBtn.textContent = 'Copy Encounter Dice Rolls Link'; }, 2000);
        return;
      }

      try {
        await navigator.clipboard.writeText(workoutUrl);
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => { copyLinkBtn.textContent = 'Copy Encounter Dice Rolls Link'; }, 2000);
      } catch (err) {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = workoutUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          copyLinkBtn.textContent = 'Copied!';
        } catch (e) {
          copyLinkBtn.textContent = 'Copy failed';
        }
        document.body.removeChild(textArea);
        setTimeout(() => { copyLinkBtn.textContent = 'Copy Encounter Dice Rolls Link'; }, 2000);
      }
    });
  }

  const downloadBtn = container.querySelector('#download-summary');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const captureElement = container.querySelector('#victory-capture');
      if (!captureElement || typeof html2canvas === 'undefined') return;

      downloadBtn.disabled = true;
      downloadBtn.textContent = 'Generating...';

      try {
        const canvas = await html2canvas(captureElement, {
          backgroundColor: '#2a2520',
          scale: 2,
          logging: false,
          useCORS: true
        });

        // Open image in new tab
        const dataUrl = canvas.toDataURL('image/png');
        const newTab = window.open();
        if (newTab) {
          newTab.document.body.style.margin = '0';
          newTab.document.body.style.background = '#2a2520';
          newTab.document.body.innerHTML = `<img src="${dataUrl}" style="max-width:100%;display:block;margin:0 auto;">`;
        }
      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'View Summary Image';
      }
    });
  }
}

// Render the weight editing screen
function renderWeightEditScreen(container, stats, uniqueExercises, totalRounds) {
  // Store current weights as backup for cancel
  const originalWeights = JSON.parse(JSON.stringify(stats.exerciseWeights || {}));

  // Working copy of weights
  let workingWeights = JSON.parse(JSON.stringify(stats.exerciseWeights || {}));
  let linkedMode = true; // Start in linked mode (editing all rounds)

  function renderScreen() {
    container.innerHTML = `
      <div class="screen">
        <h1 class="victory-title">Add Weights</h1>

        <div class="weight-link-toggle">
          <button class="btn btn--small weight-link-btn ${linkedMode ? 'btn--has-input' : ''}" id="toggle-link">
            ${linkedMode ? '🔗' : '⛓️‍💥'}
          </button>
          <span class="weight-link-status">
            ${linkedMode ? 'Editing all rounds' : 'Editing individual rounds'}
          </span>
        </div>

        <div class="weight-table-wrapper">
            <table class="weight-table">
              <thead>
                <tr>
                  <th class="weight-table-exercise">Exercise</th>
                  ${linkedMode
                    ? '<th class="weight-table-weight">Weight</th>'
                    : Array.from({ length: totalRounds }, (_, i) => `<th class="weight-table-round">R${i + 1}</th>`).join('')
                  }
                </tr>
              </thead>
              <tbody>
                ${uniqueExercises.map(exercise => `
                  <tr>
                    <td class="weight-table-exercise-name">${exercise}</td>
                    ${linkedMode
                      ? `<td>
                          <input type="text"
                            class="weight-input"
                            data-exercise="${exercise}"
                            value="${typeof workingWeights[exercise] === 'string' ? workingWeights[exercise] : (workingWeights[exercise]?.[1] || '')}"
                            placeholder="e.g. 50kg"
                          />
                        </td>`
                      : Array.from({ length: totalRounds }, (_, i) => {
                          const round = i + 1;
                          const value = typeof workingWeights[exercise] === 'object'
                            ? (workingWeights[exercise][round] || '')
                            : (typeof workingWeights[exercise] === 'string' ? workingWeights[exercise] : '');
                          return `
                            <td>
                              <input type="text"
                                class="weight-input weight-input--small"
                                data-exercise="${exercise}"
                                data-round="${round}"
                                value="${value}"
                                placeholder=""
                              />
                            </td>
                          `;
                        }).join('')
                    }
                  </tr>
                `).join('')}
              </tbody>
            </table>
        </div>

        <div class="screen-footer">
          <button class="btn btn--full" id="confirm-weights">Confirm</button>
          <button class="btn btn--secondary btn--full" id="cancel-weights">Cancel</button>
        </div>
      </div>
    `;

    // Toggle link mode
    const toggleBtn = container.querySelector('#toggle-link');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        // Save current inputs before toggling
        saveCurrentInputs();
        linkedMode = !linkedMode;

        // When switching to linked mode, consolidate weights
        if (linkedMode) {
          Object.keys(workingWeights).forEach(exercise => {
            if (typeof workingWeights[exercise] === 'object') {
              // Take the first non-empty value
              const firstValue = Object.values(workingWeights[exercise]).find(v => v) || '';
              workingWeights[exercise] = firstValue;
            }
          });
        } else {
          // When switching to unlinked, expand string values to per-round
          Object.keys(workingWeights).forEach(exercise => {
            if (typeof workingWeights[exercise] === 'string') {
              const value = workingWeights[exercise];
              workingWeights[exercise] = {};
              for (let r = 1; r <= totalRounds; r++) {
                workingWeights[exercise][r] = value;
              }
            }
          });
        }

        renderScreen();
      });
    }

    // Input change handlers
    container.querySelectorAll('.weight-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const exercise = e.target.dataset.exercise;
        const round = e.target.dataset.round ? parseInt(e.target.dataset.round) : null;
        const value = e.target.value;

        if (linkedMode) {
          workingWeights[exercise] = value;
        } else {
          if (typeof workingWeights[exercise] !== 'object') {
            workingWeights[exercise] = {};
          }
          workingWeights[exercise][round] = value;
        }
      });
    });

    // Confirm button
    const confirmBtn = container.querySelector('#confirm-weights');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        saveCurrentInputs();
        // Clean up empty weights
        const cleanedWeights = {};
        Object.keys(workingWeights).forEach(exercise => {
          const weight = workingWeights[exercise];
          if (typeof weight === 'string' && weight.trim()) {
            cleanedWeights[exercise] = weight.trim();
          } else if (typeof weight === 'object') {
            const hasValues = Object.values(weight).some(v => v && v.trim());
            if (hasValues) {
              cleanedWeights[exercise] = {};
              Object.keys(weight).forEach(r => {
                if (weight[r] && weight[r].trim()) {
                  cleanedWeights[exercise][r] = weight[r].trim();
                }
              });
            }
          }
        });
        State.setAllExerciseWeights(cleanedWeights);
        renderVictoryScreen(container);
      });
    }

    // Cancel button
    const cancelBtn = container.querySelector('#cancel-weights');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        State.setAllExerciseWeights(originalWeights);
        renderVictoryScreen(container);
      });
    }
  }

  function saveCurrentInputs() {
    container.querySelectorAll('.weight-input').forEach(input => {
      const exercise = input.dataset.exercise;
      const round = input.dataset.round ? parseInt(input.dataset.round) : null;
      const value = input.value;

      if (linkedMode) {
        workingWeights[exercise] = value;
      } else {
        if (typeof workingWeights[exercise] !== 'object') {
          workingWeights[exercise] = {};
        }
        workingWeights[exercise][round] = value;
      }
    });
  }

  renderScreen();
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
