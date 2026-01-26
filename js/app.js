// Wyrd Workout - Main Application
console.log('[App] Loading app.js...');

import * as State from './state.js';
import * as Screens from './screens.js';

console.log('[App] Imports complete');
const app = document.getElementById('app');
let timerRAF = null;
let lastScreen = null;
let swRegistration = null;

// Service Worker Registration
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.register('/sw.js').then((registration) => {
    swRegistration = registration;

    // Check for updates on page load
    registration.update();

    // Listen for new service worker installing
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        // New service worker is installed and waiting
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification();
        }
      });
    });

    // If there's already a waiting worker, show notification
    if (registration.waiting) {
      showUpdateNotification();
    }
  }).catch((error) => {
    console.error('Service worker registration failed:', error);
  });

  // Handle controller change (new SW took over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Show update notification toast
function showUpdateNotification() {
  // Don't show if already showing
  if (document.querySelector('.update-toast')) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'update-toast';
  toast.innerHTML = `
    <span class="update-toast-text">A new version is available</span>
    <button class="update-toast-btn" type="button">Update</button>
    <button class="update-toast-dismiss" type="button" aria-label="Dismiss">&times;</button>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('update-toast-visible');
  });

  // Update button - activate new service worker
  toast.querySelector('.update-toast-btn').addEventListener('click', () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Dismiss button
  toast.querySelector('.update-toast-dismiss').addEventListener('click', () => {
    toast.classList.remove('update-toast-visible');
    setTimeout(() => toast.remove(), 300);
  });
}

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

// Check for workout link in URL parameters
function checkWorkoutLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const workoutParam = urlParams.get('w');
  console.log('[WorkoutLink] Checking URL params, w=', workoutParam ? workoutParam.substring(0, 20) + '...' : null);

  if (workoutParam) {
    // Clear the URL parameter without triggering navigation
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    // Try to initialize session from the workout link
    console.log('[WorkoutLink] Attempting to init session from link...');
    try {
      const result = State.initSessionFromWorkoutLink(workoutParam);
      console.log('[WorkoutLink] initSessionFromWorkoutLink result:', result);
      if (result) {
        // Successfully loaded - render roll screen
        console.log('[WorkoutLink] Rendering roll screen...');
        renderScreen('roll');
        lastScreen = 'roll';
        State.setScreen('roll');
        console.log('[WorkoutLink] Done, state:', State.getState());
        return true;
      }
    } catch (e) {
      console.error('[WorkoutLink] Error initializing from link:', e);
    }
  }

  return false;
}

// Check for saved session on load
function checkSavedSession() {
  // First check for workout link in URL
  if (checkWorkoutLink()) {
    return;
  }

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
      // (clicked "Begin Encounter" which starts the timer)
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
  console.log('[App] init() called');
  // Register service worker for caching and updates
  registerServiceWorker();

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
