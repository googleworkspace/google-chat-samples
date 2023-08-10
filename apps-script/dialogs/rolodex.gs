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
// [START google_chat_dialog]

/**
* Responds to a MESSAGE event in Google Chat.
*
* @param {Object} event the event object from Chat API.
*
* @return {Object} open a Dialog in response to a slash command
* or a card"s button click.
*/
function onMessage(event) {

  // Checks for the presence of event.message.slashCommand.
  // If the slash command is "/help", responds with a text message.
  // If the slash command is "/createContact", opens a dialog.
  if (event.message.slashCommand) {
    switch (event.message.slashCommand.commandId) {
      case 1: // /help
        return {"text": "Contact bot helps you update your address book!"}
      case 2:  // /createContact
        return openDialog(event);
    }
  }

  // If the Chat app doesn"t detect a slash command, it responds
  // with a card that prompts the user to add a contact
  else {
    return {
      "cardsV2": [{
        "cardId": "addContact",
        "card": {
          "header": {
            "title": "Rolodex",
            "subtitle": "Manage your contacts!",
            "imageUrl": "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
            "imageType": "CIRCLE"
          },
          "sections": [
            {
              "widgets": [
                {
                  "buttonList": {
                    "buttons": [
                      {
                        "text": "Add Contact",
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
          ]
        }
      }]

    };
  }
}

/**
* Responds to a CARD_CLICKED event in Google Chat.
*
* @param {Object} event the event object from Google Chat
*/
function onCardClick(event) {

  if (event.common.invokedFunction === "openDialog") {
    return openDialog(event);
  }

  if (event.common.invokedFunction === "openSequentialDialog") {
    const contactName = fetchFormValue(event, "contactName");
    const address = fetchFormValue(event, "address");
    return openSequentialDialog(contactName, address);
  }

  if (event.common.invokedFunction === "receiveDialog") {
    const parameters = event.common.parameters;
    parameters["contactType"] = fetchFormValue(event, "contactType");
    parameters["notes"] = fetchFormValue(event, "notes");
    return receiveDialog(parameters);
  }
}

/**
 * Extracts form input value for a given widget
 * 
 * @param {Object} event the event object from Google Chat
 * @param {String} widgetName the widget name
 * @returns the form input value for the widget
 */
function fetchFormValue(event, widgetName) {
  const widget = event.common.formInputs[widgetName];
  if (widget) {
    return widget[""]["stringInputs"]["value"][0];
  }
}

/**
* Opens and starts a dialog that lets users add details about a contact.
*
*
* @return {Object} open a dialog.
*/
function openDialog(event) {
  return {
    "action_response": {
      "type": "DIALOG",
      "dialog_action": {
        "dialog": {
          "body": {
            "sections": [
              {
                "header": "Add new contact",
                "widgets": [
                  {
                    "textInput": {
                      "label": "Name",
                      "type": "SINGLE_LINE",
                      "name": "contactName"
                    }
                  },
                  {
                    "textInput": {
                      "label": "Address",
                      "type": "MULTIPLE_LINE",
                      "name": "address"
                    }
                  },
                  {
                    "decoratedText": {
                      "text": "Add to favorites",
                      "switchControl": {
                        "controlType": "SWITCH",
                        "name": "saveFavorite"
                      }
                    }
                  },
                  {
                    "decoratedText": {
                      "text": "Merge with existing contacts",
                      "switchControl": {
                        "controlType": "SWITCH",
                        "name": "mergeContact",
                        "selected": true
                      }
                    }
                  },
                  {
                    "buttonList": {
                      "buttons": [
                        {
                          "text": "Next",
                          "onClick": {
                            "action": {
                              "function": "openSequentialDialog"
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
  };
}

/**
* Opens a second dialog that lets users add more contact details.
*
* @param {String} contactName the contact name from the previous dialog.
* @param {String} address the address from the previous dialog.
*
* @return {Object} open a dialog.
*/
function openSequentialDialog(contactName, address) {
  return {
    "action_response": {
      "type": "DIALOG",
      "dialog_action": {
        "dialog": {
          "body": {
            "sections": [
              {
                "header": "Add new contact",
                "widgets": [
                  {
                    "textInput": {
                      "label": "Notes",
                      "type": "MULTIPLE_LINE",
                      "name": "notes"
                    }
                  },
                  {
                    "selectionInput": {
                      "type": "RADIO_BUTTON",
                      "label": "Contact type",
                      "name": "contactType",
                      "items": [
                        {
                          "text": "Work",
                          "value": "Work",
                          "selected": false
                        },
                        {
                          "text": "Personal",
                          "value": "Personal",
                          "selected": false
                        }
                      ]
                    }
                  },
                  {
                    "buttonList": {
                      "buttons": [
                        {
                          "text": "Submit",
                          "onClick": {
                            "action": {
                              "function": "receiveDialog",
                              "parameters": [
                                {
                                  "key": "contactName",
                                  "value": contactName
                                },
                                {
                                  "key": "address",
                                  "value": address
                                }
                              ]
                            }
                          }
                        }
                      ]
                    },
                    "horizontalAlignment": "END"
                  }
                ]
              }
            ]
          }
        }
      }
    }
  };
}

/**
* Checks for a form input error, the absence of
* a "name" value, and returns an error if absent.
* Otherwise, confirms successful receipt of a dialog.
*
* Confirms successful receipt of a dialog.
*
* @param {Object} parameters the form input values.
*
* @return {Object} open a Dialog in Google Chat.
*/
function receiveDialog(parameters) {

  // Checks to make sure the user entered a name
  // in a dialog. If no name value detected, returns
  // an error message.
  if (!parameters.contactName) {
    return {
      "actionResponse": {
        "type": "DIALOG",
        "dialogAction": {
          "actionStatus": {
            "statusCode": "INVALID_ARGUMENT",
            "userFacingMessage": "Don't forget to name your new contact!"
          }
        }
      }
    };

    // Otherwise the Chat app indicates that it received
    // form data from the dialog. Any value other than "OK"
    // gets returned as an error. "OK" is interpreted as
    // code 200, and the dialog closes.
  } else {
    return {
      "actionResponse": {
        "type": "DIALOG",
        "dialogAction": {
          "actionStatus": {
            "statusCode": "OK",
            "userFacingMessage": "Success " + JSON.stringify(parameters)
          }
        }
      }
    };
  }
}

// [END google_chat_dialog]
