/**
 * Copyright 2024 Google LLC
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

// [START chat_app_home]
/**
 * Responds to a APP_HOME event in Google Chat.
 */
function onAppHome() {
  return { action: { navigations: [{
    pushCard: getHomeCard()
  }]}};
}

/**
 * Returns the app home card.
 */
function getHomeCard() {
  return { sections: [{ widgets: [
    { textParagraph: {
      text: "Here is the app home 🏠 It's " + new Date().toTimeString()
    }},
    { buttonList: { buttons: [{
      text: "Update app home",
      onClick: { action: {
        function: "updateAppHome"
      }}
    }]}}
  ]}]};
}
// [END chat_app_home]

// [START chat_app_home_update]
/**
 * Updates the home app.
 */
function updateAppHome() {
  return { renderActions: { action: { navigations: [{
    updateCard: getHomeCard()
  }]}}};
}
// [END chat_app_home_update]
