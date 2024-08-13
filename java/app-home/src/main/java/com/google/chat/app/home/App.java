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
package com.google.chat.app.home;

import java.util.Date;
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
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OnClick;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextParagraph;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;

@SpringBootApplication
@RestController
public class App {

  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  // [START chat_app_home]
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
    switch (event.at("/chat/type").asText()) {
      case "APP_HOME":
        // App home is requested
        GenericJson navigation = new GenericJson();
        navigation.set("pushCard", getHomeCard());

        GenericJson action = new GenericJson();
        action.set("navigations", List.of(navigation));

        GenericJson response = new GenericJson();
        response.set("action", action);
        return response;
      case "SUBMIT_FORM":
        // The update button from app home is clicked
        if (event.at("/commonEventObject/invokedFunction").asText().equals("updateAppHome")) {
          return updateAppHome();
        }
    }

    return new GenericJson();
  }

  // Create the app home card
  GoogleAppsCardV1Card getHomeCard() {
    GoogleAppsCardV1TextParagraph textParagraph = new GoogleAppsCardV1TextParagraph();
    textParagraph.setText("Here is the app home 🏠 It's " + new Date());

    GoogleAppsCardV1Widget textParagraphWidget = new GoogleAppsCardV1Widget();
    textParagraphWidget.setTextParagraph(textParagraph);

    GoogleAppsCardV1Action action = new GoogleAppsCardV1Action();
    action.setFunction("updateAppHome");

    GoogleAppsCardV1OnClick onClick = new GoogleAppsCardV1OnClick();
    onClick.setAction(action);

    GoogleAppsCardV1Button button = new GoogleAppsCardV1Button();
    button.setText("Update app home");
    button.setOnClick(onClick);

    GoogleAppsCardV1ButtonList buttonList = new GoogleAppsCardV1ButtonList();
    buttonList.setButtons(List.of(button));

    GoogleAppsCardV1Widget buttonListWidget = new GoogleAppsCardV1Widget();
    buttonListWidget.setButtonList(buttonList);

    GoogleAppsCardV1Section section = new GoogleAppsCardV1Section();
    section.setWidgets(List.of(textParagraphWidget, buttonListWidget));

    GoogleAppsCardV1Card card = new GoogleAppsCardV1Card();
    card.setSections(List.of(section));

    return card;
  }
  // [END chat_app_home]

  // [START chat_app_home_update]
  // Update the app home
  GenericJson updateAppHome() {
    GenericJson navigation = new GenericJson();
    navigation.set("updateCard", getHomeCard());

    GenericJson action = new GenericJson();
    action.set("navigations", List.of(navigation));

    GenericJson renderActions = new GenericJson();
    renderActions.set("action", action);

    GenericJson response = new GenericJson();
    response.set("renderActions", renderActions);
    return response;
  }
  // [END chat_app_home_update]
}
