/**
 * Copyright 2024 Google Inc.
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

// [START input_widgets]
/**
 * The section of the contact card that contains the form input widgets. Used in a dialog and card message.
 * To add and preview widgets, use the Card Builder: https://addons.gsuite.google.com/uikit/builder
 */
const CONTACT_FORM_WIDGETS = [
  {
    "textInput": {
      "name": "contactName",
      "label": "First and last name",
      "type": "SINGLE_LINE"
    }
  },
  {
    "dateTimePicker": {
      "name": "contactBirthdate",
      "label": "Birthdate",
      "type": "DATE_ONLY"
    }
  },
  {
    "selectionInput": {
      "name": "contactType",
      "label": "Contact type",
      "type": "RADIO_BUTTON",
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
  }
];
// [END input_widgets]
