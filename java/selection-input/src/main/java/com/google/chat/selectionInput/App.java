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
package com.google.chat.contact;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.services.chat.v1.model.AccessoryWidget;
import com.google.api.services.chat.v1.model.ActionResponse;
import com.google.api.services.chat.v1.model.ActionStatus;
import com.google.api.services.chat.v1.model.CardWithId;
import com.google.api.services.chat.v1.model.Dialog;
import com.google.api.services.chat.v1.model.DialogAction;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Action;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ActionParameter;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Button;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1ButtonList;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Card;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1CardHeader;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1DateTimePicker;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1OnClick;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1SelectionInput;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1SelectionItem;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextInput;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextParagraph;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.SelectionItems;
import com.google.api.services.chat.v1.model.UpdatedWidget;
import com.google.api.services.chat.v1.model.User;

@SpringBootApplication
@RestController
public class App {

  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  // Process Google Chat events.
  @PostMapping("/")
  @ResponseBody
  public Message onEvent(@RequestBody JsonNode event) throws Exception {
    switch (event.at("/type").asText()) {
      case "MESSAGE":
        return onMessage(event);
      case "WIDGET_UPDATE":
        return onWidgetUpdate(event);
    }
    return null;
  }

  // Responds to a MESSAGE interaction event in Google Chat.
  Message onMessage(JsonNode event) {
    return new Message().setCardsV2(List.of(new CardWithId()
      .setCardId("contactSelector")
      .setCard(new GoogleAppsCardV1Card()
        .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(List.of(new GoogleAppsCardV1Widget()
          // [START selection_input]
          .setSelectionInput(new GoogleAppsCardV1SelectionInput()
            .setName("contacts")
            .setType("MULTI_SELECT")
            .setLabel("Selected contacts")
            .setMultiSelectMaxSelectedItems(3)
            .setMultiSelectMinQueryLength(1)
            .setExternalDataSource(new GoogleAppsCardV1Action().setFunction("getContacts"))
            .setItems(List.of(getContact("3")))))))))));
            // [END selection_input]
  }

  // [START process_query]
  // Responds to a WIDGET_UPDATE event in Google Chat.
  Message onWidgetUpdate(JsonNode event) {
    if ("getContacts".equals(event.at("/invokedFunction").asText())) {
      String query = event.at("/common/parameters/autocomplete_widget_query").asText();
      return new Message().setActionResponse(new ActionResponse()
        .setType("UPDATE_WIDGET")
        .setUpdatedWidget(new UpdatedWidget()
          .setSuggestions(new SelectionItems().setItems(List.of(
            // The list is static here but it could be dynamic.
            getContact("1"), getContact("2"), getContact("3"), getContact("4"), getContact("5")
          // Only return items based on the query from the user
          ).stream().filter(e -> query == null || e.getText().indexOf(query) > -1).toList()))));
    }
    return null;
  }

  // Generate a suggested contact given an ID.
  GoogleAppsCardV1SelectionItem getContact(String id) {
    return new GoogleAppsCardV1SelectionItem()
      .setValue(id)
      .setStartIconUri("https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png")
      .setText("Contact " + id);
  }
  // [END process_query]
}
