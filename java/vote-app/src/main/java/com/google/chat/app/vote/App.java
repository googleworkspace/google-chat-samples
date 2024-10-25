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

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.services.chat.v1.model.ActionResponse;
import com.google.api.services.chat.v1.model.CardWithId;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Action;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ActionParameter;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Button;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ButtonList;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Card;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1CardHeader;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Image;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OnClick;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextParagraph;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;
import com.google.api.services.chat.v1.model.Message;

@SpringBootApplication
@RestController
public class App {

  static String[] IMAGES = new String[] {
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
   */
  @PostMapping("/")
  @ResponseBody
  public Message onEvent(@RequestBody JsonNode event) throws Exception {
    Message response = new Message();
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
  private Message createMessage(String voteId, String statement, String voter, int count, boolean update) {
    return new Message()
      .setActionResponse(new ActionResponse()
        .setType(update ? "UPDATE_MESSAGE" : "NEW_MESSAGE"))
      .setCardsV2(List.of(new CardWithId()
        .setCardId("voteCard")
        .setCard(new GoogleAppsCardV1Card()
          .setName(voteId)
          .setHeader(new GoogleAppsCardV1CardHeader()
            .setTitle(String.format("Vote: %s", statement)))
          .set("sections", List.of(new GoogleAppsCardV1Section()
            .setWidgets(List.of(
              new GoogleAppsCardV1Widget().setTextParagraph(new GoogleAppsCardV1TextParagraph()
                .setText(String.format("%d votes, last vote was by %s!", count, voter))),
              new GoogleAppsCardV1Widget().setImage(new GoogleAppsCardV1Image()
                .setImageUrl(IMAGES[count % IMAGES.length])),
                new GoogleAppsCardV1Widget().setButtonList(new GoogleAppsCardV1ButtonList()
                  .setButtons(List.of(
                    new GoogleAppsCardV1Button()
                      .setText("UPVOTE")
                      .setOnClick(new GoogleAppsCardV1OnClick()
                        .setAction(new GoogleAppsCardV1Action()
                          .setFunction("newvote")
                          .setParameters(List.of(
                            new GoogleAppsCardV1ActionParameter()
                              .setKey("voteId").setValue(voteId),
                            new GoogleAppsCardV1ActionParameter()
                              .setKey("statement").setValue(statement),
                            new GoogleAppsCardV1ActionParameter()
                              .setKey("count").setValue(String.format("%d", count)))))),
                    new GoogleAppsCardV1Button()
                      .setText("NEW VOTE")
                      .setOnClick(new GoogleAppsCardV1OnClick()
                        .setAction(new GoogleAppsCardV1Action()
                          .setFunction("newvote")))))))))))));
  }
}
