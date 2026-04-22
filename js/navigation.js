// simple nav helpers

function initializeSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

function setActiveNavigation() {
  const pathParts = window.location.pathname.split('/');
  const currentPageName = pathParts[pathParts.length - 1] || 'index.html';
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(function (link) {
    if (link.getAttribute('href') === currentPageName) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initializeHamburgerMenu() {
  const hamburger = document.getElementById('hamburgerMenu');
  const menuBox = document.querySelector('.nav-links');

  if (!hamburger || !menuBox) {
    return;
  }

  function toggleMobileMenu() {
    if (menuBox.classList.contains('active')) {
      hamburger.classList.remove('active');
      menuBox.classList.remove('active');
      return;
    }

    hamburger.classList.add('active');
    menuBox.classList.add('active');
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  const menuLinks = menuBox.querySelectorAll('a');
  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      menuBox.classList.remove('active');
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.navbar')) {
      hamburger.classList.remove('active');
      menuBox.classList.remove('active');
    }
  });
}

function initializeHeaderScroll() {
  const header = document.querySelector('.site-header');

  if (!header) {
    return;
  }

  function updateHeaderState() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initializeBackToTop() {
  const backToTopButton = document.getElementById('backToTop');

  if (!backToTopButton) {
    return;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    },
    { passive: true }
  );

  backToTopButton.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
