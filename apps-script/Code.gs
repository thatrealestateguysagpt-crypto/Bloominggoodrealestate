/**
 * Marlyn Ferreira Properties - Google Sheets lead receiver
 *
 * Paste this entire file into Extensions > Apps Script for the linked Google Sheet.
 * Deploy it as a Web App, then store the /exec URL in Netlify as:
 * GOOGLE_APPS_SCRIPT_URL
 */

const SPREADSHEET_ID = '1-uRPB6uM9bHpIo69CMSMLxQVlsE2tVgodY5FFCOKnv0';
const SHEET_NAME = 'Leads';

const HEADERS = [
  'Timestamp',
  'Name',
  'Surname',
  'Number',
  'Email',
  'Own a Property',
  'Want to Sell',
  'Want to Buy',
  'Need Insurance',
  'Need a Will',
  'Consent to Communication',
  'Additional Info',
  'Source'
];

function doGet() {
  return jsonResponse({
    success: true,
    message: 'Marlyn Ferreira Properties lead receiver is online.'
  });
}

function doPost(e) {
  try {
    const data = getRequestData_(e);

    // Honeypot: bots often populate hidden fields that real visitors never see.
    if (String(data.website || '').trim()) {
      return jsonResponse({ success: true, message: 'Received.' });
    }

    const lead = validateAndClean_(data);
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
      const sheet = getOrCreateLeadSheet_();
      const nextRow = sheet.getLastRow() + 1;

      const row = [[
        new Date(),
        lead.name,
        lead.surname,
        lead.number,
        lead.email,
        lead.ownsProperty,
        lead.wantsToSell,
        lead.wantsToBuy,
        lead.needsInsurance,
        lead.needsWill,
        lead.communicationConsent,
        lead.additionalInfo,
        lead.source
      ]];

      // Preserve user input as text so values starting with =, +, - or @
      // are never treated as spreadsheet formulas.
      sheet.getRange(nextRow, 2, 1, HEADERS.length - 1).setNumberFormat('@');
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues(row);
      sheet.getRange(nextRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true, message: 'Lead saved successfully.' });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : 'Unable to save this enquiry.'
    });
  }
}

function getRequestData_(e) {
  if (!e) return {};

  // Accept either normal form data or a JSON body. The Netlify function sends form data.
  if (e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      throw new Error('The lead data could not be read.');
    }
  }

  return {};
}

function getOrCreateLeadSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#14296b')
      .setFontColor('#ffffff');
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function validateAndClean_(data) {
  const lead = {
    name: cleanText_(data.name, 80),
    surname: cleanText_(data.surname, 80),
    number: cleanText_(data.number, 30),
    email: cleanText_(data.email, 150).toLowerCase(),
    ownsProperty: yesNo_(data.ownsProperty, 'Do you own a property'),
    wantsToSell: yesNo_(data.wantsToSell, 'Do you want to sell a property'),
    wantsToBuy: yesNo_(data.wantsToBuy, 'Do you want to buy a property'),
    needsInsurance: yesNo_(data.needsInsurance, 'Do you need insurance'),
    needsWill: yesNo_(data.needsWill, 'Do you need a will'),
    communicationConsent: yesNo_(data.communicationConsent, 'Consent to communication'),
    additionalInfo: cleanText_(data.additionalInfo || '', 1500),
    source: 'Marlyn Ferreira Properties website'
  };

  if (lead.name.length < 2) throw new Error('Please provide a valid name.');
  if (lead.surname.length < 2) throw new Error('Please provide a valid surname.');
  if (!/^[0-9+()\-\s]{7,30}$/.test(lead.number)) {
    throw new Error('Please provide a valid contact number.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    throw new Error('Please provide a valid email address.');
  }

  return lead;
}

function yesNo_(value, label) {
  const clean = String(value || '').trim().toLowerCase();
  if (clean !== 'yes' && clean !== 'no') {
    throw new Error(label + ' must be Yes or No.');
  }
  return clean === 'yes' ? 'Yes' : 'No';
}

function cleanText_(value, maxLength) {
  const clean = String(value || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);

  // Protect Google Sheets from formula injection while keeping the visible value unchanged.
  return /^[=+\-@]/.test(clean) ? "'" + clean : clean;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
