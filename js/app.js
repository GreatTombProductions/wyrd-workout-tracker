// Wyrd Workout - Main Application

import * as State from './state.js';
import * as Screens from './screens.js';

const app = document.getElementById('app');
let timerRAF = null;
let lastScreen = null;

// Main render function - only re-renders when screen changes
function render(state) {
  // Only do full re-render when screen changes
  if (state.currentScreen !== lastScreen) {
    lastScreen = state.currentScreen;
    renderScreen(state.currentScreen);
  }
}

// Render a specific screen
function renderScreen(screen) {
  switch (screen) {
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

// Force re-render current screen (for roll updates, etc.)
export function forceRender() {
  const state = State.getState();
  renderScreen(state.currentScreen);
}

// Timer update loop - only updates timer display, not full re-render
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
  }, 5000);
}

// Check for saved session on load
function checkSavedSession() {
  if (State.hasSavedSession()) {
    const loaded = State.loadSession();
    if (loaded) {
      const state = State.getState();

      // If workout was already completed, clear and start fresh
      if (state.session.hpRemaining <= 0) {
        State.clearSession();
        lastScreen = 'setup';
        renderScreen('setup');
        return;
      }

      // Only show resume modal if the user actually started the workout
      // (clicked "Enter the Grounds" which starts the timer)
      const timerWasStarted = state.session.timer.running || state.session.timer.elapsed > 0;
      if (!timerWasStarted) {
        // User never entered the workout, clear and start fresh
        State.clearSession();
        lastScreen = 'setup';
        renderScreen('setup');
        return;
      }

      // Render setup first as background
      renderScreen('setup');

      // Show resume modal for in-progress workouts only
      Screens.renderResumeModal(
        app,
        // On resume - go directly to workout screen
        () => {
          // Resume timer from where it left off
          State.resumeTimer();
          State.setScreen('workout');
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
  lastScreen = 'setup';
  renderScreen('setup');
}

// Initialize the app
function init() {
  // Subscribe to state changes (screen changes only trigger re-render)
  State.subscribe(render);

  // Start timer loop
  timerLoop();

  // Start periodic save
  startPeriodicSave();

  // Check for saved session
  checkSavedSession();
}

// Expose forceRender for use by other modules
window.wyrdForceRender = forceRender;

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
