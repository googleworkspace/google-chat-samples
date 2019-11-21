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
package com.google.chat.bot.basic.async;

// [START async-bot]


import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.chat.v1.HangoutsChat;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.Thread;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.logging.Logger;

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
  public void onEvent(@RequestBody JsonNode event) throws IOException, GeneralSecurityException {
    String replyText = "";
    JsonNode space = event.get("space");
    switch (event.get("type").asText()) {
      case "ADDED_TO_SPACE":
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
    // [START async-response]
    String spaceName = space.get("name").asText();
    Message reply = new Message().setText(replyText);
    // If replying to a message, set thread name to keep conversation together
    if (event.has("message")) {
      String threadName = event.get("message").get("thread").get("name").asText();
      Thread thread = new Thread().setName(threadName);
      reply.setThread(thread);
    }
    GoogleCredentials credentials = GoogleCredentials.fromStream(
            Bot.class.getResourceAsStream("/service-acct.json")
    ).createScoped("https://www.googleapis.com/auth/chat.bot");
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
    HangoutsChat chatService = new HangoutsChat.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            JacksonFactory.getDefaultInstance(),
            requestInitializer)
            .setApplicationName("basic-async-bot-java")
            .build();
    chatService.spaces().messages().create(spaceName, reply).execute();
    // [END async-response]
  }
}

// [END async-bot]