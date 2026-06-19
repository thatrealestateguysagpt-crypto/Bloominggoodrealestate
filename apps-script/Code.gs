/**
 * Toyota Legend Ermelo lead receiver
 * Blue Lily Properties + Marlyn Ferreira Properties
 * Lead contacts: Marko Ferreira + Marlyn Ferreira
 *
 * IMPORTANT:
 * - Do NOT run doPost() from the Apps Script editor. It needs form data.
 * - To test the sheet connection, run testLeadSubmission() instead.
 */

const SPREADSHEET_ID = '1-uRPB6uM9bHpIo69CMSMLxQVlsE2tVgodY5FFCOKnv0';
const SHEET_NAME = 'Leads';
const HEADERS = [
  'Timestamp', 'Name', 'Surname', 'Number', 'Email', 'Own a Property',
  'Want to Sell', 'Want to Buy', 'Need Insurance', 'Need a Will',
  'Consent to Communication', 'Additional Info', 'Source'
];
const DEFAULT_SOURCE = 'Blooming Good Real Estate at the Toyota Legend Ermelo | Lead contacts: Marko Ferreira + Marlyn Ferreira | Marlyn Ferreira Properties + Blue Lily Properties';

function doGet() {
  return jsonResponse({
    success: true,
    message: 'Toyota Legend Ermelo lead receiver is online.'
  });
}

function doPost(e) {
  try {
    if (!e) {
      throw new Error('No form data was received. Do not run doPost manually; run testLeadSubmission instead.');
    }

    const data = getRequestData_(e);

    // Quietly accept spam-bot submissions caught by the hidden honeypot field.
    if (String(data.website || '').trim()) {
      return jsonResponse({ success: true, message: 'Received.' });
    }

    const lead = validateAndClean_(data);
    saveLead_(lead);

    return jsonResponse({ success: true, message: 'Lead saved successfully.' });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : 'Unable to save this enquiry.'
    });
  }
}

/**
 * Select this function from the Apps Script Run menu to test the connection.
 * It writes one clearly labelled TEST row into the Leads sheet.
 */
function testLeadSubmission() {
  const testPayload = {
    name: 'Test',
    surname: 'Lead',
    number: '082 000 0000',
    email: 'test@example.com',
    ownsProperty: 'Yes',
    wantsToSell: 'No',
    wantsToBuy: 'Yes',
    needsInsurance: 'No',
    needsWill: 'No',
    communicationConsent: 'Yes',
    additionalInfo: 'TEST SUBMISSION — created from Apps Script.',
    source: DEFAULT_SOURCE
  };

  const output = doPost({
    postData: { contents: JSON.stringify(testPayload) }
  });

  Logger.log(output.getContent());
}

function getRequestData_(e) {
  // Netlify sends form-urlencoded data. JSON is also accepted for testing.
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

  throw new Error('No form data was received.');
}

function saveLead_(lead) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getOrCreateLeadSheet_();
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

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues(row);
    sheet.getRange(nextRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(nextRow, 2, 1, HEADERS.length - 1).setNumberFormat('@');
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateLeadSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
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
    source: cleanText_(data.source || DEFAULT_SOURCE, 220)
  };

  if (lead.name.length < 2) throw new Error('Please provide a valid name.');
  if (lead.surname.length < 2) throw new Error('Please provide a valid surname.');
  if (!/^[0-9+()\-\s]{7,30}$/.test(lead.number)) throw new Error('Please provide a valid contact number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error('Please provide a valid email address.');

  return lead;
}

function yesNo_(value, label) {
  const clean = String(value == null ? '' : value).trim().toLowerCase();

  // Accept standard browser values plus common equivalent values.
  if (['yes', 'y', 'true', '1'].indexOf(clean) > -1) return 'Yes';
  if (['no', 'n', 'false', '0'].indexOf(clean) > -1) return 'No';

  throw new Error(label + ' must be Yes or No.');
}

function cleanText_(value, maxLength) {
  const clean = String(value == null ? '' : value)
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);

  // Avoid formula injection when data is written into Google Sheets.
  return /^[=+\-@]/.test(clean) ? "'" + clean : clean;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
