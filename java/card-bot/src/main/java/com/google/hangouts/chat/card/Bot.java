/*
 * Copyright 2017 Google Inc.
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.hangouts.chat.card;

// [START card-bot]
import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.services.chat.v1.model.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Stream;

@SpringBootApplication
@RestController
public class Bot {
    private static final Logger logger = Logger.getLogger(Bot.class.getName());

    private static final String INTERACTIVE_TEXT_BUTTON_ACTION = "doTextButtonAction";
    private static final String INTERACTIVE_IMAGE_BUTTON_ACTION = "doImageButtonAction";
    private static final String INTERACTIVE_BUTTON_KEY = "originalMessage";
    private static final String HEADER_IMAGE = "https://goo.gl/5obRKj";
    private static final String BOT_NAME = "Card Bot Java";
    private static final String REDIRECT_URL = "https://goo.gl/kwhSNz";

    public static void main(String[] args) {
        SpringApplication.run(Bot.class, args);
    }

    /**
     * Handles a GET request to the /bot endpoint.
     *
     * @param event Event from chat.
     * @return Message
     */
    @PostMapping("/")
    @ResponseBody
    public Message onEvent(@RequestBody JsonNode event) {
        Message reply = new Message();
        String eventType = event.get("type").asText();
        switch (eventType) {
            case "ADDED_TO_SPACE":
                JsonNode space = event.get("space");
                String spaceType = space.get("type").asText();
                if ("ROOM".equals(spaceType)) {
                    String displayName = space.get("displayName").asText();
                    String replyText = String.format("Thanks for adding me to %s", displayName);
                    reply.setText(replyText);
                } else {
                    String displayName = event.get("user").get("displayName").asText();
                    String replyText = String.format("Thanks for adding me to a DM, %s!", displayName);
                    reply.setText(replyText);
                }
                break;
            case "MESSAGE":
                Card card = createCardResponse(event.get("message").get("text").asText());
                reply.setCards(Collections.singletonList(card));
                break;
            case "CARD_CLICKED":
                // Get the custom action name and custom parameter value out of the event object.
                String actionName = event.get("action").get("actionMethodName").asText();
                String customParameterValue = event.get("action").get("parameters").get(0).get("value").asText();
                card = respondToInteractiveCardClick(actionName, customParameterValue);
                reply.setCards(Collections.singletonList(card));
                break;
            case "REMOVED_FROM_SPACE":
                String name = event.get("space").get("name").asText();
                logger.info(String.format("Bot removed from %s", name));
                break;
            default:
                reply.setText("Cannot determine event type");
                break;
        }
        return reply;
    }


    /**
     * Creates a card-formatted response based on the message sent in Hangouts Chat.
     *
     * See the reference for JSON keys and format for cards:
     * https://developers.google.com/hangouts/chat/reference/message-formats/cards
     *
     * @param message the event object sent from Hangouts Chat
     * @return a card responseStr as a JSON object node
     */
    private Card createCardResponse(String message) {
        Card card = new Card();
        List<WidgetMarkup> widgets = new ArrayList<>();
        List<ActionParameter> customParameters = Collections.singletonList(
                new ActionParameter().setKey(INTERACTIVE_BUTTON_KEY).setValue(message)
        );

        // Parse the message and add widgets to the responseStr in the order that
        // they were requested in the message.
        Stream.of(message.split(" ")).forEach((s -> {
            if (s.contains("header")) {
                CardHeader header = new CardHeader()
                        .setTitle(BOT_NAME)
                        .setSubtitle("Card header")
                        .setImageUrl(HEADER_IMAGE)
                        .setImageStyle("IMAGE");
                card.setHeader(header);
            } else if (s.contains("textparagraph")) {
                TextParagraph widget = new TextParagraph().setText("<b>This</b> is a <i>text paragraph</i>.");
                widgets.add(new WidgetMarkup().setTextParagraph(widget));
            } else if (s.contains("keyvalue")) {
                KeyValue widget = new KeyValue()
                        .setTopLabel("KeyValue widget")
                        .setContent("This is a KeyValue widget")
                        .setBottomLabel("The bottom label")
                        .setIcon("STAR");
                widgets.add(new WidgetMarkup().setKeyValue(widget));
            } else if (s.contains("interactivetextbutton")) {
                FormAction action = new FormAction()
                        .setActionMethodName(INTERACTIVE_TEXT_BUTTON_ACTION)
                        .setParameters(customParameters);
                OnClick onClick = new OnClick().setAction(action);
                TextButton button = new TextButton()
                        .setText("INTERACTIVE BUTTON")
                        .setOnClick(onClick);
                Button widget = new Button().setTextButton(button);
                widgets.add(new WidgetMarkup().setButtons(Collections.singletonList((widget))));
            } else if (s.contains("interactiveimagebutton")) {
                FormAction action = new FormAction()
                        .setActionMethodName(INTERACTIVE_IMAGE_BUTTON_ACTION)
                        .setParameters(customParameters);
                OnClick onClick = new OnClick().setAction(action);
                ImageButton button = new ImageButton()
                        .setIcon("EVENT_SEAT")
                        .setOnClick(onClick);
                Button widget = new Button().setImageButton(button);
                widgets.add(new WidgetMarkup().setButtons(Collections.singletonList((widget))));
            } else if (s.contains("textbutton")) {
                OpenLink openLink = new OpenLink().setUrl(REDIRECT_URL);
                OnClick onClick = new OnClick().setOpenLink(openLink);
                TextButton button = new TextButton()
                        .setText("TEXT BUTTON")
                        .setOnClick(onClick);
                Button widget = new Button().setTextButton(button);
                widgets.add(new WidgetMarkup().setButtons(Collections.singletonList((widget))));
            } else if (s.contains("imagebutton")) {
                OpenLink openLink = new OpenLink().setUrl(REDIRECT_URL);
                OnClick onClick = new OnClick().setOpenLink(openLink);
                ImageButton button = new ImageButton()
                        .setIcon("EVENT_SEAT")
                        .setOnClick(onClick);
                Button widget = new Button().setImageButton(button);
                widgets.add(new WidgetMarkup().setButtons(Collections.singletonList((widget))));
            } else if (s.contains("image")) {
                Image widget = new Image().setImageUrl("https://goo.gl/Bpa3Y5");
                widgets.add(new WidgetMarkup().setImage(widget));
            }
        }));

        Section section = new Section()
                .setWidgets(widgets);
        card.setSections(Collections.singletonList(section));
        return card;
    }

    /**
     * Creates a responseStr for when the user clicks on an interactive card.
     *
     * @param actionName name of action invoked
     * @param customParameterValue custom payload from event
     * @return a response card
     */
    private Card respondToInteractiveCardClick(String actionName, String customParameterValue) {
        // Determine which button the user clicked.
        String message = String.format("You clicked <u>%s</u>. <br> Your original message was \"%s\".",
                actionName.equals(INTERACTIVE_TEXT_BUTTON_ACTION) ? "a TextButton" : "an ImageButton",
                customParameterValue);

        Card card = new Card();
        CardHeader header = new CardHeader();
        header.setTitle(BOT_NAME)
                .setSubtitle("Interactive card click")
                .setImageUrl(HEADER_IMAGE)
                .setImageStyle("IMAGE");
        card.setHeader(header);
        TextParagraph text = new TextParagraph().setText(message);
        List<WidgetMarkup> widgets = Collections.singletonList
                (new WidgetMarkup().setTextParagraph(text));
        Section section = new Section()
                .setWidgets(widgets);
        card.setSections(Collections.singletonList(section));
        return card;
    }
}
// [END card-bot]
