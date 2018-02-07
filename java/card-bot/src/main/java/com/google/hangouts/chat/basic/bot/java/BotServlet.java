/**
 * Copyright 2017 Google Inc.
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
package com.google.hangouts.chat.basic.bot.java;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Stream;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Responds to requests to /bot.
 */
public class BotServlet extends HttpServlet {

  private static final Logger logger =
          Logger.getLogger(BotServlet.class.getName());

  private static final String INTERACTIVE_TEXT_BUTTON_ACTION = "doTextButtonAction";
  private static final String INTERACTIVE_IMAGE_BUTTON_ACTION = "doImageButtonAction";
  private static final String INTERACTIVE_BUTTON_KEY = "originalMessage";
  private static final String HEADER_IMAGE = "https://goo.gl/5obRKj";
  private static final String BOT_NAME = "Card Bot Java";
  private static final String REDIRECT_URL = "https://goo.gl/kwhSNz";

  /**
   * Handles a GET request to the /bot endpoint.
   *
   * @param req the request
   * @param resp the responseStr
   * @throws IOException
   */
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
          throws IOException {
    resp.sendRedirect("index.html");
  }

  /**
   * Handles a POST request to the /bot endpoint.
   *
   * @param req the request
   * @param resp the response
   * @throws ServletException
   * @throws IOException
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
          throws ServletException, IOException {

    JsonReader jsonReader = Json.createReader(req.getReader());
    JsonObject eventObject = jsonReader.readObject();
    String eventType = eventObject.getString("type");

    logger.info(eventObject.toString());
    logger.info(eventType);

    String responseStr = "";

    switch (eventType) {
      case "ADDED_TO_SPACE":
        String spaceType = eventObject.getJsonObject("space").getString("type");

        if (spaceType.contains("ROOM")) {
          responseStr = Json.createObjectBuilder()
                  .add("text", String.format("Thanks for adding me to %s",
                          eventObject.getJsonObject("space").getString("name")))
                  .build()
                  .toString();
        } else {
          responseStr = Json.createObjectBuilder()
                  .add("text", String.format("Thanks for adding me to a DM, %s",
                          eventObject.getJsonObject("user").getString("displayName")))
                  .build()
                  .toString();
        }
        break;

      case "MESSAGE":
        responseStr = createCardResponse(eventObject.getJsonObject("message").getString("text"));
        logger.info(responseStr);
        break;

      case "CARD_CLICKED":
        // Get the custom action name and custom parameter value out of the event object.
        String actionName = eventObject.getJsonObject("action").getString("actionMethodName");
        String customParameterValue = eventObject.getJsonObject("action")
                .getJsonArray("parameters").get(0).asJsonObject().getString("value");

        responseStr = respondToInteractiveCardClick(actionName, customParameterValue);
        logger.info(responseStr);
        break;

      case "REMOVED_FROM_SPACE":
        logger.info(String.format("Bot removed from %s",
                eventObject.getJsonObject("space").getString("name")));
        break;

      default:
        responseStr = Json.createObjectBuilder()
                .add("text", String.format("Cannot determine event type %s", eventType))
                .build()
                .toString();
        break;
    }

    resp.setContentType("application/json");
    resp.getWriter().print(responseStr);
  }

  /**
   * Creates a card-formatted response based on the message sent in Hangouts Chat.
   *
   * See the reference for JSON keys and format for cards:
   * https://developers.google.com/hangouts/chat/reference/message-formats/cards
   *
   * @param eventNode the event object sent from Hangouts Chat
   * @return a card responseStr as a JSON object node
   */
  private String createCardResponse(String eventMessage) {

    CardResponseBuilder builder = new CardResponseBuilder();
    Map<String, String> customParameters = new HashMap();
    customParameters.put(INTERACTIVE_BUTTON_KEY, eventMessage);

    // Parse the message and add widgets to the responseStr in the order that
    // they were requested in the message.
    Stream.of(eventMessage.split(" "))
            .forEach((s -> {
              if (s.contains("header")) {
                builder.header(BOT_NAME, "Card header", HEADER_IMAGE);

              } else if (s.contains("textparagraph")) {
                builder.textParagraph("<b>This</b> is a <i>text paragraph</i>.");

              } else if (s.contains("keyvalue")) {
                builder.keyValue("KeyValue widget", "This is a KeyValue widget",
                        "The bottom label", "STAR");

              } else if (s.contains("interactivetextbutton")) {
                builder.interactiveTextButton("INTERACTIVE BUTTON", INTERACTIVE_TEXT_BUTTON_ACTION,
                        customParameters);

              } else if (s.contains("interactiveimagebutton")) {
                builder.interactiveImageButton("EVENT_SEAT", INTERACTIVE_IMAGE_BUTTON_ACTION,
                        customParameters);

              } else if (s.contains("textbutton")) {
                builder.textButton("TEXT BUTTON", REDIRECT_URL);

              } else if (s.contains("imagebutton")) {
                builder.imageButton("EVENT_SEAT", REDIRECT_URL);

              } else if (s.contains("image")) {
                builder.image("https://goo.gl/Bpa3Y5", REDIRECT_URL);
              }
            }));

    return builder.build();
  }

  /**
   * Creates a responseStr for when the user clicks on an interactive card.
   *
   * @param jsonNode the responseStr to the user.
   * @return a responseStr message
   */
  private String respondToInteractiveCardClick(String actionName, String customParameterValue) {

    // Determine which button the user clicked.
    String message = String.format("You clicked <u>%s</u>. <br> Your original message was \"%s\".",
            actionName.equals(INTERACTIVE_TEXT_BUTTON_ACTION) ? "a TextButton" : "an ImageButton",
            customParameterValue);

    CardResponseBuilder builder = new CardResponseBuilder(CardResponseBuilder.UPDATE_MESSAGE);
    builder.header(BOT_NAME, "Interactive card click", HEADER_IMAGE);
    builder.textParagraph(message);

    return builder.build();
  }
}
