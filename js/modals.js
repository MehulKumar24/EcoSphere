// Modal helpers for organization cards and progress popups.

let lastFocusedElement = null;

// Reuse one generic modal layout for custom popup content.
window.showGenericModal = function (title, contentHtml) {
  const modal = document.getElementById('orgModal');
  const modalContent = modal ? modal.querySelector('.modal-content') : null;

  if (!modal || !modalContent) {
    return;
  }

  if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  } else {
    lastFocusedElement = null;
  }

  modalContent.replaceChildren();

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = closeModal;

  const header = document.createElement('h2');
  header.textContent = title;

  modalContent.append(closeButton, header);
  modalContent.insertAdjacentHTML('beforeend', contentHtml);

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  closeButton.focus();
};

// Pick a simple emoji logo when a card only has short text data.
function getEmojiLogo(title) {
  const input = (title || '').toLowerCase().trim();

  const abbrevMap = {
    moefcc: '🏛️',
    cpcb: '⚖️',
    nmcg: '🌊',
    wii: '🦁',
    nba: '🌿',
    wwf: '🐼',
    'wwf india': '🐼',
    wti: '🦅',
    bnhs: '🦜',
    teri: '⚡',

    unep: '🌍',
    undp: '🤝',
    ipcc: '📊',
    iucn: '🦁',
    greenpeace: '♻️',
    ci: '🌿',
    birdlife: '🦅',

    epa: '🏢',
    noaa: '🌊',
    usfws: '🦌',

    'natural england': '🌲',
    rspb: '🦅',

    dcceew: '☀️',
    csiro: '🔬',
    gbrmpa: '🐠'
  };

  if (abbrevMap[input]) {
    return abbrevMap[input];
  }

  const keys = Object.keys(abbrevMap);

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];

    if (input.includes(key) || key.includes(input)) {
      return abbrevMap[key];
    }
  }

  if (input.includes('ministry') || input.includes('moef') || input.includes('environment, forest')) {
    return '🏛️';
  }

  if (input.includes('pollution') || input.includes('cpcb') || input.includes('quality control')) {
    return '⚖️';
  }

  if (input.includes('ganga') || input.includes('nmcg') || input.includes('river')) {
    return '🌊';
  }

  if (input.includes('wildlife') || input.includes('wii') || input.includes('animal') || input.includes('lion')) {
    return '🦁';
  }

  if (input.includes('biodiversity') || input.includes('nba') || input.includes('plant') || input.includes('species')) {
    return '🌿';
  }

  if (input.includes('wwf') || input.includes('panda') || input.includes('fund for nature')) {
    return '🐼';
  }

  if (input.includes('bombay') || input.includes('bird') || input.includes('bnhs') || input.includes('history')) {
    return '🦜';
  }

  if (input.includes('teri') || input.includes('energy resource') || input.includes('renewable')) {
    return '⚡';
  }

  if (input.includes('unep') || input.includes('un environment') || input.includes('global')) {
    return '🌍';
  }

  if (input.includes('undp') || input.includes('un development') || input.includes('sustainable')) {
    return '🤝';
  }

  if (input.includes('ipcc') || input.includes('panel') || input.includes('climate')) {
    return '📊';
  }

  if (input.includes('conservation international') || input.includes(' ci ')) {
    return '🌿';
  }

  if (input.includes('greenpeace') || input.includes('peace')) {
    return '♻️';
  }

  if (input.includes('iucn') || input.includes('union for conservation')) {
    return '🦁';
  }

  if (input.includes('birdlife') || input.includes('eagle')) {
    return '🦅';
  }

  if (input.includes('epa') || input.includes('environmental protection')) {
    return '🏢';
  }

  if (input.includes('noaa') || input.includes('oceanic')) {
    return '🌊';
  }

  if (input.includes('usfws') || input.includes('fish')) {
    return '🦌';
  }

  if (input.includes('natural england') || input.includes('rspb')) {
    return '🌲';
  }

  if (input.includes('dcceew') || input.includes('australia')) {
    return '☀️';
  }

  if (input.includes('csiro') || input.includes('research')) {
    return '🔬';
  }

  if (input.includes('barrier reef') || input.includes('gbrmpa') || input.includes('coral')) {
    return '🐠';
  }

  return '🌱';
}

// Build a small logo block that works for both cards and the modal.
function renderOrgLogo(container, fallbackText) {
  container.replaceChildren();
  container.classList.remove('has-image');

  const emoji = getEmojiLogo(fallbackText || 'ecosystem');

  const logoContent = document.createElement('div');
  logoContent.className = 'org-logo-content';

  const emojiSpan = document.createElement('span');
  emojiSpan.className = 'org-logo-symbol';
  emojiSpan.textContent = emoji;

  const textSpan = document.createElement('span');
  textSpan.className = 'org-logo-text';
  textSpan.textContent = fallbackText;

  logoContent.appendChild(emojiSpan);
  logoContent.appendChild(textSpan);

  container.classList.add('has-image');
  container.appendChild(logoContent);
}

// Connect organization cards to the shared modal.
function initializeModals() {
  const modal = document.getElementById('orgModal');

  if (!modal) {
    return;
  }

  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');

  modal.addEventListener('click', function (event) {
    if (event.target === modal || event.target.closest('.modal-close')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', handleModalKeydown);

  const cards = document.querySelectorAll('.org-card');

  cards.forEach(function (card) {
    const heading = card.querySelector('h3');
    const title = heading ? heading.textContent.trim() : 'organization';
    const logoText = card.dataset.logo || 'Eco';
    const cardLogo = card.querySelector('.card-logo');

    if (cardLogo) {
      renderOrgLogo(cardLogo, logoText);
    }

    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', 'View details for ' + title);

    card.addEventListener('click', function () {
      openModal(card);
    });

    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card);
      }
    });
  });
}

// Keep keyboard focus inside the modal while it is open.
function handleModalKeydown(event) {
  const modal = document.getElementById('orgModal');

  if (!modal || !modal.classList.contains('show')) {
    return;
  }

  if (event.key === 'Escape') {
    closeModal();
    return;
  }

  if (event.key === 'Tab') {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

// Fill the modal with the clicked card details.
function openModal(card) {
  const modal = document.getElementById('orgModal');
  const modalContent = modal ? modal.querySelector('.modal-content') : null;

  if (!modal || !modalContent) {
    return;
  }

  const titleElement = card.querySelector('h3');
  const descriptionElement = card.querySelector('p');
  const titleText = titleElement ? titleElement.textContent.trim() : 'Organization';
  const descriptionText = descriptionElement
    ? descriptionElement.textContent.trim()
    : 'No description available.';
  const logoText = card.dataset.logo || 'Eco';
  const focusText = card.dataset.focus || '';
  const impactText = card.dataset.impact || '';
  const website = card.dataset.website || '';

  if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  } else {
    lastFocusedElement = null;
  }

  modalContent.replaceChildren();

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close';
  closeButton.setAttribute('aria-label', 'Close dialog');
  closeButton.textContent = '×';

  const logo = document.createElement('div');
  logo.className = 'org-logo';
  renderOrgLogo(logo, logoText);

  const title = document.createElement('h2');
  title.id = 'orgModalTitle';
  title.textContent = titleText;

  const overviewP = document.createElement('p');
  const overviewLabel = document.createElement('strong');
  overviewLabel.textContent = 'Overview:';
  overviewP.append(overviewLabel, ' ' + descriptionText);

  modalContent.append(closeButton, logo, title, overviewP);

  if (impactText) {
    const impactP = document.createElement('p');
    const impactLabel = document.createElement('strong');
    impactLabel.textContent = 'Impact:';
    impactP.append(impactLabel, ' ' + impactText);
    modalContent.appendChild(impactP);
  }

  if (focusText) {
    const focusContainer = document.createElement('div');
    focusContainer.className = 'org-focus';

    const rawTags = focusText.split(',');
    rawTags.forEach(function (rawTag) {
      const cleanTag = rawTag.trim();

      if (cleanTag) {
        const tag = document.createElement('span');
        tag.className = 'focus-tag';
        tag.textContent = cleanTag;
        focusContainer.appendChild(tag);
      }
    });

    modalContent.appendChild(focusContainer);
  }

  if (website) {
    const websiteWrapper = document.createElement('p');
    const websiteLink = document.createElement('a');
    const websiteLabel = document.createElement('span');

    websiteLink.href = website;
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.className = 'modal-link';

    websiteLabel.textContent = 'Visit Official Website';
    websiteLink.append(websiteLabel, ' ', '→');
    websiteWrapper.appendChild(websiteLink);
    modalContent.appendChild(websiteWrapper);
  }

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  modal.setAttribute('aria-labelledby', 'orgModalTitle');
  document.body.classList.add('modal-open');
  closeButton.focus();
}

// Close the modal and send focus back to where it came from.
function closeModal() {
  const modal = document.getElementById('orgModal');

  if (!modal) {
    return;
  }

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (lastFocusedElement && lastFocusedElement.isConnected) {
    lastFocusedElement.focus();
  }
}
