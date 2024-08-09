/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This script contains the Google Chat-specific callback and utilities functions.

/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * Handles slash commands.
 *
 * @param {Object} event the event object from Google Chat
 */
function onMessage(event) {
  if (event.message.slashCommand) {
    return processSlashCommand(event);
  }

  return { text: "Available slash commands to manage issues are '/create' and '/close'." };
}

/**
 * Responds to a CARD_CLICKED event in Google Chat.
 *
 * Handles action funtions.
 *
 * @param {Object} event the event object from Google Chat
 */
function onCardClick(event) {
  // Issue creation dialog form submission
  if (event.action.actionMethodName === "createIssue") {
    return createIssue(event);
  }
}

/**
 * Responds to a MESSAGE event with a slash command in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function processSlashCommand(event) {
  if (event.message.slashCommand.commandId == CREATE_COMMAND_ID) {
    // Opens the issue creation dialog.
    return { actionResponse: {
      type: "DIALOG",
      dialogAction: { dialog: { body: { sections: [{
        header: "Create",
        widgets: [{ textInput: {
            label: "Title",
            name: "title"
          }}, { textInput: {
              label: "Description",
              type: "MULTIPLE_LINE",
              name: "description"
          }}, { buttonList: { buttons: [{
            text: "Create",
            onClick: { action: {
              function: "createIssue"
            }}
          }]}
        }]
      }]}}}
    }};
  }

  if (event.message.slashCommand.commandId == CLOSE_COMMAND_ID && event.message.space.type !== "DM") {
    // Closes the issue associated to the space.
    const spaceId = event.message.space.name;
    const resolution = event.message.argumentText;
    const issue = JSON.parse(appProperties.getProperty(spaceId));
    const history = exportSpaceHistory(spaceId);
    const summary = summarizeSpace(history);
    const docUrl = createReport(issue.title, issue.description, resolution, history, summary);
    saveClosedIssue(spaceId, resolution, docUrl);

    return {
      actionResponse: { type: "NEW_MESSAGE" },
      text: `The issue is closed and its report generated:\n${docUrl}`
    };
  }

  return { text: "The command isn't supported." };
}

/**
 * Fetches and concatenates the 100 first space messages by using the Google Chat API.
 *
 * Messages with slash commands are filtered (app command invocations).
 *
 * @return {string} concatenate space messages in the format "Sender's name: Message"
 */
function exportSpaceHistory(spaceName) {
  const messages = Chat.Spaces.Messages.list(spaceName, { 'pageSize': 100 }).messages;
  // Returns results after fetching message sender display names.
  let users = new Map();
  return messages
    .filter(message => message.slashCommand === undefined)
    .map(message => `${getUserDisplayName(users, message.sender.name)}: ${message.text}`)
    .join('\n');
}

/**
 * Fetches a user's display name by using the Admin Directory API.
 *
 * A cache is used to only call the API once per user.
 *
 * @param {Map} cache the map containing users previously fetched
 * @param {string} userId the user ID to fetch
 * @return {string} the user's display name
 */
function getUserDisplayName(cache, userId) {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  let displayName = 'Unknown User';
  try {
    const user = AdminDirectory.Users.get(
      userId.replace("users/", ""),
      { projection: 'BASIC', viewType: 'domain_public' });
    displayName = user.name.displayName ? user.name.displayName : user.name.fullName;
  } catch (e) {
    // Ignores errors, uses 'Unknown User' by default.
  }
  cache.set(userId, displayName);
  return displayName;
}

/**
 * Handles create issue dialog form submissions in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function createIssue(event) {
  // Retrieves the form inputs.
  const title = event.common.formInputs.title[""].stringInputs.value[0];
  const description = event.common.formInputs.description[""].stringInputs.value[0];
  const spaceUrl = createIssueSpace(title, description);
  const createdIssue = saveCreatedIssue(title, description, spaceUrl);

  return {
    actionResponse: { type: "NEW_MESSAGE" },
    text: `The issue and its dedicated space were created:\n`
      + `https://mail.google.com/mail/u/0/#chat/space/${createdIssue.spaceId}`
  };
}

/**
 * Initializes a Google Chat space dedicated to a new issue.
 * 
 * The app adds itself and sends a first message to the newly created space.
 *
 * @param {string} title the title of the issue
 * @param {string} description the description of the isue
 * @return {string} the ID of the new space
 */
function createIssueSpace(title, description) {
  // Creates the space.
  const spaceId = Chat.Spaces.setup({
    space: {
      displayName: title,
      spaceType: "SPACE"
    }
  }).name;

  // Adds itself to the space.
  Chat.Spaces.Members.create({
    member: {
      name: "users/app",
      type: "BOT"
    }
  }, spaceId);
  
  // Sends a first message to the space
  createAppMessageUsingChatService({ text: description}, spaceId);
  return spaceId;
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onRemoveFromSpace(event) {}

/**
 * Responds to a ADDED_TO_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onAddToSpace(event) {}
