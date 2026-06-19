const form = document.getElementById('lead-form');
const formMessage = document.getElementById('form-message');
const submitButton = document.getElementById('submit-button');
const successState = document.getElementById('success-state');
const newEnquiryButton = document.getElementById('new-enquiry');

function setMessage(message = '', type = '') {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
}

function selectedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function formPayload() {
  return {
    name: form.elements.name.value.trim(),
    surname: form.elements.surname.value.trim(),
    number: form.elements.number.value.trim(),
    email: form.elements.email.value.trim(),
    ownsProperty: selectedValue('ownsProperty'),
    wantsToSell: selectedValue('wantsToSell'),
    wantsToBuy: selectedValue('wantsToBuy'),
    needsInsurance: selectedValue('needsInsurance'),
    needsWill: selectedValue('needsWill'),
    communicationConsent: selectedValue('communicationConsent'),
    additionalInfo: form.elements.additionalInfo.value.trim(),
    website: form.elements.website.value.trim()
  };
}

function validate(payload) {
  if (payload.name.length < 2) return 'Please enter your name.';
  if (payload.surname.length < 2) return 'Please enter your surname.';
  if (!/^[0-9+()\-\s]{7,30}$/.test(payload.number)) return 'Please enter a valid contact number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Please enter a valid email address.';

  const yesNoAnswers = [
    payload.ownsProperty,
    payload.wantsToSell,
    payload.wantsToBuy,
    payload.needsInsurance,
    payload.needsWill,
    payload.communicationConsent
  ];

  if (yesNoAnswers.some((answer) => !['yes', 'no'].includes(answer))) {
    return 'Please select Yes or No for every question.';
  }

  return '';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage();

  const payload = formPayload();
  const error = validate(payload);
  if (error) {
    setMessage(error);
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector('span').textContent = 'Sending enquiry…';

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      throw new Error(result.message || 'The enquiry could not be sent. Please try again.');
    }

    form.hidden = true;
    successState.hidden = false;
  } catch (error) {
    setMessage(error.message || 'The enquiry could not be sent. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('span').textContent = 'Send my enquiry';
  }
});

newEnquiryButton.addEventListener('click', () => {
  form.reset();
  form.hidden = false;
  successState.hidden = true;
  setMessage();
  form.elements.name.focus();
});
