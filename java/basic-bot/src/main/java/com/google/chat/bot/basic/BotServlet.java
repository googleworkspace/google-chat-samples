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
package com.google.chat.bot.basic;

// [START basic-bot]

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Responds to requests to /bot
 */
public class BotServlet extends HttpServlet {

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
    JsonNode jsonNode = mapper.readTree(requestStr);
    String eventType = jsonNode.get("type").asText();

    logger.info(eventType);

    String message = "";

    switch (eventType) {
      case "ADDED_TO_SPACE":
        String spaceType = jsonNode.get("space").get("type").asText();
        if (spaceType.contains("ROOM")) {
          message = String.format("Thanks for adding me to %s",
                  jsonNode.get("space").get("displayName").asText());
        } else {
          message = String.format("Thanks for adding me to a DM, %s!",
                  jsonNode.get("user").get("displayName").asText());
        }
        break;
      case "MESSAGE":
        message = String.format("Your message: %s\n",
                jsonNode.get("message").get("text").asText());
        break;
      case "REMOVED_FROM_SPACE":
        logger.info(String.format("Bot removed from %s",
                jsonNode.get("space").get("name").asText()));
        break;
      default:
        message = "Cannot determine event type";
        break;
    }

    JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(false);
    ObjectNode responseNode = jsonNodeFactory.objectNode();
    responseNode.put("text", message);
    resp.setContentType("application/json");

    resp.getWriter().print(responseNode.toString());
  }

}

// [END basic-bot]