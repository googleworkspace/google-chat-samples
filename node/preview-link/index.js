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

app.post('/', async (req, res) => {
  let event = req.body;
  if (event.type === 'MESSAGE') {
    return res.json(onMessage(event));
  } else if (event.type === 'CARD_CLICKED') {
    return res.json(onCardClick(event));
  }

  return res.json({});
});

/**
 * Responds to messages that have links whose URLs match URL patterns
 * configured for link previewing.
 *
 * @param {Object} event The event object from Chat.
 *
 * @return {Object} Response from the Chat app attached to the message with
 * the previewed link.
 */
function onMessage(event) {
  // If the Chat app does not detect a link preview URL pattern, reply
  // with a text message that says so.
  if (!event.message.matchedUrl) {
    return { text: 'No matchedUrl detected.' };
  }

  // [START preview_links_text]
  // Reply with a text message for URLs of the subdomain "text"
  if (event.message.matchedUrl.url.includes("text.example.com")) {
    return {
      text: 'event.message.matchedUrl.url: ' + event.message.matchedUrl.url
    };
  }
  // [END preview_links_text]

  // [START preview_links_card]
  // Attach a card to the message for URLs of the subdomain "support"
  if (event.message.matchedUrl.url.includes("support.example.com")) {
    // A hard-coded card is used in this example. In a real-life scenario,
    // the case information would be fetched and used to build the card.
    return {
      actionResponse: { type: 'UPDATE_USER_MESSAGE_CARDS' },
      cardsV2: [{
        cardId: 'attachCard',
        card: {
          header: {
            title: 'Example Customer Service Case',
            subtitle: 'Case basics',
          },
          sections: [{ widgets: [
            { decoratedText: { topLabel: 'Case ID', text: 'case123'}},
            { decoratedText: { topLabel: 'Assignee', text: 'Charlie'}},
            { decoratedText: { topLabel: 'Status', text: 'Open'}},
            { decoratedText: { topLabel: 'Subject', text: 'It won\'t turn on...' }},
            { buttonList: { buttons: [{
              text: 'OPEN CASE',
              onClick: { openLink: {
                url: 'https://support.example.com/orders/case123'
              }},
            }, {
              text: 'RESOLVE CASE',
              onClick: { openLink: {
                url: 'https://support.example.com/orders/case123?resolved=y',
              }},
            }, {
              text: 'ASSIGN TO ME',
              onClick: { action: { function: 'assign'}}
            }]}}
          ]}]
        }
      }]
    };
  }
  // [END preview_links_card]
}

// [START preview_links_assign]
/**
 * Updates a card that was attached to a message with a previewed link.
 *
 * @param {Object} event The event object from Chat.
 *
 * @return {Object} Response from the Chat app. Either a new card attached to
 * the message with the previewed link, or an update to an existing card.
 */
function onCardClick(event) {
  // To respond to the correct button, checks the button's actionMethodName.
  if (event.action.actionMethodName === 'assign') {
    // A hard-coded card is used in this example. In a real-life scenario,
    // an actual assign action would be performed before building the card.

    // Checks whether the message event originated from a human or a Chat app
    // and sets actionResponse.type to "UPDATE_USER_MESSAGE_CARDS if human or
    // "UPDATE_MESSAGE" if Chat app.
    const actionResponseType = event.message.sender.type === 'HUMAN' ?
      'UPDATE_USER_MESSAGE_CARDS' :
      'UPDATE_MESSAGE';

    // Returns the updated card that displays "You" for the assignee
    // and that disables the button.
    return {
      actionResponse: { type: actionResponseType },
      cardsV2: [{
        cardId: 'attachCard',
        card: {
          header: {
            title: 'Example Customer Service Case',
            subtitle: 'Case basics',
          },
          sections: [{ widgets: [
            { decoratedText: { topLabel: 'Case ID', text: 'case123'}},
            // The assignee is now "You"
            { decoratedText: { topLabel: 'Assignee', text: 'You'}},
            { decoratedText: { topLabel: 'Status', text: 'Open'}},
            { decoratedText: { topLabel: 'Subject', text: 'It won\'t turn on...' }},
            { buttonList: { buttons: [{
              text: 'OPEN CASE',
              onClick: { openLink: {
                url: 'https://support.example.com/orders/case123'
              }},
            }, {
              text: 'RESOLVE CASE',
              onClick: { openLink: {
                url: 'https://support.example.com/orders/case123?resolved=y',
              }},
            }, {
              text: 'ASSIGN TO ME',
              // The button is now disabled
              disabled: true,
              onClick: { action: { function: 'assign'}}
            }]}}
          ]}]
        }
      }]
    };
  }
}
// [END preview_links_assign]

app.listen(PORT, () => {
  console.log(`Server is running in port - ${PORT}`);
});
