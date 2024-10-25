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
 * Responds to a MESSAGE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 * @return {Object} Response from the Chat app.
 */
function onMessage(event) {
  return { cardsV2: [{
    cardId: "contactSelector",
    card: { sections:[{ widgets: [{
      // [START selection_input]
      selectionInput: {
        name: "contacts",
        type: "MULTI_SELECT",
        label: "Selected contacts",
        multiSelectMaxSelectedItems: 3,
        multiSelectMinQueryLength: 1,
        externalDataSource: { function: "getContacts" },
        // Suggested items loaded by default.
        // The list is static here but it could be dynamic.
        items: [getContact("3")]
      }
      // [END selection_input]
    }]}]}
  }]};
}

// [START process_query]
/**
 * Responds to a WIDGET_UPDATE event in Google Chat.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app.
 */
function onWidgetUpdate(event) {
  if (event.common["invokedFunction"] === "getContacts") {
    const query = event.common.parameters["autocomplete_widget_query"];
    return { actionResponse: {
      type: "UPDATE_WIDGET",
      updatedWidget: { suggestions: { items: [
        // The list is static here but it could be dynamic.
        getContact("1"), getContact("2"), getContact("3"), getContact("4"), getContact("5")
      // Only return items based on the query from the user
      ].filter(e => !query || e.text.includes(query))}}
    }};
  }
}

/**
 * Generate a suggested contact given an ID.
 *
 * @param {String} id The ID of the contact to return.
 * @return {Object} The contact formatted as a suggested item for selectors.
 */
function getContact(id) {
  return {
    value: id,
    startIconUri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
    text: "Contact " + id
  };
}
// [END process_query]
