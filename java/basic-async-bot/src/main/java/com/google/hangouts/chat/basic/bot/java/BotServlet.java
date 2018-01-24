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

// [START async-bot]

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.ByteArrayContent;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpContent;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestFactory;
import com.google.api.client.http.HttpTransport;
import java.io.BufferedReader;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Responds to requests to /bot.
 */
public class BotServlet extends HttpServlet {

  // Hangouts Chat scope for bots.
  private final List<String> SCOPE = Arrays.asList("https://www.googleapis.com/auth/chat.bot");

  // Response URL Template with placeholders for space id.
  private static final String RESPONSE_URL_TEMPLATE =
          "https://chat.googleapis.com/v1/%s/messages";

  private static final Logger logger =
          Logger.getLogger(BotServlet.class.getName());

  /**
   * Handles a GET request to the /bot endpoint.
   *
   * @param req the request
   * @param resp the response
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

    String requestStr;

    try (BufferedReader br = req.getReader()) {
      requestStr = br.lines().collect(Collectors.joining(System.lineSeparator()));
    }

    logger.info(requestStr);

    ObjectMapper mapper = new ObjectMapper();
    JsonNode eventNode = mapper.readTree(requestStr);

    // Log a message and exit if the bot was removed from a room.
    if (eventNode.get("type").asText().contains("REMOVED_FROM_SPACE")) {
      logger.info(String.format("Bot removed from %s",
              eventNode.get("space").get("name").asText()));
      return;
    }

    // Build response.
    ObjectNode responseNode = createResponse(eventNode);
    String spaceNameUrl = String.format(RESPONSE_URL_TEMPLATE,
            eventNode.get("space").get("name").asText());
    GenericUrl url = new GenericUrl(spaceNameUrl);

    try {
      sendAsyncResponse(responseNode, url);

    } catch (GeneralSecurityException ex) {
      Logger.getLogger(BotServlet.class.getName()).log(Level.SEVERE, null, ex);
    }
  }

  /**
   * Formats the response to send back to Hangouts Chat.
   *
   * @param event the event object from the request from Hangouts Chat
   * @return a response payload.
   */
  private ObjectNode createResponse(JsonNode event) {
    String eventType = event.get("type").asText();

    logger.info(eventType);

    // Build response message.
    JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(false);
    ObjectNode responseNode = jsonNodeFactory.objectNode();

    String senderName = event.get("user").get("displayName").asText();
    String spaceType = event.get("space").get("type").asText();
    String message = "";

    switch (eventType) {
      case "ADDED_TO_SPACE":
        if (spaceType.contains("ROOM")) {

          message = String.format("Thanks for adding me to %s",
                  event.get("space").get("displayName").asText());

          // Respond to the same thread where the bot was mentioned.
          JsonNode threadNode = event.get("message").get("thread");
          responseNode.set("thread", threadNode);

        } else {
          message = String.format("Thanks for adding me to a DM, %s!",
                  senderName);
        }
        break;
      case "MESSAGE":
        message = String.format("Your message, %s: %s\n",
                senderName, event.get("message").get("text").asText());

        // Get the thread ID and add it to the response. This allows
        // us to respond back to the thread that raised the event.
        // If you want to post a new message to the room, omit
        // these next two lines of code.
        JsonNode threadNode = event.get("message").get("thread");
        responseNode.set("thread", threadNode);
        break;

      default:
        message = "Cannot determine event type";
        break;
    }

    responseNode.put("text", message);
    return responseNode;
  }

  // [START async-response]

  /**
   * Sends a response back to the Hangouts Chat room asynchronously.
   *
   * @param responseNode the response payload
   * @param url the URL of the Hangouts Chat room
   * @throws GeneralSecurityException
   * @throws IOException
   */
  private void sendAsyncResponse(ObjectNode responseNode, GenericUrl url)
          throws GeneralSecurityException, IOException {

    // If you deploy this code to Google App Engine, you can use the following
    // commented-out line of code to retrieve your service account credentials.
    //AppIdentityCredential credential = new AppIdentityCredential(SCOPE);
    GoogleCredential credential = GoogleCredential
            .fromStream(BotServlet.class.getResourceAsStream("/service-acct.json"))
            .createScoped(SCOPE);

    HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    HttpRequestFactory requestFactory = httpTransport.createRequestFactory(credential);

    HttpContent content =
            new ByteArrayContent("application/json", responseNode.toString().getBytes("UTF-8"));
    HttpRequest request = requestFactory.buildPostRequest(url, content);
    request.execute();
  }

  // [END async-response]

}

// [END async-bot]