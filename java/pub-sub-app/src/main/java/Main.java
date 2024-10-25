/*
  Copyright 2024 Google LLC
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

// [START chat_pub_sub_main]
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.chat.v1.ChatServiceClient;
import com.google.chat.v1.ChatServiceSettings;
import com.google.chat.v1.CreateMessageRequest;
import com.google.chat.v1.CreateMessageRequest.MessageReplyOption;
import com.google.chat.v1.Message;
import com.google.chat.v1.Thread;
import com.google.cloud.pubsub.v1.AckReplyConsumer;
import com.google.cloud.pubsub.v1.MessageReceiver;
import com.google.cloud.pubsub.v1.Subscriber;
import com.google.pubsub.v1.ProjectSubscriptionName;
import com.google.pubsub.v1.PubsubMessage;
import java.io.FileInputStream;
import java.util.Collections;

public class Main {

  public static final String PROJECT_ID_ENV_PROPERTY = "PROJECT_ID";
  public static final String SUBSCRIPTION_ID_ENV_PROPERTY = "SUBSCRIPTION_ID";
  public static final String CREDENTIALS_PATH_ENV_PROPERTY = "GOOGLE_APPLICATION_CREDENTIALS";

  public static void main(String[] args) throws Exception {
    ProjectSubscriptionName subscriptionName = ProjectSubscriptionName.of(
      System.getenv(Main.PROJECT_ID_ENV_PROPERTY),
      System.getenv(Main.SUBSCRIPTION_ID_ENV_PROPERTY));

    // Instantiate app, which implements an asynchronous message receiver.
    EchoApp echoApp = new EchoApp();

    // Create a subscriber for <var>SUBSCRIPTION_ID</var> bound to the message receiver
    final Subscriber subscriber = Subscriber.newBuilder(subscriptionName, echoApp).build();
    System.out.println("Subscriber is listening to events...");
    subscriber.startAsync();

    // Wait for termination
    subscriber.awaitTerminated();
  }
}

/**
 * A demo app which implements {@link MessageReceiver} to receive messages. It simply echoes the
 * incoming messages.
 */
class EchoApp implements MessageReceiver {

  // Path to the private key JSON file of the service account to be used for posting response
  // messages to Google Chat.
  // In this demo, we are using the same service account for authorizing with Cloud Pub/Sub to
  // receive messages and authorizing with Google Chat to post messages. If you are using
  // different service accounts, please set the path to the private key JSON file of the service
  // account used to post messages to Google Chat here.
  private static final String SERVICE_ACCOUNT_KEY_PATH =
    System.getenv(Main.CREDENTIALS_PATH_ENV_PROPERTY);

  // Developer code for Google Chat API scope.
  private static final String GOOGLE_CHAT_API_SCOPE = "https://www.googleapis.com/auth/chat.bot";

  private static final String ADDED_RESPONSE = "Thank you for adding me!";

  ChatServiceClient chatServiceClient;

  EchoApp() throws Exception {
    GoogleCredentials credential = GoogleCredentials
      .fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
      .createScoped(Collections.singleton(GOOGLE_CHAT_API_SCOPE));

    // Create the ChatServiceSettings with the app credentials
    ChatServiceSettings chatServiceSettings = ChatServiceSettings.newBuilder()
      .setCredentialsProvider(FixedCredentialsProvider.create(credential)).build();

    // Set the Chat service client
    chatServiceClient = ChatServiceClient.create(chatServiceSettings);
  }

  // Called when a message is received by the subscriber.
  @Override
  public void receiveMessage(PubsubMessage pubsubMessage, AckReplyConsumer consumer) {
    System.out.println("Id : " + pubsubMessage.getMessageId());
    // Handle incoming message, then ack/nack the received message
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

  // Send message to Google Chat based on the type of event.
  public void handle(JsonNode eventJson) throws Exception {
    CreateMessageRequest createMessageRequest;
    switch (eventJson.get("type").asText()) {
      case "ADDED_TO_SPACE":
        // An app can also be added to a space by @mentioning it in a message. In that case, we fall
        // through to the MESSAGE case and let the app respond. If the app was added using the
        // invite flow, we just post a thank you message in the space.
        if (!eventJson.has("message")) {
          createMessageRequest = CreateMessageRequest.newBuilder()
            .setParent(eventJson.get("space").get("name").asText())
            .setMessage(Message.newBuilder().setText(ADDED_RESPONSE).build()).build();
          break;
        }
      case "MESSAGE":
        // In case of message, post the response in the same thread.
        createMessageRequest = CreateMessageRequest.newBuilder()
          .setParent(eventJson.get("space").get("name").asText())
          .setMessageReplyOption(MessageReplyOption.REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD)
          .setMessage(Message.newBuilder()
            .setText("You said: `" + eventJson.get("message").get("text").asText() + "`")
            .setThread(Thread.newBuilder()
              .setName(eventJson.get("message").get("thread").get("name").asText())
              .build()).build()).build();
        break;
      case "REMOVED_FROM_SPACE":
      default:
        // Do nothing
        return;
    }

    // Post the response to Google Chat.
    chatServiceClient.createMessage(createMessageRequest);
  }
}
// [END chat_pub_sub_main]
