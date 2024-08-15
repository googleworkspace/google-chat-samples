/**
 * Copyright 2024 Google Inc.
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.chat.app.vote;

import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Action;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ActionParameter;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Button;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Card;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1CardHeader;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Image;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OnClick;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextParagraph;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;

@SpringBootApplication
@RestController
public class App {

  private static final Logger logger = Logger.getLogger(App.class.getName());

  static String[] IMAGES = new String[]{
    "https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif",
    "https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif",
    "https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif",
    "https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif",
  };

  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  /**
   * Handle requests from Google Chat
   *
   * - Create new vote for ADDED_TO_SPACE and MESSAGE events
   * - Update existing card for 'upvote' clicks
   * - Create new vote for 'newvote' clicks
   * - Display a different image after each event
   *
   * @param event Event from chat.
   * @return GenericJson
   * @throws Exception
   */
  @PostMapping("/")
  @ResponseBody
  public GenericJson onEvent(@RequestBody JsonNode event) throws Exception {
    GenericJson response = new GenericJson();
    switch (event.get("type").asText()) {
      case "ADDED_TO_SPACE":
        // Create new vote session for when added to a space
        response = createMessage(UUID.randomUUID().toString(), "I like building Google Chat apps", "nobody", 0, false);
        break;
      case "MESSAGE":
        // Create new vote session for any direct/mention message
        response = createMessage(UUID.randomUUID().toString(), event.at("/message/argumentText").asText(), "nobody", 0, false);
        break;
      case "CARD_CLICKED":
        switch(event.at("/action/actionMethodName").asText()) {
          //   String displayName = ;
          // String message = event.at("/message/text").asText();
          case "newvote":
            // Create new vote when "NEW" button clicked
            response = createMessage(UUID.randomUUID().toString(), "I like voting", "nobody", 0, false);
            break;
          case "upvote":
            // Update vote when upvote button pressed
            JsonNode parameters = event.at("/action/parameters");
            String voteId = parameters.get(0).get("value").asText();
            String statement = parameters.get(1).get("value").asText();
            int count = Integer.parseInt(parameters.get(2).get("value").asText());
            response = createMessage(voteId, statement, event.at("/user/displayName").asText(), count + 1, true);
            break;
        }
        break;
    }

    logger.severe("Response: " + response.toPrettyString());
    return response;
  }

  /**
   * Creates the card message
   * 
   * @param voteId required, unique ID of the vote
   * @param statement required, the statement users can vote for
   * @param voter the user who voted (where appropriate)
   * @param count the current vote count
   * @param update whether it's an update or a new vote session
   * @return the vote card
   */
  private GenericJson createMessage(String voteId, String statement, String voter, int count, boolean update) {
    GoogleAppsCardV1CardHeader cardHeader = new GoogleAppsCardV1CardHeader();
    cardHeader.setTitle(String.format("Vote: %s", statement));

    GoogleAppsCardV1TextParagraph textParagraph = new GoogleAppsCardV1TextParagraph();
    textParagraph.setText(String.format("%d votes, last vote was by %s!", count, voter));

    GoogleAppsCardV1Widget textParagraphWidget = new GoogleAppsCardV1Widget();
    textParagraphWidget.setTextParagraph(textParagraph);

    GoogleAppsCardV1Image image = new GoogleAppsCardV1Image();
    image.setImageUrl(IMAGES[count % IMAGES.length]);

    GoogleAppsCardV1Widget imageWidget = new GoogleAppsCardV1Widget();
    imageWidget.setImage(image);

    GoogleAppsCardV1ActionParameter voteIdParameter = new GoogleAppsCardV1ActionParameter();
    voteIdParameter.setKey("voteId");
    voteIdParameter.setValue(voteId);

    GoogleAppsCardV1ActionParameter statementParameter = new GoogleAppsCardV1ActionParameter();
    statementParameter.setKey("statement");
    statementParameter.setValue(statement);

    GoogleAppsCardV1ActionParameter countParameter = new GoogleAppsCardV1ActionParameter();
    countParameter.setKey("count");
    countParameter.setValue(String.format("%d", count));

    GoogleAppsCardV1Action upvoteAction = new GoogleAppsCardV1Action();
    upvoteAction.set("actionMethodName", "upvote");
    upvoteAction.setParameters(List.of(voteIdParameter, statementParameter, countParameter));

    GoogleAppsCardV1OnClick upvoteOnClick = new GoogleAppsCardV1OnClick();
    upvoteOnClick.setAction(upvoteAction);

    GoogleAppsCardV1Button upvoteButton = new GoogleAppsCardV1Button();
    upvoteButton.setText("UPVOTE");
    upvoteButton.setOnClick(upvoteOnClick);

    GenericJson upvoteTextButton = new GenericJson();
    upvoteTextButton.set("textButton", upvoteButton);

    GoogleAppsCardV1Action newvoteAction = new GoogleAppsCardV1Action();
    newvoteAction.set("actionMethodName", "newvote");

    GoogleAppsCardV1OnClick newvoteOnClick = new GoogleAppsCardV1OnClick();
    newvoteOnClick.setAction(newvoteAction);

    GoogleAppsCardV1Button newvoteButton = new GoogleAppsCardV1Button();
    newvoteButton.setText("NEW VOTE");
    newvoteButton.setOnClick(newvoteOnClick);

    GenericJson newvoteTextButton = new GenericJson();
    newvoteTextButton.set("textButton", newvoteButton);

    GenericJson buttonsWidget = new GenericJson();
    buttonsWidget.set("buttons", List.of(upvoteTextButton, newvoteTextButton));

    GoogleAppsCardV1Section section = new GoogleAppsCardV1Section();
    section.set("widgets", List.of(textParagraphWidget, imageWidget, buttonsWidget));

    GoogleAppsCardV1Card card = new GoogleAppsCardV1Card();
    card.setName(voteId);
    card.setHeader(cardHeader);
    card.set("sections", List.of(section));

    GenericJson actionResponse = new GenericJson();
    actionResponse.set("type", update ? "UPDATE_MESSAGE" : "NEW_MESSAGE");

    GenericJson response = new GenericJson();
    response.setFactory(GsonFactory.getDefaultInstance());
    response.set("actionResponse", actionResponse);
    response.set("cards", List.of(card));
    return response;
  }
}
