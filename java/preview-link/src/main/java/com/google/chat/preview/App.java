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
import com.google.api.client.json.GenericJson;
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

  /**
   * Process Google Chat events
   *
   * @param event Event from chat.
   * @return GenericJson
   * @throws Exception
   */
  @PostMapping("/")
  @ResponseBody
  public GenericJson onEvent(@RequestBody JsonNode event) throws Exception {
    switch (event.at("/type").asText()) {
      case "MESSAGE":
        return onMessage(event);
      case "CARD_CLICKED":
        return onCardClick(event);
    }
    return new GenericJson();
  }

  // Respond to messages that have links whose URLs match URL patterns
  // configured for link previewing.
  GenericJson onMessage(JsonNode event) {
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
      GoogleAppsCardV1CardHeader header = new GoogleAppsCardV1CardHeader();
      header.setTitle("Example Customer Service Case");
      header.setSubtitle("Case basics");

      GoogleAppsCardV1DecoratedText caseIdDecoratedText = new GoogleAppsCardV1DecoratedText();
      caseIdDecoratedText.setTopLabel("Case ID");
      caseIdDecoratedText.setText("case123");

      GoogleAppsCardV1Widget caseIdWidget = new GoogleAppsCardV1Widget();
      caseIdWidget.setDecoratedText(caseIdDecoratedText);

      GoogleAppsCardV1DecoratedText assigneeDecoratedText = new GoogleAppsCardV1DecoratedText();
      assigneeDecoratedText.setTopLabel("Assignee");
      assigneeDecoratedText.setText("Charlie");

      GoogleAppsCardV1Widget assigneeWidget = new GoogleAppsCardV1Widget();
      assigneeWidget.setDecoratedText(assigneeDecoratedText);

      GoogleAppsCardV1DecoratedText statusDecoratedText = new GoogleAppsCardV1DecoratedText();
      statusDecoratedText.setTopLabel("Status");
      statusDecoratedText.setText("Open");

      GoogleAppsCardV1Widget statusWidget = new GoogleAppsCardV1Widget();
      statusWidget.setDecoratedText(statusDecoratedText);

      GoogleAppsCardV1DecoratedText subjectDecoratedText = new GoogleAppsCardV1DecoratedText();
      subjectDecoratedText.setTopLabel("Subject");
      subjectDecoratedText.setText("It won't turn on...");

      GoogleAppsCardV1Widget subjectWidget = new GoogleAppsCardV1Widget();
      subjectWidget.setDecoratedText(subjectDecoratedText);

      GoogleAppsCardV1OpenLink openOpenLink = new GoogleAppsCardV1OpenLink();
      openOpenLink.setUrl("https://support.example.com/orders/case123");

      GoogleAppsCardV1OnClick openOnClick = new GoogleAppsCardV1OnClick();
      openOnClick.setOpenLink(openOpenLink);

      GoogleAppsCardV1Button openButton = new GoogleAppsCardV1Button();
      openButton.setText("OPEN CASE");
      openButton.setOnClick(openOnClick);

      GoogleAppsCardV1OpenLink resolveOpenLink = new GoogleAppsCardV1OpenLink();
      resolveOpenLink.setUrl("https://support.example.com/orders/case123?resolved=y");

      GoogleAppsCardV1OnClick resolveOnClick = new GoogleAppsCardV1OnClick();
      resolveOnClick.setOpenLink(resolveOpenLink);

      GoogleAppsCardV1Button resolveButton = new GoogleAppsCardV1Button();
      resolveButton.setText("RESOLVE CASE");
      resolveButton.setOnClick(resolveOnClick);

      GoogleAppsCardV1Action assignAction = new GoogleAppsCardV1Action();
      assignAction.setFunction("assign");

      GoogleAppsCardV1OnClick assignOnClick = new GoogleAppsCardV1OnClick();
      assignOnClick.setAction(assignAction);

      GoogleAppsCardV1Button assignButton = new GoogleAppsCardV1Button();
      assignButton.setText("ASSIGN TO ME");
      assignButton.setOnClick(assignOnClick);

      GoogleAppsCardV1ButtonList buttonList = new GoogleAppsCardV1ButtonList();
      buttonList.setButtons(List.of(openButton, resolveButton, assignButton));

      GoogleAppsCardV1Widget buttonListWidget = new GoogleAppsCardV1Widget();
      buttonListWidget.setButtonList(buttonList);

      GoogleAppsCardV1Section section = new GoogleAppsCardV1Section();
      section.setWidgets(List.of(caseIdWidget, assigneeWidget, statusWidget, subjectWidget, buttonListWidget));

      GoogleAppsCardV1Card card = new GoogleAppsCardV1Card();
      card.setHeader(header);
      card.setSections(List.of(section));

      GenericJson cardV2 = new GenericJson();
      cardV2.set("cardId", "attachCard");
      cardV2.set("card", card);

      GenericJson actionResponse = new GenericJson();
      actionResponse.set("type", "UPDATE_USER_MESSAGE_CARDS");
  
      GenericJson response = new GenericJson();
      response.set("actionResponse", actionResponse);
      response.set("cardsV2", List.of(cardV2));
      return response;
    }
    // [END preview_links_card]
    return new GenericJson();
  }

  // [START preview_links_assign]
  // Updates a card that was attached to a message with a previewed link.
  GenericJson onCardClick(JsonNode event) {
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
      GoogleAppsCardV1CardHeader header = new GoogleAppsCardV1CardHeader();
      header.setTitle("Example Customer Service Case");
      header.setSubtitle("Case basics");

      GoogleAppsCardV1DecoratedText caseIdDecoratedText = new GoogleAppsCardV1DecoratedText();
      caseIdDecoratedText.setTopLabel("Case ID");
      caseIdDecoratedText.setText("case123");

      GoogleAppsCardV1Widget caseIdWidget = new GoogleAppsCardV1Widget();
      caseIdWidget.setDecoratedText(caseIdDecoratedText);

      GoogleAppsCardV1DecoratedText assigneeDecoratedText = new GoogleAppsCardV1DecoratedText();
      assigneeDecoratedText.setTopLabel("Assignee");
      // The assignee is now "You"
      assigneeDecoratedText.setText("You");

      GoogleAppsCardV1Widget assigneeWidget = new GoogleAppsCardV1Widget();
      assigneeWidget.setDecoratedText(assigneeDecoratedText);

      GoogleAppsCardV1DecoratedText statusDecoratedText = new GoogleAppsCardV1DecoratedText();
      statusDecoratedText.setTopLabel("Status");
      statusDecoratedText.setText("Open");

      GoogleAppsCardV1Widget statusWidget = new GoogleAppsCardV1Widget();
      statusWidget.setDecoratedText(statusDecoratedText);

      GoogleAppsCardV1DecoratedText subjectDecoratedText = new GoogleAppsCardV1DecoratedText();
      subjectDecoratedText.setTopLabel("Subject");
      subjectDecoratedText.setText("It won't turn on...");

      GoogleAppsCardV1Widget subjectWidget = new GoogleAppsCardV1Widget();
      subjectWidget.setDecoratedText(subjectDecoratedText);

      GoogleAppsCardV1OpenLink openOpenLink = new GoogleAppsCardV1OpenLink();
      openOpenLink.setUrl("https://support.example.com/orders/case123");

      GoogleAppsCardV1OnClick openOnClick = new GoogleAppsCardV1OnClick();
      openOnClick.setOpenLink(openOpenLink);

      GoogleAppsCardV1Button openButton = new GoogleAppsCardV1Button();
      openButton.setText("OPEN CASE");
      openButton.setOnClick(openOnClick);

      GoogleAppsCardV1OpenLink resolveOpenLink = new GoogleAppsCardV1OpenLink();
      resolveOpenLink.setUrl("https://support.example.com/orders/case123?resolved=y");

      GoogleAppsCardV1OnClick resolveOnClick = new GoogleAppsCardV1OnClick();
      resolveOnClick.setOpenLink(resolveOpenLink);

      GoogleAppsCardV1Button resolveButton = new GoogleAppsCardV1Button();
      resolveButton.setText("RESOLVE CASE");
      resolveButton.setOnClick(resolveOnClick);

      GoogleAppsCardV1Action assignAction = new GoogleAppsCardV1Action();
      assignAction.setFunction("assign");

      GoogleAppsCardV1OnClick assignOnClick = new GoogleAppsCardV1OnClick();
      assignOnClick.setAction(assignAction);

      GoogleAppsCardV1Button assignButton = new GoogleAppsCardV1Button();
      assignButton.setText("ASSIGN TO ME");
      // The button is now disabled
      assignButton.setDisabled(true);
      assignButton.setOnClick(assignOnClick);

      GoogleAppsCardV1ButtonList buttonList = new GoogleAppsCardV1ButtonList();
      buttonList.setButtons(List.of(openButton, resolveButton, assignButton));

      GoogleAppsCardV1Widget buttonListWidget = new GoogleAppsCardV1Widget();
      buttonListWidget.setButtonList(buttonList);

      GoogleAppsCardV1Section section = new GoogleAppsCardV1Section();
      section.setWidgets(List.of(caseIdWidget, assigneeWidget, statusWidget, subjectWidget, buttonListWidget));

      GoogleAppsCardV1Card card = new GoogleAppsCardV1Card();
      card.setHeader(header);
      card.setSections(List.of(section));

      GenericJson cardV2 = new GenericJson();
      cardV2.set("cardId", "attachCard");
      cardV2.set("card", card);

      GenericJson actionResponse = new GenericJson();
      actionResponse.set("type", actionResponseType);
  
      GenericJson response = new GenericJson();
      response.set("actionResponse", actionResponse);
      response.set("cardsV2", List.of(cardV2));
      return response;
    }
    return new GenericJson();
  }
  // [END preview_links_assign]
}
