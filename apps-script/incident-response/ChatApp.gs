/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START chat_incident_response_app]

/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * This app only responds to a slash command with the ID 1 ("/closeIncident").
 * It will respond to any other message with a simple "Hello" text message.
 *
 * @param {Object} event the event object from Google Chat
 */
function onMessage(event) {
  if (event.message.slashCommand) {
    return processSlashCommand_(event);
  }
  return { "text": "Hello from Incident Response app!" };
}

/**
 * Responds to a CARD_CLICKED event in Google Chat.
 *
 * This app only responds to one kind of dialog (Close Incident).
 *
 * @param {Object} event the event object from Google Chat
 */
function onCardClick(event) {
  if (event.isDialogEvent) {
    if (event.dialogEventType == 'SUBMIT_DIALOG') {
      return processSubmitDialog_(event);
    }
    return {
      actionResponse: {
        type: "DIALOG",
        dialogAction: {
          actionStatus: "OK"
        }
      }
    };
  }
}

/**
 * Responds to a MESSAGE event with a Slash command in Google Chat.
 *
 * This app only responds to a slash command with the ID 1 ("/closeIncident")
 * by returning a Dialog.
 *
 * @param {Object} event the event object from Google Chat
 */
function processSlashCommand_(event) {
  if (event.message.slashCommand.commandId != CLOSE_INCIDENT_COMMAND_ID) {
    return {
      "text": "Command not recognized. Use the command `/closeIncident` to close the incident managed by this space."
    };
  }
  const sections = [
    {
      header: "Close Incident",
      widgets: [
        {
          textInput: {
            label: "Please describe the incident resolution",
            type: "MULTIPLE_LINE",
            name: "description"
          }
        },
        {
          buttonList: {
            buttons: [
              {
                text: "Close Incident",
                onClick: {
                  action: {
                    function: "closeIncident"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  ];
  return {
    actionResponse: {
      type: "DIALOG",
      dialogAction: {
        dialog: {
          body: {
            sections,
          }
        }
      }
    }
  };
}

/**
 * Responds to a CARD_CLICKED event with a Dialog submission in Google Chat.
 *
 * This app only responds to one kind of dialog (Close Incident).
 * It creates a Doc with a summary of the incident information and posts a message
 * to the space with a link to the Doc.
 *
 * @param {Object} event the event object from Google Chat
 */
function processSubmitDialog_(event) {
  const resolution = event.common.formInputs.description[""].stringInputs.value[0];
  const chatHistory = concatenateAllSpaceMessages_(event.space.name);
  const chatSummary = summarizeChatHistory_(chatHistory);
  const docUrl = createDoc_(event.space.displayName, resolution, chatHistory, chatSummary);
  return {
    actionResponse: {
      type: "NEW_MESSAGE",
    },
    text: `Incident closed with the following resolution: ${resolution}\n\nHere is the automatically generated post-mortem:\n${docUrl}`
  };
}

/**
 * Lists all the messages in the Chat space, then concatenate all of them into
 * a single text containing the full Chat history.
 *
 * For simplicity for this demo, it only fetches the first 100 messages.
 *
 * Messages with slash commands are filtered out, so the returned history will
 * contain only the conversations between users and not app command invocations.
 *
 * @return {string} a text containing all the messages in the space in the format:
 *          Sender's name: Message
 */
function concatenateAllSpaceMessages_(spaceName) {
  // Call Chat API method spaces.messages.list
  const response = Chat.Spaces.Messages.list(spaceName, { 'pageSize': 100 });
  const messages = response.messages;
  // Fetch the display names of the message senders and returns a text
  // concatenating all the messages.
  let userMap = new Map();
  return messages
    .filter(message => message.slashCommand === undefined)
    .map(message => `${getUserDisplayName_(userMap, message.sender.name)}: ${message.text}`)
    .join('\n');
}

/**
 * Obtains the display name of a user by using the Admin Directory API.
 *
 * The fetched display name is cached in the provided map, so we only call the API
 * once per user.
 *
 * If the user does not have a display name, then the full name is used.
 *
 * @param {Map} userMap a map containing the display names previously fetched
 * @param {string} userName the resource name of the user
 * @return {string} the user's display name
 */
function getUserDisplayName_(userMap, userName) {
  if (userMap.has(userName)) {
    return userMap.get(userName);
  }
  let displayName = 'Unknown User';
  try {
    const user = AdminDirectory.Users.get(
      userName.replace("users/", ""),
      { projection: 'BASIC', viewType: 'domain_public' });
    displayName = user.name.displayName ? user.name.displayName : user.name.fullName;
  } catch (e) {
    // Ignore error if the API call fails (for example, because it's an
    // out-of-domain user or Chat app)) and just use 'Unknown User'.
  }
  userMap.set(userName, displayName);
  return displayName;
}

// [END chat_incident_response_app]
