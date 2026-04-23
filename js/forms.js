// Feedback form helpers.

// Validate the feedback form and keep the saved entries in local storage.
function initializeFeedbackForm() {
  const form = document.querySelector('.feedback-form');

  if (!form) {
    return;
  }

  const status = document.querySelector('[data-feedback-status]');
  const fields = Array.from(form.querySelectorAll('input, textarea'));

  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });

    field.addEventListener('input', function () {
      if (field.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    let isValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const feedbackEntry = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      timestamp: new Date().toISOString()
    };

    const values = Object.values(feedbackEntry);
    const hasEmptyValue = values.some(function (value) {
      return !value;
    });

    if (hasEmptyValue) {
      setFeedbackStatus(status, 'Please fill in all fields before submitting.', true);
      return;
    }

    try {
      const savedFeedback = JSON.parse(localStorage.getItem('feedbackList') || '[]');
      const feedbackList = Array.isArray(savedFeedback) ? savedFeedback : [];

      feedbackList.push(feedbackEntry);
      localStorage.setItem('feedbackList', JSON.stringify(feedbackList));
    } catch (err) {
      setFeedbackStatus(status, 'Failed to save locally. Try again later.', true);
      return;
    }

    fields.forEach(function (field) {
      field.classList.remove('has-error', 'has-success');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');

      const errorMessage = field.nextElementSibling;
      if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.remove();
      }
    });

    form.reset();
    setFeedbackStatus(status, 'Your feedback was saved locally! Thank you.', false);
  });
}

// Check one field and place a small inline error message when needed.
function validateField(field) {
  const value = field.value.trim();
  const boxType = field.getAttribute('type');
  let isValid = true;
  let errorMessage = '';

  if (!value) {
    isValid = false;

    const label = document.querySelector('label[for="' + field.id + '"]');
    if (label) {
      errorMessage = label.textContent.replace('*', '').trim() + ' is required';
    } else {
      errorMessage = 'This field is required';
    }
  }

  if (isValid && boxType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }

  field.classList.toggle('has-error', !isValid);
  field.classList.toggle('has-success', isValid && value);
  field.setAttribute('aria-invalid', String(!isValid));

  const oldError = field.nextElementSibling;
  if (oldError && oldError.classList.contains('error-message')) {
    oldError.remove();
  }

  field.removeAttribute('aria-describedby');

  if (!isValid && errorMessage) {
    const errorElement = document.createElement('span');
    errorElement.id = (field.id || field.name) + '-error';
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = errorMessage;

    field.insertAdjacentElement('afterend', errorElement);
    field.setAttribute('aria-describedby', errorElement.id);
  }

  return isValid;
}

// Show a short success or error message above the submit button.
function setFeedbackStatus(statusElement, message, isError) {
  if (!statusElement) {
    return;
  }

  statusElement.hidden = false;
  statusElement.textContent = message;
  statusElement.classList.toggle('is-error', isError);
}
