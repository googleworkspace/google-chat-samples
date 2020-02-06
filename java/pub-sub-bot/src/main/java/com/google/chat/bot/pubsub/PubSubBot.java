/*
  Copyright 2017 Google Inc.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
package com.google.chat.bot.pubsub;

// [START pub-sub-bot]
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.chat.v1.HangoutsChat;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.Thread;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.ServiceOptions;
import com.google.cloud.pubsub.v1.AckReplyConsumer;
import com.google.cloud.pubsub.v1.MessageReceiver;
import com.google.cloud.pubsub.v1.Subscriber;
import com.google.pubsub.v1.ProjectSubscriptionName;
import com.google.pubsub.v1.PubsubMessage;

import java.util.Optional;

/**
 * Creates a bot that subscribes to a Google Cloud Pub/Sub topic to
 * receive messages from Hangouts Chat. The bot then sends a simple response
 * back to Hangouts Chat.
 */
public class PubSubBot {

  public static void main(String[] args) {
    String projectId = ServiceOptions.getDefaultProjectId();
    String subscriptionId = System.getenv().get("SUBSCRIPTION_ID");
    ProjectSubscriptionName subscriptionName = ProjectSubscriptionName.of(projectId, subscriptionId);


    // Create a subscriber bound to the message receiver
    System.out.println("Starting subscriber...");
    EchoBot echoBot = new EchoBot();
    Subscriber subscriber = Subscriber.newBuilder(subscriptionName, echoBot).build();
    subscriber.startAsync().awaitRunning();

    // Wait for termination
    subscriber.awaitTerminated();
  }

  /**
   * A demo bot which implements {@link MessageReceiver} to receive messages. It simply echoes the
   * incoming messages.
   */
  static class EchoBot implements MessageReceiver {

    static final String BOT_NAME = "pubsub-bot-java";
    static final String CHAT_BOT_SCOPE = "https://www.googleapis.com/auth/chat.bot";

    EchoBot() {
    }

    /**
     * Bot implemetnation -- called when a message is received by the subscriber.
     *
     * @param pubsubMessage Message received via Cloud PubSub, contains chat message payload
     * @param consumer to ack/nack messages
     */
    @Override
    public void receiveMessage(PubsubMessage pubsubMessage, AckReplyConsumer consumer) {
      System.out.println("Id : " + pubsubMessage.getMessageId());
      // handle incoming message, then ack/nack the received message
      try {
        String content = pubsubMessage.getData().toStringUtf8();
        ObjectMapper mapper = new ObjectMapper();
        JsonNode chatEvent = mapper.readTree(content);

        Message reply = new Message();

        String eventType = chatEvent.path("type").asText();
        switch (eventType) {
          case "ADDED_TO_SPACE":
            // A bot can also be added to a room by @mentioning it in a message. In that case, we fall
            // through to the MESSAGE case and let the bot respond. If the bot was added using the
            // invite flow, we just post a thank you message in the space.
            if (!chatEvent.has("message")) {
              reply.setText("Thank you for adding me!");
              break;
            }
          case "MESSAGE":
            String userText = chatEvent.at("/message/text").asText();
            String threadName = chatEvent.at("/message/thread/name").asText();
            reply.setText(String.format("You said: %s", userText))
                    .setThread(new Thread().setName(threadName));
            break;
          default:
            // Nothing to reply with, just ack the message and stop
            consumer.ack();
            return;
        }

        // Send the reply message via chat API.
        String spaceName = chatEvent.at("/space/name").asText();
        GoogleCredentials credentials = GoogleCredentials.getApplicationDefault().createScoped(
                CHAT_BOT_SCOPE
        );
        HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
        HangoutsChat chatService = new HangoutsChat.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                requestInitializer)
                .setApplicationName(BOT_NAME)
                .build();

        chatService.spaces().messages().create(spaceName, reply).execute();x
        consumer.ack();
      } catch (Exception e) {
        e.printStackTrace();
        consumer.nack();
      }
    }
  }
}
// [END pub-sub-bot]
