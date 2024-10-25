/**
 * Copyright 2024 Google LLC
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
package com.google.chat.preview;

import java.util.List;

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
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Button;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ButtonList;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Card;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1CardHeader;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1DecoratedText;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OnClick;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OpenLink;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;
import com.google.api.services.chat.v1.model.Message;

@SpringBootApplication
@RestController
public class App {

  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  // Process Google Chat events
  @PostMapping("/")
  @ResponseBody
  public Message onEvent(@RequestBody JsonNode event) throws Exception {
    switch (event.at("/type").asText()) {
      case "MESSAGE":
        return onMessage(event);
      case "CARD_CLICKED":
        return onCardClick(event);
    }
    return null;
  }

  // Respond to messages that have links whose URLs match URL patterns
  // configured for link previewing.
  Message onMessage(JsonNode event) {
    // If the Chat app does not detect a link preview URL pattern, reply
    // with a text message that says so.
    if (event.at("/message/matchedUrl").isMissingNode()) {
      return new Message().setText("No matchedUrl detected.");
    }

    // [START preview_links_text]
    // Reply with a text message for URLs of the subdomain "text"
    if (event.at("/message/matchedUrl/url").asText().contains("text.example.com")) {
      return new Message().setText("event.message.matchedUrl.url: " +
        event.at("/message/matchedUrl/url").asText());
    }
    // [END preview_links_text]

    // [START preview_links_card]
    // Attach a card to the message for URLs of the subdomain "support"
    if (event.at("/message/matchedUrl/url").asText().contains("support.example.com")) {
      // A hard-coded card is used in this example. In a real-life scenario,
      // the case information would be fetched and used to build the card.
      return new Message()
        .setActionResponse(new ActionResponse()
          .setType("UPDATE_USER_MESSAGE_CARDS"))
        .setCardsV2(List.of(new CardWithId()
          .setCardId("attachCard")
          .setCard(new GoogleAppsCardV1Card()
            .setHeader(new GoogleAppsCardV1CardHeader()
              .setTitle("Example Customer Service Case")
              .setSubtitle("Case basics"))
            .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(List.of(
              new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
                .setTopLabel("Case ID")
                .setText("case123")),
              new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
                .setTopLabel("Assignee")
                .setText("Charlie")),
              new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
                .setTopLabel("Status")
                .setText("Open")),
              new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
                .setTopLabel("Subject")
                .setText("It won't turn on...")),
              new GoogleAppsCardV1Widget()
                .setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(
                  new GoogleAppsCardV1Button()
                    .setText("OPEN CASE")
                    .setOnClick(new GoogleAppsCardV1OnClick()
                      .setOpenLink(new GoogleAppsCardV1OpenLink()
                        .setUrl("https://support.example.com/orders/case123"))),
                  new GoogleAppsCardV1Button()
                    .setText("RESOLVE CASE")
                    .setOnClick(new GoogleAppsCardV1OnClick()
                      .setOpenLink(new GoogleAppsCardV1OpenLink()
                        .setUrl("https://support.example.com/orders/case123?resolved=y"))),
                  new GoogleAppsCardV1Button()
                    .setText("ASSIGN TO ME")
                    .setOnClick(new GoogleAppsCardV1OnClick()
                      .setAction(new GoogleAppsCardV1Action().setFunction("assign")))))))))))));
    }
    // [END preview_links_card]
    return null;
  }

  // [START preview_links_assign]
  // Updates a card that was attached to a message with a previewed link.
  Message onCardClick(JsonNode event) {
    // To respond to the correct button, checks the button's actionMethodName.
    if (event.at("/action/actionMethodName").asText().equals("assign")) {
      // A hard-coded card is used in this example. In a real-life scenario,
      // an actual assign action would be performed before building the card.

      // Checks whether the message event originated from a human or a Chat app
      // and sets actionResponse.type to "UPDATE_USER_MESSAGE_CARDS if human or
      // "UPDATE_MESSAGE" if Chat app.
      String actionResponseType =
        event.at("/message/sender/type").asText().equals("HUMAN")
        ? "UPDATE_USER_MESSAGE_CARDS" : "UPDATE_MESSAGE";

      // Returns the updated card that displays "You" for the assignee
      // and that disables the button.
      return new Message()
      .setActionResponse(new ActionResponse()
        .setType(actionResponseType))
      .setCardsV2(List.of(new CardWithId()
        .setCardId("attachCard")
        .setCard(new GoogleAppsCardV1Card()
          .setHeader(new GoogleAppsCardV1CardHeader()
            .setTitle("Example Customer Service Case")
            .setSubtitle("Case basics"))
          .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(List.of(
            new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
              .setTopLabel("Case ID")
              .setText("case123")),
            new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
              .setTopLabel("Assignee")
              // The assignee is now "You"
              .setText("You")),
            new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
              .setTopLabel("Status")
              .setText("Open")),
            new GoogleAppsCardV1Widget().setDecoratedText(new GoogleAppsCardV1DecoratedText()
              .setTopLabel("Subject")
              .setText("It won't turn on...")),
            new GoogleAppsCardV1Widget()
              .setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(
                new GoogleAppsCardV1Button()
                  .setText("OPEN CASE")
                  .setOnClick(new GoogleAppsCardV1OnClick()
                    .setOpenLink(new GoogleAppsCardV1OpenLink()
                      .setUrl("https://support.example.com/orders/case123"))),
                new GoogleAppsCardV1Button()
                  .setText("RESOLVE CASE")
                  .setOnClick(new GoogleAppsCardV1OnClick()
                    .setOpenLink(new GoogleAppsCardV1OpenLink()
                      .setUrl("https://support.example.com/orders/case123?resolved=y"))),
                new GoogleAppsCardV1Button()
                  .setText("ASSIGN TO ME")
                  // The button is now disabled
                  .setDisabled(true)
                  .setOnClick(new GoogleAppsCardV1OnClick()
                    .setAction(new GoogleAppsCardV1Action().setFunction("assign")))))))))))));
    }
    return null;
  }
  // [END preview_links_assign]
}
