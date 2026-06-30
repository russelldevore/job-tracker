// Paste this into your Apps Script (JobTracker project)
// Supports both Apply List and Demo Data tabs via ?tab= parameter

function doGet(e) {
  const tabName = (e && e.parameter && e.parameter.tab) ? e.parameter.tab : 'Apply List';
  const sheet = SpreadsheetApp.openById('1fentkWlXGLcM1W3gujev08rRxFDZzRNkPhEnXswLzv4')
    .getSheetByName(tabName);

  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Tab not found: ' + tabName }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
