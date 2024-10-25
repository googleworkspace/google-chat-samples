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
      case "CARD_CLICKED":
        return onCardClick(event);
    }
    return null;
  }

  // Responds to a MESSAGE interaction event in Google Chat.
  Message onMessage(JsonNode event) {
    if (!event.at("/message/slashCommand").isMissingNode()) {
      switch(event.at("/message/slashCommand/commandId").asText()) {
        case "1":
          // If the slash command is "/about", responds with a text message and button
          // that opens a dialog.
          return new Message()
            .setText( "Manage your personal and business contacts 📇. To add a " +
                      "contact, use the slash command `/addContact`.")
            .setAccessoryWidgets(List.of(new AccessoryWidget()
              // [START open_dialog_from_button]
              .setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(new GoogleAppsCardV1Button()
                .setText("Add Contact")
                .setOnClick(new GoogleAppsCardV1OnClick().setAction(new GoogleAppsCardV1Action()
                  .setFunction("openInitialDialog")
                  .setInteraction("OPEN_DIALOG"))))))));
                  // [END open_dialog_from_button]
        case "2":
          // If the slash command is "/addContact", opens a dialog.
          return openInitialDialog();
      }
    }

    // If user sends the Chat app a message without a slash command, the app responds
    // privately with a text and card to add a contact.
    return new Message()
      .setPrivateMessageViewer(new User().setName(event.at("/user/name").asText()))
      .setText("To add a contact, try `/addContact` or complete the form below:")
      .setCardsV2(List.of(new CardWithId()
        .setCardId("addContactForm")
        .setCard(new GoogleAppsCardV1Card()
          .setHeader(new GoogleAppsCardV1CardHeader().setTitle("Add a contact"))
          .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(Stream.concat(
            CONTACT_FORM_WIDGETS.stream(),
            List.of(new GoogleAppsCardV1Widget()
              .setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(new GoogleAppsCardV1Button()
              .setText("Review and submit")
              .setOnClick(new GoogleAppsCardV1OnClick().setAction(new GoogleAppsCardV1Action()
                .setFunction("openConfirmation"))))))).stream()).collect(Collectors.toList())))))));
  }

  // [START subsequent_steps]
  // Responds to CARD_CLICKED interaction events in Google Chat.
  Message onCardClick(JsonNode event) {
    String invokedFunction = event.at("/common/invokedFunction").asText();
    // Initial dialog form page
    if ("openInitialDialog".equals(invokedFunction)) {
      return openInitialDialog();
    // Confirmation dialog form page
    } else if ("openConfirmation".equals(invokedFunction)) {
      return openConfirmation(event);
    // Submission dialog form page
    } else if ("submitForm".equals(invokedFunction)) {
      return submitForm(event);
    }
    return null; 
  }

  // [START open_initial_dialog]
  // Opens the initial step of the dialog that lets users add contact details.
  Message openInitialDialog() {
    return new Message().setActionResponse(new ActionResponse()
      .setType("DIALOG")
      .setDialogAction(new DialogAction().setDialog(new Dialog().setBody(new GoogleAppsCardV1Card()
        .setSections(List.of(new GoogleAppsCardV1Section()
          .setHeader("Add new contact")
          .setWidgets(Stream.concat(
            CONTACT_FORM_WIDGETS.stream(),
            List.of(new GoogleAppsCardV1Widget()
              .setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(new GoogleAppsCardV1Button()
              .setText("Review and submit")
              .setOnClick(new GoogleAppsCardV1OnClick().setAction(new GoogleAppsCardV1Action()
                .setFunction("openConfirmation"))))))).stream()).collect(Collectors.toList()))))))));
  }
  // [END open_initial_dialog]

  // Returns the second step as a dialog or card message that lets users confirm details.
  Message openConfirmation(JsonNode event) {
    String name = fetchFormValue(event, "contactName") != null ?
      fetchFormValue(event, "contactName") : "";
    String birthdate = fetchFormValue(event, "contactBirthdate") != null ?
      fetchFormValue(event, "contactBirthdate") : "";
    String type = fetchFormValue(event, "contactType") != null ?
      fetchFormValue(event, "contactType") : "";
    GoogleAppsCardV1Section cardConfirmationSection = new GoogleAppsCardV1Section()
      .setHeader("Your contact")
      .setWidgets(List.of(
        new GoogleAppsCardV1Widget().setTextParagraph(new GoogleAppsCardV1TextParagraph()
          .setText("Confirm contact information and submit:")),
        new GoogleAppsCardV1Widget().setTextParagraph(new GoogleAppsCardV1TextParagraph()
          .setText("<b>Name:</b> " + name)),
        new GoogleAppsCardV1Widget().setTextParagraph(new GoogleAppsCardV1TextParagraph()
          .setText("<b>Birthday:</b> " + convertMillisToDateString(birthdate))),
        new GoogleAppsCardV1Widget().setTextParagraph(new GoogleAppsCardV1TextParagraph()
          .setText("<b>Type:</b> " + type)),
        // [START set_parameters]
        new GoogleAppsCardV1Widget().setButtonList(new GoogleAppsCardV1ButtonList().setButtons(List.of(new GoogleAppsCardV1Button()
          .setText("Submit")
          .setOnClick(new GoogleAppsCardV1OnClick().setAction(new GoogleAppsCardV1Action()
            .setFunction("submitForm")
            .setParameters(List.of(
              new GoogleAppsCardV1ActionParameter().setKey("contactName").setValue(name),
              new GoogleAppsCardV1ActionParameter().setKey("contactBirthdate").setValue(birthdate),
              new GoogleAppsCardV1ActionParameter().setKey("contactType").setValue(type))))))))));
              // [END set_parameters]
    
    // Returns a dialog with contact information that the user input.
    if (event.at("/isDialogEvent") != null && event.at("/isDialogEvent").asBoolean()) {
      return new Message().setActionResponse(new ActionResponse()
        .setType("DIALOG")
        .setDialogAction(new DialogAction().setDialog(new Dialog().setBody(new GoogleAppsCardV1Card()
          .setSections(List.of(cardConfirmationSection))))));
    }

    // Updates existing card message with contact information that the user input.
    return new Message()
      .setActionResponse(new ActionResponse()
        .setType("UPDATE_MESSAGE"))
      .setPrivateMessageViewer(new User().setName(event.at("/user/name").asText()))
      .setCardsV2(List.of(new CardWithId().setCard(new GoogleAppsCardV1Card()
        .setSections(List.of(cardConfirmationSection)))));
  }
  // [END subsequent_steps]

  // Validates and submits information from a dialog or card message and notifies status.
  Message submitForm(JsonNode event) {
    // [START status_notification]
    String contactName = event.at("/common/parameters/contactName").asText();
    // Checks to make sure the user entered a contact name.
    // If no name value detected, returns an error message.
    if (contactName.isEmpty()) {
      String errorMessage = "Don't forget to name your new contact!";
      if (event.at("/dialogEventType") != null && "SUBMIT_DIALOG".equals(event.at("/dialogEventType").asText())) {
        return new Message().setActionResponse(new ActionResponse()
          .setType("DIALOG")
          .setDialogAction(new DialogAction().setActionStatus(new ActionStatus()
            .setStatusCode("INVALID_ARGUMENT")
            .setUserFacingMessage(errorMessage))));
      } else {
        return new Message()
          .setPrivateMessageViewer(new User().setName(event.at("/user/name").asText()))
          .setText(errorMessage);
      }
    }
    // [END status_notification]

    // [START confirmation_message]
    // The Chat app indicates that it received form data from the dialog or card.
    // Sends private text message that confirms submission.
    String confirmationMessage = "✅ " + contactName + " has been added to your contacts.";
    if (event.at("/dialogEventType") != null && "SUBMIT_DIALOG".equals(event.at("/dialogEventType").asText())) {
      return new Message().setActionResponse(new ActionResponse()
        .setType("DIALOG")
        .setDialogAction(new DialogAction().setActionStatus(new ActionStatus()
          .setStatusCode("OK")
          .setUserFacingMessage("Success " + contactName))));
    } else {
      return new Message()
        .setActionResponse(new ActionResponse().setType("NEW_MESSAGE"))
        .setPrivateMessageViewer(new User().setName(event.at("/user/name").asText()))
        .setText(confirmationMessage);
    }
    // [END confirmation_message]
  }

  // Extracts form input value for a given widget.
  String fetchFormValue(JsonNode event, String widgetName) {
    JsonNode formItem = event.at("/common/formInputs/" + widgetName);
    // For widgets that receive StringInputs data, the value input by the user.
    if (formItem.get("stringInputs") != null) {
      String stringInput = formItem.at("/stringInputs/value").get(0).asText();
      if (stringInput != null) {
        return stringInput;
      }
    // For widgets that receive dateInput data, the value input by the user.
    } else if (formItem.get("dateInput") != null) {
      String dateInput = formItem.at("/dateInput/msSinceEpoch").asText();
      if (dateInput != null) {
        return dateInput;
      }
    }
    return null;
  }

  // Converts date in milliseconds since epoch to user-friendly string.
  String convertMillisToDateString(String millis) {
    Date date = new Date(Long.parseLong(millis));
    return new SimpleDateFormat("MM/dd/yyyy").format(date);
  }

  // [START input_widgets]
  // The section of the contact card that contains the form input widgets. Used in a dialog and card message.
  // To add and preview widgets, use the Card Builder: https://addons.gsuite.google.com/uikit/builder
  final static private List<GoogleAppsCardV1Widget> CONTACT_FORM_WIDGETS = List.of(
    new GoogleAppsCardV1Widget().setTextInput(new GoogleAppsCardV1TextInput()
      .setName("contactName")
      .setLabel("First and last name")
      .setType("SINGLE_LINE")),
    new GoogleAppsCardV1Widget().setDateTimePicker(new GoogleAppsCardV1DateTimePicker()
      .setName("contactBirthdate")
      .setLabel("Birthdate")
      .setType("DATE_ONLY")),
    new GoogleAppsCardV1Widget().setSelectionInput(new GoogleAppsCardV1SelectionInput()
      .setName("contactType")
      .setLabel("Contact type")
      .setType("RADIO_BUTTON")
      .setItems(List.of(
        new GoogleAppsCardV1SelectionItem()
          .setText("Work")
          .setValue("Work")
          .setSelected(false),
        new GoogleAppsCardV1SelectionItem()
          .setText("Personal")
          .setValue("Personal")
          .setSelected(false)))));
          // [END input_widgets]
}
