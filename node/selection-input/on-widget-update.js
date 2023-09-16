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
// [START google_chat_multiselect_menu]

/**
 * Widget update event handler.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app.
 */
function onWidgetUpdate(event) {
  const actionName = event.common["invokedFunction"];
  if (actionName !== "getContacts") {
    return {};
  }

  return {
    actionResponse: {
      type: "UPDATE_WIDGET",
      updatedWidget: {
        suggestions: {
          items: [
            {
              value: "contact-1",
              startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 1",
              bottomText: "Contact one description",
              selected: false
            },
            {
              value: "contact-2",
              startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 2",
              bottomText: "Contact two description",
              selected: false
            },
            {
              value: "contact-3",
              startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 3",
              bottomText: "Contact three description",
              selected: false
            },
            {
              value: "contact-4",
              startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 4",
              bottomText: "Contact four description",
              selected: false
            },
            {
              value: "contact-5",
              startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 5",
              bottomText: "Contact five description",
              selected: false
            },
          ]
        }
      }
    }
  };
}

// [END google_chat_multiselect_menu]
