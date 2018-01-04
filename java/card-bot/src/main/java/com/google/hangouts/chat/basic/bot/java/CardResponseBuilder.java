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

import java.util.Map;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Creates a card response to a Hangouts Chat message, in JSON format.
 *
 * See the documentation for more details:
 * https://developers.google.com/hangouts/chat/reference/message-formats/cards
 */
public class CardResponseBuilder {

  public static final String UPDATE_MESSAGE = "UPDATE_MESSAGE";
  public static final String NEW_MESSAGE = "NEW_MESSAGE";

  private JsonObject headerNode;
  private JsonObjectBuilder responseNode;
  private JsonArrayBuilder widgetsArray;
  private JsonArrayBuilder cardsArray;

  /**
   * Default public constructor.
   */
  public CardResponseBuilder() {
    this.responseNode = Json.createObjectBuilder();
    this.cardsArray = Json.createArrayBuilder();
    this.widgetsArray = Json.createArrayBuilder();
  }

  /**
   * Creates a new CardResponseBuilder object for responding to an interactive card click.
   *
   * @param updateType the update type, either UPDATE_MESSAGE or NEW_MESSAGE.
   */
  public CardResponseBuilder(String updateType) {
    this();
    responseNode.add("actionResponse", Json.createObjectBuilder()
            .add("type", updateType));
  }

  /**
   * Adds a header to the card response.
   *
   * @param title the header title
   * @param subtitle the header subtitle
   * @param imageUrl the header image
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder header(String title, String subtitle, String imageUrl) {
    this.headerNode = Json.createObjectBuilder()
            .add("header", Json.createObjectBuilder()
                    .add("title", title)
                    .add("subtitle", subtitle)
                    .add("imageUrl", imageUrl)
                    .add("imageStyle", "IMAGE"))
            .build();
    return this;
  }

  /**
   * Adds a TextParagraph widget to the card response.
   *
   * @param message the message in the text paragraph
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder textParagraph(String message) {
    this.widgetsArray.add(Json.createObjectBuilder()
            .add("textParagraph", Json.createObjectBuilder()
                    .add("text", message)));
    return this;
  }

  /**
   * Adds a KeyValue widget to the card response.
   *
   * For a list of icons that can be used, see:
   * https://developers.google.com/hangouts/chat/reference/message-formats/cards#builtinicons
   *
   * @param key the key or top label
   * @param value the value or content
   * @param bottomLabel the content below the key/value pair
   * @param iconName a specific icon
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder keyValue(String key, String value,
          String bottomLabel, String iconName) {
    this.widgetsArray.add(Json.createObjectBuilder()
            .add("keyValue", Json.createObjectBuilder()
                    .add("topLabel", key)
                    .add("content", value)
                    .add("bottomLabel", bottomLabel)
                    .add("icon", iconName)));
    return this;
  }

  /**
   * Adds an Image widget to the card response.
   *
   * @param imageUrl the URL of the image to display
   * @param redirectUrl the URL to open when the image is clicked.
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder image(String imageUrl, String redirectUrl) {
    this.widgetsArray.add(Json.createObjectBuilder()
            .add("image", Json.createObjectBuilder()
                    .add("imageUrl", imageUrl)
                    .add("onClick", Json.createObjectBuilder()
                            .add("openLink", Json.createObjectBuilder()
                                    .add("url", redirectUrl)))));
    return this;
  }

  /**
   * Adds a Text Button widget to the card response.
   *
   * When clicked, the button opens a link in the user's browser.
   *
   * @param text the text on the button
   * @param redirectUrl the link to open
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder textButton(String text, String redirectUrl) {
    this.widgetsArray.add(Json.createObjectBuilder()
            .add("buttons", Json.createArrayBuilder()
                    .add(Json.createObjectBuilder()
                            .add("textButton", Json.createObjectBuilder()
                                    .add("text", text)
                                    .add("onClick", Json.createObjectBuilder()
                                            .add("openLink", Json.createObjectBuilder()
                                                    .add("url", redirectUrl)))))));
    return this;
  }

  /**
   * Adds an Image Button widget to the card response.
   *
   * When clicked, the button opens a link in the user's browser.
   *
   * @param iconName the icon to display
   * @param redirectUrl the link to open
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder imageButton(String iconName, String redirectUrl) {
    this.widgetsArray.add(Json.createObjectBuilder()
            .add("buttons", Json.createArrayBuilder()
                    .add(Json.createObjectBuilder()
                            .add("imageButton", Json.createObjectBuilder()
                                    .add("icon", iconName)
                                    .add("onClick", Json.createObjectBuilder()
                                            .add("openLink", Json.createObjectBuilder()
                                                    .add("url", redirectUrl)))))));
    return this;
  }

  /**
   * Adds an interactive Text Button widget to the card response.
   *
   * When clicked, the button sends a new request to the bot, passing along the custom actionName
   * and parameter values. The actionName and parameter values are defined by the developer when the
   * widget is first declared (as shown below).
   *
   * @param text the text to display
   * @param actionName the custom action name
   * @param customActionParameters the custom key value pairs
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder interactiveTextButton(String text, String actionName,
          Map<String, String> customActionParameters) {

    // Define the custom action name and parameters for the interactive button.
    JsonObjectBuilder actionNode = Json.createObjectBuilder()
            .add("actionMethodName", actionName);

    if (customActionParameters != null && customActionParameters.size() > 0) {
      addCustomActionParameters(actionNode, customActionParameters);
    }

    this.widgetsArray.add(Json.createObjectBuilder()
            .add("buttons", Json.createArrayBuilder()
                    .add(Json.createObjectBuilder()
                            .add("textButton", Json.createObjectBuilder()
                                    .add("text", text)
                                    .add("onClick", Json.createObjectBuilder()
                                            .add("action", actionNode))))));
    return this;
  }

  /**
   * Adds an interactive Image Button widget to the card response.
   *
   * When clicked, the button sends a new request to the bot, passing along the custom actionName
   * and parameter values. The actionName and parameter values are defined by the developer when the
   * widget is first declared (as shown below).
   *
   * @param iconName the pre-defined icon to display.
   * @param actionName the custom action name
   * @param customActionParameters the custom key value pairs
   * @return this CardResponseBuilder
   */
  public CardResponseBuilder interactiveImageButton(String iconName, String actionName,
          Map<String, String> customActionParameters) {

    // Define the custom action name and parameters for the interactive button.
    JsonObjectBuilder actionNode = Json.createObjectBuilder()
            .add("actionMethodName", actionName);

    if (customActionParameters != null && customActionParameters.size() > 0) {
      addCustomActionParameters(actionNode, customActionParameters);
    }

    this.widgetsArray.add(Json.createObjectBuilder()
            .add("buttons", Json.createArrayBuilder()
                    .add(Json.createObjectBuilder()
                            .add("imageButton", Json.createObjectBuilder()
                                    .add("icon", iconName)
                                    .add("onClick", Json.createObjectBuilder()
                                            .add("action", actionNode))))));
    return this;
  }

  /**
   * Builds the card response and returns a JSON object node.
   *
   * @return card response as JSON-formatted string
   */
  public String build() {

    // If you want your header to appear before all other cards,
    // you must add it to the `cards` array as the first / 0th item.
    if (this.headerNode != null) {
      this.cardsArray.add(this.headerNode);
    }

    JsonObject cardsNode =
            responseNode.add("cards", this.cardsArray
                    .add(Json.createObjectBuilder()
                            .add("sections", Json.createArrayBuilder()
                                    .add(Json.createObjectBuilder()
                                            .add("widgets", this.widgetsArray)))))
                    .build();
    return cardsNode.toString();
  }

  /**
   * Applies sets of custom parameters to the parameter field of an action.
   * @param actionNode the JSON action node
   * @param customActionParameters the parameters to apply to the custom action
   */
  private void addCustomActionParameters(JsonObjectBuilder actionNode,
          Map<String, String> customActionParameters) {
    JsonArrayBuilder parametersArray = Json.createArrayBuilder();

    customActionParameters.forEach((k, v) -> {
      parametersArray.add(Json.createObjectBuilder()
              .add("key", k)
              .add("value", v));
    });

    actionNode.add("parameters", parametersArray);
  }
}
