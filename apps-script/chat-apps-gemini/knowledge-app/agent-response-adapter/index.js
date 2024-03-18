/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const functions = require('@google-cloud/functions-framework');

/** 
 * Handles all incoming requests.
 */
functions.http('agent-response-adapter', (request, response) => {
  // Creates Google Chat buttons based on the data store agent response grounding details.
  var linkTitles = [];
  var linkButtons = [];
  const grounding = request.body.messages[1].payload.richContent[0][0];
  if (grounding.type === "match_citations") {
    // Supports citation match type.
    grounding.citations.forEach((citation) => {
      // Avoid duplications.
      if (linkTitles.indexOf(citation.title) < 0) {
        linkButtons.push({
          text: citation.title,
          onClick: { openLink: {
            url: citation.actionLink
          }}
        });
        linkTitles.push(citation.title);
      }
    });
  } else if (grounding.type === "info") {
    // Supports info type.
    if (linkTitles.indexOf(grounding.title) < 0) {
      linkButtons.push({
        text: grounding.title,
        onClick: { openLink: {
          url: grounding.actionLink
        }}
      });
      linkTitles.push(grounding.title);
    }
  }

  // Sends the Dialogflow CX fulfillment response to replace the agent response with the Chat
  // message with text and source buttons.
  response.send({ fulfillment_response: {
    merge_behavior: "REPLACE",
    messages: [{ payload: {
      // Reuses the original data store agent response text.
      text: request.body.messages[0].text.text[0],
      cardsV2: [{
        cardId: "sourcesCard",
        card: { sections: [{
          header: "Sources",
          widgets: [{ buttonList: {
            buttons: linkButtons
          }}]
        }]}
      }]
    }}]
  }});
});
