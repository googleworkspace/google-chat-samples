// This script contains the Google Docs-specific utilities functions.

/**
 * Creates an issue report as a Google Doc in the user's Google Drive.
 *
 * @param {string} title the title of the issue
 * @param {string} history the history of the issue
 * @param {string} summary the summary of the issue
 * @return {string} the URL of the created report
 */
function createReport(title, history, summary) {
  let doc = DocumentApp.create(title);
  let body = doc.getBody();
  body.appendParagraph(`Issue Report: ${title}`).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph("Summary").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(summary);
  body.appendParagraph("History").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(history);
  return doc.getUrl();
}
