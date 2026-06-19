/**
 * Netlify Function: validates the enquiry and relays it to Google Apps Script.
 * The fallback URL is intentionally included so a Netlify deployment works even
 * when an environment variable has not yet been configured.
 */

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWuLwKLtgogLFs4MgNcugcn5FHe9xdusJ2eZK5_1khg_8cJZ75XZq5JLGG25MNOo1soA/exec';
const LEAD_SOURCE = 'Blooming Good Real Estate at the Toyota Legend Ermelo | Lead contacts: Marko Ferreira + Marlyn Ferreira | Marlyn Ferreira Properties + Blue Lily Properties';

const YES_NO_FIELDS = [
  'ownsProperty',
  'wantsToSell',
  'wantsToBuy',
  'needsInsurance',
  'needsWill',
  'communicationConsent'
];

function reply(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function clean(value, maxLength) {
  return String(value ?? '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function validate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid form submission.');
  }

  const lead = {
    name: clean(payload.name, 80),
    surname: clean(payload.surname, 80),
    number: clean(payload.number, 30),
    email: clean(payload.email, 150).toLowerCase(),
    ownsProperty: clean(payload.ownsProperty, 3).toLowerCase(),
    wantsToSell: clean(payload.wantsToSell, 3).toLowerCase(),
    wantsToBuy: clean(payload.wantsToBuy, 3).toLowerCase(),
    needsInsurance: clean(payload.needsInsurance, 3).toLowerCase(),
    needsWill: clean(payload.needsWill, 3).toLowerCase(),
    communicationConsent: clean(payload.communicationConsent, 3).toLowerCase(),
    additionalInfo: clean(payload.additionalInfo, 1500),
    website: clean(payload.website, 100)
  };

  if (lead.website) return { bot: true };
  if (lead.name.length < 2) throw new Error('Please enter your name.');
  if (lead.surname.length < 2) throw new Error('Please enter your surname.');
  if (!/^[0-9+()\-\s]{7,30}$/.test(lead.number)) throw new Error('Please enter a valid contact number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error('Please enter a valid email address.');

  for (const field of YES_NO_FIELDS) {
    if (!['yes', 'no'].includes(lead[field])) {
      throw new Error('Please select Yes or No for every question.');
    }
  }

  return lead;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { success: false, message: 'Method not allowed.' });
  if (!event.body || event.body.length > 16000) return reply(400, { success: false, message: 'Invalid form submission.' });

  try {
    const lead = validate(JSON.parse(event.body));
    if (lead.bot) return reply(200, { success: true, message: 'Thank you.' });

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl.includes('/exec')) {
      return reply(500, { success: false, message: 'The enquiry form is not configured yet.' });
    }

    const body = new URLSearchParams({ ...lead, source: LEAD_SOURCE });
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      redirect: 'follow'
    });

    const text = await upstream.text();
    let result = {};
    try { result = JSON.parse(text); } catch (_) {}

    if (!upstream.ok || result.success !== true) {
      console.error('Apps Script submission failed:', upstream.status, text.slice(0, 500));
      return reply(502, { success: false, message: result.message || 'The enquiry could not be saved. Please try again.' });
    }

    return reply(200, { success: true, message: 'Thank you. Your enquiry has been sent.' });
  } catch (error) {
    console.error('Lead form error:', error);
    return reply(400, { success: false, message: error?.message || 'Please check the form and try again.' });
  }
};
