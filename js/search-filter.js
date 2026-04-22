// search and filter

function initializeSearch() {
  const searchInput = document.getElementById('searchInput');

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('input', performSearch);

  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(function (button) {
    const isActive = button.classList.contains('active');
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      performSearch();
    });
  });

  const orgControls = document.querySelector('.org-controls');

  if (orgControls && !document.getElementById('clearFiltersBtn')) {
    const clearButton = document.createElement('button');
    clearButton.id = 'clearFiltersBtn';
    clearButton.type = 'button';
    clearButton.className = 'btn-secondary';
    clearButton.textContent = 'Clear Filters';
    clearButton.setAttribute('aria-label', 'Clear all filters and search');

    clearButton.addEventListener('click', function () {
      searchInput.value = '';

      filterButtons.forEach(function (button) {
        const isAll = button.dataset.filter === 'all';

        if (isAll) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }

        button.setAttribute('aria-pressed', String(isAll));
      });

      performSearch();
    });

    orgControls.appendChild(clearButton);
  }

  if (orgControls && !document.getElementById('surpriseBtn')) {
    const surpriseButton = document.createElement('button');
    surpriseButton.id = 'surpriseBtn';
    surpriseButton.type = 'button';
    surpriseButton.className = 'filter-btn surprise-btn';
    surpriseButton.textContent = 'Surprise Me';

    surpriseButton.addEventListener('click', function () {
      const allCards = document.querySelectorAll('.org-card');
      const visibleCards = [];

      allCards.forEach(function (card) {
        if (!card.hidden) {
          visibleCards.push(card);
        }
      });

      if (visibleCards.length === 0) {
        alert('No organizations match your current filters.');
        return;
      }

      const randomIndex = Math.floor(Math.random() * visibleCards.length);
      const target = visibleCards[randomIndex];

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      window.setTimeout(function () {
        target.click();
      }, 500);
    });

    orgControls.appendChild(surpriseButton);
  }

  performSearch();
}

function performSearch() {
  const input = document.getElementById('searchInput');
  const grid = document.querySelector('.info-grid');

  if (!input || !grid) {
    return;
  }

  const term = input.value.trim().toLowerCase();
  const activeButton = document.querySelector('.filter-btn.active');
  let filter = 'all';

  if (activeButton) {
    filter = activeButton.dataset.filter || 'all';
  }

  const cards = document.querySelectorAll('.org-card');
  let totalFound = 0;

  cards.forEach(function (card) {
    const heading = card.querySelector('h3');
    const paragraph = card.querySelector('p');
    const category = card.dataset.category || '';

    const content = [
      heading ? heading.textContent : '',
      paragraph ? paragraph.textContent : '',
      card.dataset.focus || '',
      card.dataset.impact || ''
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = content.includes(term);
    const matchesFilter = filter === 'all' || category === filter;
    const matches = matchesSearch && matchesFilter;

    card.hidden = !matches;

    if (matches) {
      totalFound += 1;
    }
  });

  let resultCounter = document.getElementById('resultCounter');

  if (!resultCounter) {
    resultCounter = document.createElement('div');
    resultCounter.id = 'resultCounter';
    resultCounter.className = 'result-counter';

    const orgControls = document.querySelector('.org-controls');
    if (orgControls) {
      orgControls.insertAdjacentElement('afterend', resultCounter);
    }
  }

  if (totalFound === 0) {
    resultCounter.textContent = 'No results found';
  } else if (totalFound === 1) {
    resultCounter.textContent = 'Showing 1 organization';
  } else {
    resultCounter.textContent = 'Showing ' + totalFound + ' organizations';
  }

  let noResultsMessage = grid.querySelector('.no-results');

  if (!noResultsMessage) {
    noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'no-results';
    noResultsMessage.textContent = 'No organizations found matching your search.';
    grid.appendChild(noResultsMessage);
  }

  noResultsMessage.hidden = totalFound !== 0;
}
