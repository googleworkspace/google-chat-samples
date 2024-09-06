
/**
 * Copyright 2023 Google Inc.
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

/**
 * Responds to a MESSAGE interaction event in Google Chat.
 *
 * @param {Object} event the MESSAGE interaction event from Chat API.
 * @return {Object} message response that opens a dialog or sends private message with text and card.
 */
function onMessage(event) {

  // Checks for the presence of event.message.slashCommand.
  // If the slash command is "/about", responds with a text message and button that opens a dialog.
  // If the slash command is "/addContact", opens a dialog.
  if (event.message.slashCommand) {
    switch (event.message.slashCommand.commandId) {
      case 1: // /about
        return {
          "text": "Manage your contacts with the Rolodex app 📇. To add a contact, use the slash command `/addContact`.",
          "accessoryWidgets": [
              {
                "buttonList": {
                  "buttons": [
                    {
                      "text": "/addContact",
                      "onClick": {
                        "action": {
                          "function": "openDialog",
                          "interaction": "OPEN_DIALOG"
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
      case 2:  // /addContact
        return openDialog(event);
    }
  }

  // If user sends the Chat app a message without a slash command, the app responds
  // privately with a text and card to add a contact.
  else {
    return {
      "privateMessageViewer": event.user,
      "text": "To add a contact, try `/addContact` or complete the form below:",
      "cardsV2": [{
        "cardId": "addContactForm",
        "card": {
          "header": {"title": "Add a contact"},
          "sections":[{
            "widgets": contactFormWidgets.concat([{
                "buttonList": {
                    "buttons": [{
                      "text": "Review and submit",
                        "onClick": {
                          "action": {"function": "openNextCard",
            }}}]}}])}]
         }}]
    };
  }
}

/**
 * Responds to CARD_CLICKED interaction events in Google Chat.
 *
 * @param {Object} event the CARD_CLICKED interaction event from Google Chat
 */
function onCardClick(event) {

  if (event.common.invokedFunction === "openDialog") {
    return openDialog(event);
  }

  if (event.common.invokedFunction === "openNextCard") {
    const contactName = fetchFormValue(event, "contactName");
    const contactBirthdate = fetchFormValue(event, "contactBirthdate");
    const contactType = fetchFormValue(event, "contactType");
    const user = event.user;
    return openNextCard(user, contactName, contactBirthdate, contactType, event.isDialogEvent)
  }

  if (event.common.invokedFunction === "submitForm") {
    const user = event.user;
    const userInputs = event.common.parameters;
    const dialogEventType = event.dialogEventType;
    return submitForm(user, userInputs, dialogEventType);
  }
}

/**
 * Extracts form input value for a given widget
 * 
 * @param {Object} event the CARD_CLICKED interaction event from Google Chat
 * @param {String} widgetName a unique ID for the widget, specified in the widget's name field
 * @returns the value inputted by the user.
 */

function fetchFormValue(event, widgetName) {
  console.log('Fetching the following form values from widget ' + JSON.stringify(widgetName) +':\n ' + JSON.stringify(event.common.formInputs))

  let formItem = event.common.formInputs[widgetName][""];

  // For widgets that receive StringInputs data, the value input by the user.
  if (formItem.hasOwnProperty("stringInputs")){
    var stringInput = event.common.formInputs[widgetName][""].stringInputs.value[0];
    console.log(`Found string input, returning: ${stringInput}`)
    if (stringInput != null) {
      return stringInput
     }

    }

    // For widgets that receive dateInput data, the value input by the user.
    else if (formItem.hasOwnProperty("dateInput")) {
    var dateInput = event.common.formInputs[widgetName][""].dateInput.msSinceEpoch;
    console.log(`Found date input, returning: ${dateInput}`)
     if (dateInput != null) {
      return dateInput
     }

    }

    // If no input types match, returns null
    else {
     console.log('No stringInputs or dateInput found.')
     
    return null;}
    }

/**
* Opens a dialog that prompts users to add details about a contact.
*
*
* @return {Object} open a dialog.
*/
function openDialog(event) {
  return {
    "actionResponse": {
      "type": "DIALOG",
      "dialogAction": {
        "dialog": {
          "body": {
            "sections": [
              {
                "header": "Add new contact",
                "widgets": contactFormWidgets.concat([{
                  "buttonList": {
                    "buttons": [{
                      "text": "Review and submit",
                        "onClick": {
                          "action": {
                            "function": "openNextCard"
                            }
                          }
                        }
                      ]
                    }
                  }
                ])
              }
            ]
          }
        }
      }
    }
  };
}

/**
* Returns another dialog or card message that displays a confirmation of
* contact details before users submit.
*
* @param {String} the user who submitted the information.
* @param {String} contactName the contact name from the previous dialog or card.
* @param {String} contactBirthdate the birthdate from the previous dialog or card.
* @param {String} contactType the contact type from the previous dialog or card.
* @param {boolean} whether the information was submitted from a dialog.
*
* @return {Object} returns a dialog or private card message.
*/
function openNextCard(user, contactName, contactBirthdate, contactType, fromDialog) {
  const name = contactName ?? "<i>Not provided</i>";
  const birthdate = contactBirthdate ?? "<i>Not provided</i>";
  const type = contactType ?? "<i>Not provided</i>";
  const cardConfirmation =
              {
                "header": "Your contact",
                "widgets": [
                  {"textParagraph": {"text": "Confirm contact information and submit:"}},
                  {"textParagraph": {"text": "<b>Name:</b> " + name}},
                  {"textParagraph": {"text": "<b>Birthday:</b> " + convertMillisToDateString(birthdate)}},
                  {"textParagraph": {"text": "<b>Type:</b> " + type}},
                  {"buttonList": {
                      "buttons": [
                        {"text": "Submit",
                          "onClick": {
                            "action": {
                              "function": "submitForm",
                               "parameters": [
                                 {"key": "contactName",
                                  "value": name
                                 },
                                 {"key": "contactBirthdate",
                                  "value": birthdate
                                 },
                                 {"key": "contactType",
                                  "value": type
                    }]}}}]}}]};
  // Returns another dialog with contact information that the user input.
  if (fromDialog) {
    return {
    "action_response": {
      "type": "DIALOG",
      "dialog_action": {
        "dialog": {
          "body": {
            "sections": [ cardConfirmation ]
          }
        }
      }
    }
  };
  }
  // Updates existing card message with contact information that the user input.
  else return{
      "actionResponse": {
      "type": "UPDATE_MESSAGE",
      },
    "privateMessageViewer": user,
    "cardsV2": [{
      "card": {"sections": [cardConfirmation]}
      }]
  }
  
}

/**
* Submits information from a dialog or card message.
*
* @param {Object} user the person who submitted the information.
* @param {Object} userInputs the form input values specified in event object parameters
* @param {boolean} whether information was submitted from a dialog
*
* @return {Object} 
*/
function submitForm(user, userInputs, dialogEventType) {
  console.log('Submitting form inputs: ' + JSON.stringify(userInputs));
  const contactName = userInputs["contactName"]
  
  // Checks to make sure the user entered a contact
  // name. If no name value detected, returns
  // an error message.
  
  if (!contactName) {
    const errorMessage = "Don't forget to name your new contact!"
    if (dialogEventType == "SUBMIT_DIALOG") {
      return {
        "actionResponse": {
          "type": "DIALOG",
          "dialogAction": {
            "actionStatus": {
              "statusCode": "INVALID_ARGUMENT",
              "userFacingMessage": errorMessage
            }
          }
        }
      };
    } else {
      return {
        "privateMessageViewer": user,
        "text": errorMessage 
      }

    }

    // Otherwise the Chat app indicates that it received
    // form data from the dialog or card. Sends private
    // text message that confirms submission.
  } else {
    const confirmationMessage = "✅ " + contactName + " has been added to your contacts."
    if (dialogEventType == "SUBMIT_DIALOG") {
      return {
        "actionResponse": {
          "type": "NEW_MESSAGE",
          "dialogAction": {
            "actionStatus": {
              "statusCode": "OK",
              "userFacingMessage": "Success " + JSON.stringify(contactName)
            }
          }
        },
        "privateMessageViewer": user,
        "text": confirmationMessage
      }} else {
        return {
        "actionResponse": {
          "type": "NEW_MESSAGE"},
        "privateMessageViewer": user,
        "text": confirmationMessage
    }}
  }
}

/**
  * Converts date in milliseconds since epoch to user-friendly string.
  *
  * @param {Object} millis the milliseconds since epoch time.
  * @return {string} Display-friend date (English US)
  */
function convertMillisToDateString(millis) {
  const date = new Date(millis);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options); 
}