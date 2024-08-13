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

const express = require('express');
const PORT = process.env.PORT || 8080;

const app = express()
  .use(express.urlencoded({extended: false}))
  .use(express.json());

// [START chat_app_home]
app.post('/', async (req, res) => {
  let event = req.body.chat;

  let body = {};
  if (event.type === 'APP_HOME') {
    // App home is requested
    body = { action: { navigations: [{
      pushCard: getHomeCard()
    }]}}
  } else if (event.type === 'SUBMIT_FORM') {
    // The update button from app home is clicked
    commonEvent = req.body.commonEventObject;
    if (commonEvent && commonEvent.invokedFunction === 'updateAppHome') {
      body = updateAppHome()
    }
  }

  return res.json(body);
});

// Create the app home card
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
// Update the app home
function updateAppHome() {
  return { renderActions: { action: { navigations: [{
    updateCard: getHomeCard()
  }]}}}
};
// [END chat_app_home_update]

app.listen(PORT, () => {
  console.log(`Server is running in port - ${PORT}`);
});
