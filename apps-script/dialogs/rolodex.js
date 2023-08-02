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
* Responds to a MESSAGE event in Google Chat with a card with a button
* that opens a dialog.
*
* @param {Object} event the event object from Chat API.
*
* @return {object} open a Dialog in response to a card's button click.
*/
function onMessage(event) {
  return {
    cardsV2: [{
      cardId: "addContact",
      card: {
        header: {
          title: "Rolodex",
          subtitle: "Manage your contacts!",
          imageUrl: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
          imageType: "CIRCLE"
        },
        sections: [
          {
            widgets: [
              {
                buttonList: {
                  buttons: [
                    {
                      text: "Add Contact",
                      onClick: {
                        action: {
                          function: "openDialog",
                          interaction: "OPEN_DIALOG"
                        }
                      }
                    }
                  ]
                },
                horizontalAlignment: "CENTER"
              }
            ]
          }
        ]
      }
    }]
  };
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
}

/**
* Opens a dialog in Google Chat.
*
* @param {Object} event the event object from Chat API.
*
* @return {object} open a Dialog in Google Chat.
*/
function openDialog(event) {
  return {
    action_response: {
      type: "DIALOG",
      dialog_action: {
        dialog: {
          body: {
            sections: [
              {
                header: "Add new contact",
                widgets: [
                  {
                    textInput: {
                      label: "Name",
                      type: "SINGLE_LINE",
                      name: "contactName"
                    }
                  },
                  {
                    textInput: {
                      label: "Address",
                      type: "MULTIPLE_LINE",
                      name: "address"
                    }
                  },
                  {
                    decoratedText: {
                      text: "Add to favorites",
                      switchControl: {
                        controlType: "SWITCH",
                        name: "saveFavorite"
                      }
                    }
                  },
                  {
                    decoratedText: {
                      text: "Merge with existing contacts",
                      switchControl: {
                        controlType: "SWITCH",
                        name: "mergeContact",
                        selected: true
                      }
                    }
                  },
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: "Next",
                          onClick: {
                            action: {
                              function: "openSequentialDialog"
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

// [END google_chat_dialog]
