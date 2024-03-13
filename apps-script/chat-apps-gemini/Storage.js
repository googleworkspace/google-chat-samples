// This script contains the storage-specific utilities functions.

/**
 * Contains the issues.
 */
const appProperties = PropertiesService.getScriptProperties();

/**
 * Saves a new issue.
 * 
 * @param {string} title the title of the issue
 * @param {string} description the description of the issue
 * @param {string} spaceId the ID of dedicated space of the issue
 * @param {string} subscriptionId the ID of subscription associated to the issue space
 * @return {object} the newly stored issue
 */
function saveCreatedIssue(title, description, spaceId, subscriptionId) {
  appProperties.setProperty(spaceId, JSON.stringify({
    title: title,
    description: description,
    spaceId: spaceId.replace("spaces/", ""),
    subscriptionId: subscriptionId,
    status: "OPENED",
    resolution : "",
    reportUrl: "",
    disabledInclusivityHelp: []
  }));

  return JSON.parse(appProperties.getProperty(spaceId));
}

/**
 * Closes an existing issue.
 * 
 * @param {string} spaceId the ID of dedicated space of the issue
 * @param {string} resolution the resolution of the issue
 * @param {string} reportUrl the report URL of the issue
 * @return {object} the newly closed issue
 */
function saveClosedIssue(spaceId, resolution, reportUrl) {
  var issue = JSON.parse(appProperties.getProperty(spaceId));
  issue.status = "CLOSED",
  issue.resolution = resolution ? resolution : "Unknown";
  issue.reportUrl = reportUrl;
  appProperties.setProperty(spaceId, JSON.stringify(issue));

  return issue;
}

/**
 * Disables inclusivity help in a space for a user.
 * 
 * @param {string} spaceId the ID of dedicated space of the issue
 * @param {string} userId the ID of user
 */
function disableInclusivityHelp(spaceId, userId) {
  var issue = JSON.parse(appProperties.getProperty(spaceId));
  issue.disabledInclusivityHelp.push(userId);
  appProperties.setProperty(spaceId, JSON.stringify(issue));
}

/**
 * Checks whether the app should help with inclusivity in a given space for the user.
 * 
 * Inclusivity help is enabled by default.
 * 
 * @param {string} spaceId the ID of dedicated space of the issue
 * @param {string} userId the ID of user
 * @returns whether the app should help with inclusivity
 */
function shouldHelpWithInclusivity(spaceId, userId) {
  return JSON.parse(appProperties.getProperty(spaceId))
    .disabledInclusivityHelp.indexOf(userId) < 0;
}
