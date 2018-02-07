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
import com.google.cloud.pubsub.v1.AckReplyConsumer;
import com.google.cloud.pubsub.v1.MessageReceiver;
import com.google.cloud.pubsub.v1.Subscriber;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.SubscriptionName;
import java.io.FileInputStream;
import java.util.Collections;

/**
 * Creates a bot that subscribes to a Google Cloud Pub/Sub topic to
 * receive messages from Hangouts Chat. The bot then sends a simple response
 * back to Hangouts Chat.
 */
public class Main {

  public static final String CREDENTIALS_PATH_ENV_PROPERTY = "GOOGLE_APPLICATION_CREDENTIALS";

  // Google Cloud Project ID
  public static final String PROJECT_ID = "YOUR-PROJECT-ID";

  // Cloud Pub/Sub Subscription ID
  public static final String SUBSCRIPTION_ID = "YOUR-SUBSCRIPTION";

  public static void main(String[] args) throws Exception {
    SubscriptionName subscriptionName = SubscriptionName.create(PROJECT_ID, SUBSCRIPTION_ID);

    // Instantiate bot, which implements an asynchronous message receiver.
    EchoBot echoBot = new EchoBot();

    // Create a subscriber for "my-subscription-id" bound to the message receiver
    final Subscriber subscriber = Subscriber.defaultBuilder(subscriptionName, echoBot).build();
    System.out.println("Starting subscriber...");
    subscriber.startAsync();

    // Wait for termination
    subscriber.awaitTerminated();
  }
}

/**
 * A demo bot which implements {@link MessageReceiver} to receive messages. It simply echoes the
 * incoming messages.
 */
class EchoBot implements MessageReceiver {

  // Path to the private key JSON file of the service account to be used for posting response
  // messages to Hangouts Chat.
  // In this demo, we are using the same service account for authorizing with Cloud Pub/Sub to
  // receive messages and authorizing with Hangouts Chat to post messages. If you are using
  // different service accounts, please set the path to the private key JSON file of the service
  // account used to post messages to Hangouts Chat here.
  private static final String SERVICE_ACCOUNT_KEY_PATH =
      System.getenv(Main.CREDENTIALS_PATH_ENV_PROPERTY);

  // Developer code for Hangouts Chat api scope.
  private static final String HANGOUTS_CHAT_API_SCOPE = "https://www.googleapis.com/auth/chat.bot";

  // Response URL Template with placeholders for space id.
  private static final String RESPONSE_URL_TEMPLATE =
      "https://chat.googleapis.com/v1/__SPACE_ID__/messages";

  // Response echo message template.
  private static final String RESPONSE_TEMPLATE = "You said: `__MESSAGE__`";

  private static final String ADDED_RESPONSE = "Thank you for adding me!";

  GoogleCredential credential;
  HttpTransport httpTransport;
  HttpRequestFactory requestFactory;

  EchoBot() throws Exception {
    credential =
        GoogleCredential.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
            .createScoped(Collections.singleton(HANGOUTS_CHAT_API_SCOPE));
    httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    requestFactory = httpTransport.createRequestFactory(credential);
  }

  // Called when a message is received by the subscriber.
  @Override
  public void receiveMessage(PubsubMessage pubsubMessage, AckReplyConsumer consumer) {
    System.out.println("Id : " + pubsubMessage.getMessageId());
    // handle incoming message, then ack/nack the received message
    try {
      ObjectMapper mapper = new ObjectMapper();
      JsonNode dataJson = mapper.readTree(pubsubMessage.getData().toStringUtf8());
      System.out.println("Data : " + dataJson.toString());
      handle(dataJson);
      consumer.ack();
    } catch (Exception e) {
      System.out.println(e);
      consumer.nack();
    }
  }

  public void handle(JsonNode eventJson) throws Exception {
    JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(false);
    ObjectNode responseNode = jsonNodeFactory.objectNode();

    // Construct the response depending on the event received.

    String eventType = eventJson.get("type").asText();
    switch (eventType) {
      case "ADDED_TO_SPACE":
        responseNode.put("text", ADDED_RESPONSE);
        // A bot can also be added to a room by @mentioning it in a message. In that case, we fall
        // through to the MESSAGE case and let the bot respond. If the bot was added using the
        // invite flow, we just post a thank you message in the space.
        if(!eventJson.has("message")) {
          break;
        }
      case "MESSAGE":
        responseNode.put("text",
            RESPONSE_TEMPLATE.replaceFirst(
                "__MESSAGE__", eventJson.get("message").get("text").asText()));
        // In case of message, post the response in the same thread.
        ObjectNode threadNode = jsonNodeFactory.objectNode();
        threadNode.put("name", eventJson.get("message").get("thread").get("name").asText());
        responseNode.put("thread", threadNode);
        break;
      case "REMOVED_FROM_SPACE":
      default:
        // Do nothing
        return;
    }

    // Post the response to Hangouts Chat.

    String URI =
        RESPONSE_URL_TEMPLATE.replaceFirst(
            "__SPACE_ID__", eventJson.get("space").get("name").asText());
    GenericUrl url = new GenericUrl(URI);

    HttpContent content =
        new ByteArrayContent("application/json", responseNode.toString().getBytes("UTF-8"));
    HttpRequest request = requestFactory.buildPostRequest(url, content);
    com.google.api.client.http.HttpResponse response = request.execute();
  }
}

// [END pub-sub-bot]