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
import com.google.api.services.chat.v1.model.Message;
import java.util.logging.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Bot {
  private static final Logger logger =  Logger.getLogger(Bot.class.getName());

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
    String replyText = "";
    switch (event.get("type").asText()) {
      case "ADDED_TO_SPACE":
        JsonNode space = event.get("space");
        String spaceType = space.get("type").asText();
        if ("ROOM".equals(spaceType)) {
          String displayName = space.get("displayName").asText();
          replyText = String.format("Thanks for adding me to %s", displayName);
        } else {
          String displayName = event.get("user").get("displayName").asText();
          replyText = String.format("Thanks for adding me to a DM, %s!", displayName);
        }
        break;
      case "MESSAGE":
        String message = event.get("message").get("text").asText();
        replyText = String.format("Your message: %s", message);
        break;
      case "REMOVED_FROM_SPACE":
        String name = event.get("space").get("name").asText();
        logger.info(String.format("Bot removed from %s", name));
        break;
      default:
        replyText = "Cannot determine event type";
        break;
    }
    Message reply = new Message().setText(replyText);
    return reply;
  }
}
// [END basic-bot]
