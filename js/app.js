// Wyrd Workout - Main Application

import * as State from './state.js';
import * as Screens from './screens.js';

const app = document.getElementById('app');
let timerRAF = null;

// Main render function
function render() {
  const state = State.getState();

  switch (state.currentScreen) {
    case 'setup':
      Screens.renderSetupScreen(app);
      break;
    case 'roll':
      Screens.renderRollScreen(app);
      break;
    case 'workout':
      Screens.renderWorkoutScreen(app);
      break;
    case 'victory':
      Screens.renderVictoryScreen(app);
      break;
    default:
      Screens.renderSetupScreen(app);
  }
}

// Timer update loop
function timerLoop() {
  const state = State.getState();

  if (state.session && state.session.timer.running) {
    State.updateTimer();

    // Update timer display without full re-render
    const timerEl = document.querySelector('.timer');
    if (timerEl) {
      timerEl.textContent = State.getFormattedTime();
    }
  }

  timerRAF = requestAnimationFrame(timerLoop);
}

// Periodic save for timer state
function startPeriodicSave() {
  setInterval(() => {
    const state = State.getState();
    if (state.session && state.session.timer.running) {
      State.saveSession();
    }
  }, 5000); // Save every 5 seconds during workout
}

// Check for saved session on load
function checkSavedSession() {
  if (State.hasSavedSession()) {
    const loaded = State.loadSession();
    if (loaded) {
      const state = State.getState();

      // Show resume modal
      Screens.renderSetupScreen(app);
      Screens.renderResumeModal(
        app,
        // On resume
        () => {
          // Determine which screen to show based on session state
          if (state.session.hpRemaining <= 0) {
            State.setScreen('victory');
          } else if (!State.allExercisesRolled() || !State.allRepsRolled()) {
            State.setScreen('roll');
          } else {
            // Resume timer if it was running
            if (state.session.timer.running) {
              state.session.timer.lastTick = Date.now();
            }
            State.setScreen('workout');
          }
        },
        // On abandon
        () => {
          State.clearSession();
          State.setScreen('setup');
        }
      );
      return;
    }
  }

  // No saved session, show setup
  State.setScreen('setup');
}

// Initialize the app
function init() {
  // Subscribe to state changes
  State.subscribe(render);

  // Start timer loop
  timerLoop();

  // Start periodic save
  startPeriodicSave();

  // Check for saved session
  checkSavedSession();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
