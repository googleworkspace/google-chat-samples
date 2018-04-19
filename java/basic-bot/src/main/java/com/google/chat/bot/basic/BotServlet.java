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

import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.JsonGenerator;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.Key;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.Space;
import com.google.api.services.chat.v1.model.User;
import java.io.IOException;
import java.util.logging.Logger;
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
  private static final JsonFactory JSON_FACTORY =
      JacksonFactory.getDefaultInstance();

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
    Event event = JSON_FACTORY.fromReader(req.getReader(), Event.class);
    logger.info(event.toPrettyString());

    String replyText = "";
    switch (event.type) {
      case "ADDED_TO_SPACE":
        String spaceType = event.space.getType();
        if ("ROOM".equals(spaceType)) {
          replyText = String.format("Thanks for adding me to %s", event.space.getDisplayName());
        } else {
          replyText = String.format("Thanks for adding me to a DM, %s!",
              event.user.getDisplayName());
        }
        break;
      case "MESSAGE":
          replyText = String.format("Your message: %s", event.message.getText());
        break;
      case "REMOVED_FROM_SPACE":
        logger.info(String.format("Bot removed from %s", event.space.getName()));
        break;
      default:
        replyText = "Cannot determine event type";
        break;
    }

    resp.setContentType("application/json");
    Message reply = new Message()
        .setText(replyText);
    JsonGenerator jsonGenerator = JSON_FACTORY.createJsonGenerator(resp.getWriter());
    jsonGenerator.serialize(reply);
    jsonGenerator.close();
  }

  /**
   * Stub class for parsing Event JSON payloads.
   */
  public static class Event extends GenericJson {
    @Key
    public String type;
    @Key
    public String eventTime;
    @Key
    public Space space;
    @Key
    public User user;
    @Key
    public Message message;
    @Key
    public String token;
    @Key
    public String configCompleteRedirectUrl;
  }
}

// [END basic-bot]
