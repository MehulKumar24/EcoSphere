// Main app setup shared by the pages.

let deferredPrompt = null;

// Only print helper logs while working locally or in debug mode.
const DEBUG_MODE =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
  window.location.search.includes('debug=true');

function debugLog(method, ...args) {
  if (!DEBUG_MODE) {
    return;
  }

  if (typeof console === 'undefined') {
    return;
  }

  if (typeof console[method] !== 'function') {
    return;
  }

  console[method](...args);
}

function logTime(label) {
  debugLog('log', label + ' at ' + Math.round(performance.now()) + 'ms');
}

// Install prompt helpers
const INSTALL_STATE_KEY = 'ecosphere-installed';
const ADD_TO_HOME_LABEL = '\uD83D\uDCF1 Add to Home Screen';
const REMOVE_FROM_HOME_LABEL = '\uD83D\uDDD1\uFE0F Remove from Home Screen';

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIndexPage() {
  const path = window.location.pathname;

  return path === '/' || path.endsWith('/') || path.endsWith('index.html');
}

function getStoredInstallState() {
  try {
    return window.localStorage.getItem(INSTALL_STATE_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function setStoredInstallState(isInstalled) {
  try {
    window.localStorage.setItem(INSTALL_STATE_KEY, String(isInstalled));
  } catch (error) {}
}

function isAppInstalled() {
  return isStandaloneMode() || getStoredInstallState();
}

function removeInstallBanner() {
  const installBanner = document.getElementById('installBanner');

  if (installBanner) {
    installBanner.remove();
  }
}

function setInstallButtonVisible() {
  const button = document.getElementById('installToHomeBtn');

  if (!button) {
    return;
  }

  button.hidden = false;

  if (isAppInstalled()) {
    button.textContent = REMOVE_FROM_HOME_LABEL;
    return;
  }

  button.textContent = ADD_TO_HOME_LABEL;
}

function refreshInstallUi() {
  if (isStandaloneMode()) {
    setStoredInstallState(true);
  }

  if (isAppInstalled()) {
    removeInstallBanner();
  }

  setInstallButtonVisible();
}

function promptForInstall() {
  if (!deferredPrompt) {
    return Promise.resolve(false);
  }

  const installEvent = deferredPrompt;
  deferredPrompt = null;

  return installEvent
    .prompt()
    .then(function () {
      return installEvent.userChoice;
    })
    .then(function (choiceResult) {
      const didInstall = choiceResult.outcome === 'accepted';

      if (didInstall) {
        debugLog('log', '[PWA] Install prompt accepted');
        setStoredInstallState(true);
      }

      refreshInstallUi();
      return didInstall;
    })
    .catch(function () {
      refreshInstallUi();
      return false;
    });
}

function showInstallPrompt() {
  if (!isIndexPage() || isAppInstalled() || !deferredPrompt) {
    return;
  }

  if (document.getElementById('installBanner')) {
    return;
  }

  const installBanner = document.createElement('div');
  installBanner.id = 'installBanner';
  installBanner.className = 'install-banner';
  installBanner.innerHTML = `
    <div class="install-content">
      <p>Add EcoSphere to your home screen for quick access</p>
      <div class="install-buttons">
        <button id="installBtn" type="button" class="btn-primary">Install</button>
        <button id="dismissBtn" type="button" class="btn-secondary">Dismiss</button>
      </div>
    </div>
  `;

  document.body.appendChild(installBanner);

  const installBtn = document.getElementById('installBtn');
  const dismissBtn = document.getElementById('dismissBtn');

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      promptForInstall().then(function () {
        removeInstallBanner();
      });
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      removeInstallBanner();
    });
  }
}

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  deferredPrompt = event;
  setStoredInstallState(false);
  refreshInstallUi();

  if (isIndexPage()) {
    setTimeout(showInstallPrompt, 500);
  }
});

function triggerInstall() {
  if (isAppInstalled()) {
    alert(
      'To remove EcoSphere, please use your device settings or long-press the app icon on your home screen and select "Remove App" or "Uninstall".'
    );
    return;
  }

  if (deferredPrompt) {
    promptForInstall().then(function () {
      removeInstallBanner();
    });
    return;
  }

  alert('Install option is not ready yet. Please wait a moment or use the browser install menu.');
}

window.addEventListener('appinstalled', function () {
  setStoredInstallState(true);
  removeInstallBanner();
  deferredPrompt = null;
  refreshInstallUi();
});

window.addEventListener('pageshow', refreshInstallUi);
window.addEventListener('focus', refreshInstallUi);

const installModeQuery = window.matchMedia('(display-mode: standalone)');
if (typeof installModeQuery.addEventListener === 'function') {
  installModeQuery.addEventListener('change', refreshInstallUi);
} else if (typeof installModeQuery.addListener === 'function') {
  installModeQuery.addListener(refreshInstallUi);
}

// Small performance marks used during page startup.
const performanceMetrics = {
  navigationStart: performance.now(),
  markings: {}
};

function measurePerformance(label) {
  performanceMetrics.markings[label] = performance.now();
}

// Reveal cards and hero content once they enter the viewport.
function initializeScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  const elements = document.querySelectorAll('.card, .hero-content, .org-card');
  elements.forEach(function (element) {
    element.classList.add('reveal-on-scroll');
    observer.observe(element);
  });
}

// Build and manage the sustainability tracker on the task page.
function initializeSustainabilityTracker() {
  const container = document.getElementById('ecoTracker');

  if (!container) {
    return;
  }

  const ecoTiers = [
    'Seedling',
    'Sprout',
    'Sapling',
    'Leaf',
    'Branch',
    'Tree',
    'Grove',
    'Forest',
    'Ecosystem',
    'Biosphere',
    'Earth Guardian',
    'Climate Champion'
  ];

  const baseActions = [
    'Recycle paper',
    'Turn off lights',
    'Save water',
    'Plant a seed',
    'Use public transport',
    'Avoid plastic',
    'Compost waste',
    'Buy local',
    'Use LED bulbs',
    'Unplug electronics',
    'Reusable bag',
    'Fix a leak',
    'Cold wash laundry',
    'Eat organic',
    'Clean a park',
    'Share eco-tips',
    'Donate clothes',
    'Mulch garden',
    'Solar charging',
    'Walk instead of drive'
  ];

  function getLevelKey(levelName) {
    return levelName.toLowerCase().replace(/\s+/g, '-');
  }

  const taskData = {};

  ecoTiers.forEach(function (levelName) {
    const levelKey = getLevelKey(levelName);
    const tasks = [];

    // Each tier gets a long list of simple actions so users can keep progress going.
    for (let index = 0; index < 100; index += 1) {
      tasks.push({
        id: levelKey + '-' + (index + 1),
        text: levelName + ' Action #' + (index + 1) + ': ' + baseActions[index % baseActions.length]
      });
    }

    taskData[levelKey] = tasks;
  });

  const rawData = localStorage.getItem('ecoTasks');
  let data = rawData ? JSON.parse(rawData) : { completed: [] };

  if (!data || typeof data !== 'object') {
    data = { completed: [] };
  }

  if (!Array.isArray(data.completed)) {
    data.completed = [];
  }

  if (!data.currentLevel || !taskData[data.currentLevel]) {
    data.currentLevel = 'seedling';
  }

  let navButtons = '';

  ecoTiers.forEach(function (levelName) {
    const levelKey = getLevelKey(levelName);
    const activeClass = data.currentLevel === levelKey ? 'active' : '';
    navButtons += '<button class="level-btn ' + activeClass + '" data-level="' + levelKey + '">' + levelName + '</button>';
  });

  container.innerHTML = `
    <div class="tracker-header">
      <h3>My Eco Journey</h3>
      <div class="level-selector">
        ${navButtons}
      </div>
    </div>
    <div id="levelMessage" class="level-message" aria-live="polite"></div>
    <div class="progress-container">
      <div id="trackerProgress"
           class="progress-bar"
           role="progressbar"
           aria-valuemin="0"
           aria-valuemax="100"
           aria-valuenow="0"
           aria-label="Level completion progress"></div>
    </div>
    <div id="taskList" class="task-list custom-scrollbar" role="list"></div>
    <div class="tracker-actions" style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
      <button id="levelProgressBtn" class="btn-primary" type="button">📊 See Level Progress</button>
      <button id="overallProgressBtn" class="btn-secondary" type="button">🏆 See Overall Progress</button>
    </div>
    <div class="page-actions" style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
      <a href="feedback.html" class="btn-secondary" style="display: block; text-align: center; width: 100%;">Share Your Feedback</a>
    </div>
  `;

  function countCompletedForLevel(levelKey) {
    const prefix = levelKey + '-';
    let count = 0;

    data.completed.forEach(function (taskId) {
      if (taskId.startsWith(prefix)) {
        count += 1;
      }
    });

    return count;
  }

  function updateProgress(total, levelKey) {
    const bar = document.getElementById('trackerProgress');

    if (!bar) {
      return;
    }

    const levelTasks = taskData[levelKey];
    let completedCount = 0;

    levelTasks.forEach(function (task) {
      if (data.completed.includes(task.id)) {
        completedCount += 1;
      }
    });

    const progress = (completedCount / total) * 100;
    bar.style.width = progress + '%';
  }

  function renderTasks(levelKey) {
    const taskList = document.getElementById('taskList');
    const tasks = taskData[levelKey];

    if (!taskList || !tasks) {
      return;
    }

    const msgEl = document.getElementById('levelMessage');
    if (msgEl) {
      msgEl.textContent = 'Current Tier: ' + levelKey.replace('-', ' ').toUpperCase() + ' 🌿';
      msgEl.classList.add('show');

      setTimeout(function () {
        msgEl.classList.remove('show');
      }, 3000);
    }

    let taskHtml = '';

    tasks.forEach(function (task) {
      const isDone = data.completed.includes(task.id);
      taskHtml += `
        <label class="tracker-item" data-task-id="${task.id}" role="listitem">
          <div class="checkbox-mock ${isDone ? 'checked' : ''}"></div>
          <span>${task.text}</span>
        </label>
      `;
    });

    taskList.innerHTML = taskHtml;

    const items = taskList.querySelectorAll('.tracker-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        const taskId = item.getAttribute('data-task-id');
        const index = data.completed.indexOf(taskId);

        if (index === -1) {
          data.completed.push(taskId);
        } else {
          data.completed.splice(index, 1);
        }

        const checkbox = item.querySelector('.checkbox-mock');
        if (checkbox) {
          checkbox.classList.toggle('checked');
        }

        localStorage.setItem('ecoTasks', JSON.stringify(data));
        updateProgress(tasks.length, levelKey);
      });
    });

    updateProgress(tasks.length, levelKey);
  }

  function showAnalysisPopup(title, specificLevelKey) {
    let reportHtml = '';

    if (specificLevelKey) {
      let levelName = '';

      ecoTiers.forEach(function (tier) {
        if (getLevelKey(tier) === specificLevelKey) {
          levelName = tier;
        }
      });

      const count = countCompletedForLevel(specificLevelKey);

      reportHtml = `
        <div class="analysis-modal-content">
          <div class="analysis-row">
            <div class="analysis-info">
              <span class="analysis-label">${levelName} Tier Progress</span>
              <span class="analysis-pct">${count}/100</span>
            </div>
            <div class="analysis-bar-bg">
              <div class="analysis-bar-fill ${count === 100 ? 'complete' : ''}" style="width: ${count}%"></div>
            </div>
          </div>
          <p style="margin-top: 20px; text-align: center;">You have completed ${count} actions in this category!</p>
        </div>
      `;
    } else {
      reportHtml = '<div class="analysis-modal-content">';

      ecoTiers.forEach(function (tier) {
        const levelKey = getLevelKey(tier);
        const count = countCompletedForLevel(levelKey);

        reportHtml += `
          <div class="analysis-row">
            <div class="analysis-info">
              <span class="analysis-label">${tier}</span>
              <span class="analysis-pct">${count}%</span>
            </div>
            <div class="analysis-bar-bg">
              <div class="analysis-bar-fill ${count === 100 ? 'complete' : ''}" style="width: ${count}%"></div>
            </div>
          </div>
        `;
      });

      reportHtml += '</div><p style="margin-top: 25px; text-align: center; font-weight: 600;">Overall Progress Analysis 🌍</p>';
    }

    window.showGenericModal(title, reportHtml);
  }

  const levelProgressBtn = document.getElementById('levelProgressBtn');
  if (levelProgressBtn) {
    levelProgressBtn.addEventListener('click', function () {
      const currentName = data.currentLevel.replace('-', ' ').toUpperCase();
      showAnalysisPopup(currentName + ' Progress', data.currentLevel);
    });
  }

  const overallProgressBtn = document.getElementById('overallProgressBtn');
  if (overallProgressBtn) {
    overallProgressBtn.addEventListener('click', function () {
      showAnalysisPopup('Sustainability Journey Overview');
    });
  }

  const levelButtons = container.querySelectorAll('.level-btn');
  levelButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const newLevel = button.getAttribute('data-level');
      data.currentLevel = newLevel;
      localStorage.setItem('ecoTasks', JSON.stringify(data));

      levelButtons.forEach(function (item) {
        item.classList.remove('active');
      });

      button.classList.add('active');
      renderTasks(newLevel);
    });
  });

  renderTasks(data.currentLevel);
}

// Run the simple live counters shown on the home page.
function startTreeCounter() {
  const treeCounter = document.getElementById('treeCounter');
  const plasticCounter = document.getElementById('plasticCounter');

  if (treeCounter) {
    debugLog('log', 'startTreeCounter: treeCounter element found.');

    const savedVal = localStorage.getItem('ecoTrees');
    const parsedSaved = savedVal ? parseInt(savedVal) : NaN;
    let treeCount = !isNaN(parsedSaved)
      ? parsedSaved
      : parseInt(treeCounter.textContent.replace(/[^\d]/g, '')) || 0;

    debugLog('log', 'startTreeCounter: Initial treeCount:', treeCount, 'from localStorage:', savedVal);
    treeCounter.textContent = treeCount.toLocaleString();

    setInterval(function () {
      treeCount += Math.floor(Math.random() * 2) + 1;
      treeCounter.textContent = treeCount.toLocaleString();
      localStorage.setItem('ecoTrees', treeCount);
      treeCounter.style.transform = 'scale(1.05)';

      setTimeout(function () {
        treeCounter.style.transform = 'scale(1)';
      }, 200);

      debugLog('log', 'startTreeCounter: Tree count updated to:', treeCount);
    }, 2500);
  } else {
    debugLog('warn', 'startTreeCounter: treeCounter element not found.');
  }

  if (plasticCounter) {
    debugLog('log', 'startTreeCounter: plasticCounter element found.');

    const savedVal = localStorage.getItem('ecoPlastic');
    const parsedSaved = savedVal ? parseInt(savedVal) : NaN;
    let plasticCount = !isNaN(parsedSaved)
      ? parsedSaved
      : parseInt(plasticCounter.textContent.replace(/[^\d]/g, '')) || 0;

    debugLog('log', 'startTreeCounter: Initial plasticCount:', plasticCount, 'from localStorage:', savedVal);
    plasticCounter.textContent = plasticCount.toLocaleString();

    setInterval(function () {
      plasticCount += Math.floor(Math.random() * 5) + 5;
      plasticCounter.textContent = plasticCount.toLocaleString();
      localStorage.setItem('ecoPlastic', plasticCount);
      plasticCounter.style.transform = 'scale(1.05)';

      setTimeout(function () {
        plasticCounter.style.transform = 'scale(1)';
      }, 200);

      debugLog('log', 'startTreeCounter: Plastic count updated to:', plasticCount);
    }, 1800);
  } else {
    debugLog('warn', 'startTreeCounter: plasticCounter element not found.');
  }
}

// Keep placeholder social links friendly until real profiles are added.
function initializeSocialPlaceholders() {
  const links = document.querySelectorAll('.social-link-future');

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      debugLog('log', '[Future Feature] Social media link clicked:', link.textContent.trim());
      alert(link.textContent.trim() + ' integration is planned for a future update and is currently unavailable.');
    });
  });
}

// Reuse a simple share helper when a page wants native sharing.
window.handleWebShare = async function (title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title: title, text: text, url: url });
    } catch (err) {
      debugLog('error', 'Share failed:', err);
    }

    return;
  }

  alert('Sharing is not supported in this browser. Please copy the URL manually.');
};

function reportMetrics() {
  logTime('Page completely ready');
}

// Page boot sequence
document.addEventListener('DOMContentLoaded', function () {
  function init(name, fn) {
    try {
      if (typeof fn === 'function') {
        fn();
      } else {
        debugLog('warn', 'Initialization function for ' + name + ' not found.');
      }
    } catch (error) {
      debugLog('error', 'Error initializing ' + name + ':', error);
    }
  }

  init('Smooth Scroll', typeof initializeSmoothScroll === 'function' ? initializeSmoothScroll : null);
  init('Active Navigation', typeof setActiveNavigation === 'function' ? setActiveNavigation : null);
  init('Hamburger Menu', typeof initializeHamburgerMenu === 'function' ? initializeHamburgerMenu : null);
  init('Header Scroll', typeof initializeHeaderScroll === 'function' ? initializeHeaderScroll : null);
  init('Back to Top', typeof initializeBackToTop === 'function' ? initializeBackToTop : null);
  init('Modals', typeof initializeModals === 'function' ? initializeModals : null);
  init('Search', typeof initializeSearch === 'function' ? initializeSearch : null);
  init('Feedback Form', typeof initializeFeedbackForm === 'function' ? initializeFeedbackForm : null);
  init('Social Placeholders', initializeSocialPlaceholders);

  measurePerformance('Modules Initialized');

  requestAnimationFrame(function () {
    initializeScrollAnimations();
    initializeSustainabilityTracker();
    startTreeCounter();
    trackCoreWebVitals();
  });

  const installButton = document.getElementById('installToHomeBtn');
  if (installButton) {
    installButton.addEventListener('click', triggerInstall);
  }

  logTime('Features Loaded');
  registerServiceWorker();
  refreshInstallUi();
  setTimeout(reportMetrics, 1000);
});

// Optional vitals logging while debugging page performance.
function trackCoreWebVitals() {
  if (!window.PerformanceObserver) {
    return;
  }

  try {
    new PerformanceObserver(function (list) {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      debugLog('log', 'LCP Score:', lastEntry.renderTime || lastEntry.loadTime);
    }).observe({
      type: 'largest-contentful-paint',
      buffered: true
    });
  } catch (error) {}

  try {
    new PerformanceObserver(function (list) {
      const entries = list.getEntries();
      entries.forEach(function (entry) {
        debugLog('log', 'Interaction Delay:', entry.processingDuration);
      });
    }).observe({
      type: 'first-input',
      buffered: true
    });
  } catch (error) {}
}

// Register the root worker so it can control the whole site, not just /js/.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    return;
  }

  navigator.serviceWorker
    .register('./service-worker.js')
    .then(function (registration) {
      debugLog('log', 'Service Worker is active!');

      setInterval(function () {
        registration.update();
      }, 60000);

      registration.addEventListener('updatefound', function () {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', function () {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdatePrompt();
          }
        });
      });
    })
    .catch(function (error) {
      debugLog('error', '[PWA] Service Worker registration failed:', error);
    });

  navigator.serviceWorker.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      showUpdateNotification();
    }
  });
}

// Show a small prompt when a fresh cached version is ready.
function showUpdatePrompt() {
  if (document.getElementById('updateBanner')) {
    return;
  }

  const updateBanner = document.createElement('div');
  updateBanner.id = 'updateBanner';
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div class="update-content">
      <p>A new version of EcoSphere is available</p>
      <div class="update-buttons">
        <button id="updateBtn" type="button" class="btn-primary">Update Now</button>
        <button id="updateLaterBtn" type="button" class="btn-secondary">Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(updateBanner);

  const updateBtn = document.getElementById('updateBtn');
  const updateLaterBtn = document.getElementById('updateLaterBtn');

  if (updateBtn) {
    updateBtn.addEventListener('click', function () {
      window.location.reload();
    });
  }

  if (updateLaterBtn) {
    updateLaterBtn.addEventListener('click', function () {
      updateBanner.remove();
    });
  }
}

// Let the user know the app is now available offline.
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'pwa-notification';
  notification.textContent = 'EcoSphere is now available offline';
  document.body.appendChild(notification);

  setTimeout(function () {
    notification.classList.add('show');
  }, 100);

  setTimeout(function () {
    notification.classList.remove('show');

    setTimeout(function () {
      notification.remove();
    }, 300);
  }, 4000);
}

