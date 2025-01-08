/**
 * Copyright 2025 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.chat.userAuthApp;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.api.gax.rpc.StatusCode.Code;
import com.google.chat.v1.ActionResponse;
import com.google.chat.v1.ChatServiceClient;
import com.google.chat.v1.ChatServiceSettings;
import com.google.chat.v1.CreateMessageRequest;
import com.google.chat.v1.CreateMessageRequest.MessageReplyOption;
import com.google.chat.v1.Message;
import com.google.chat.v1.Thread;

import java.util.Optional;

import org.springframework.stereotype.Component;

/**
 * Service that posts a message to a Google Chat space using the credentials of
 * the calling user.
 */
@Component
public class UserAuthPost {

  private final FirestoreService firestoreService;
  private final OauthFlow oauthFlow;

  /** Initializes the Service. */
  public UserAuthPost(FirestoreService firestoreService, OauthFlow oauthFlow) {
    this.firestoreService = firestoreService;
    this.oauthFlow = oauthFlow;
  }

  /**
   * Posts a message to a Google Chat space by calling the Chat API with user
   * credentials.
   * The message is posted to the same space as the received event.
   * If the user has not authorized the app to use their credentials yet,
   * instead of posting the message, this functions returns a configuration
   * request to start the OAuth authorization flow.
   * @param event The event received from Google Chat.
   * @return An ActionResponse message requesting additional configuration if
   *     the app needs authorization from the user. Otherwise, an empty object.
   * @throws Exception if there is a database, authentication, or API failure.
   */
  public Message postWithUserCredentials(JsonNode event) throws Exception {
    String spaceName =
        event.get("space").get("name").textValue();
    String userName =
        event.get("user").get("name").textValue();
    String displayName =
        event.get("user").get("displayName").textValue();
    String text =
        event.get("message").get("text").textValue();
    String threadName = event
        .get("message")
        .get("thread")
        .get("name")
        .textValue();

    // Try to obtain existing OAuth2 tokens from storage.
    Optional<Tokens> tokens = firestoreService.getToken(userName);
    if (tokens.isEmpty()) {
      // App doesn't have tokens for the user yet.
      // Request configuration to obtain OAuth2 tokens.
      return getConfigRequest(event);
    }

    // Create the ChatServiceSettings with the user credentials
    ChatServiceSettings chatServiceSettings = ChatServiceSettings
        .newBuilder()
        .setCredentialsProvider(
             FixedCredentialsProvider.create(
                oauthFlow.createUserCredentials(tokens.get())))
        .build();
    // Create a Chat message using the Chat API.
    try (ChatServiceClient chatServiceClient =
        ChatServiceClient.create(chatServiceSettings)) {
      CreateMessageRequest request = CreateMessageRequest.newBuilder()
        // The space to create the message in.
        .setParent(spaceName)
        // Respond in the same thread.
        .setMessageReplyOption(
            MessageReplyOption.REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD)
        // The message to create.
        .setMessage(
            Message
                .newBuilder()
                .setText(String.format("%s said: %s", displayName, text))
                .setThread(Thread.newBuilder().setName(threadName)))
        .build();
      try {
        // Call Chat API.
        chatServiceClient.createMessage(request);
      } catch (ApiException e) {
        if (e.getStatusCode().getCode().equals(Code.UNAUTHENTICATED)) {
          // This error probably happened because the user revoked the
          // authorization. So, let's request configuration again.
          return getConfigRequest(event);
        }
        throw e;
      }
    }
    return Message.getDefaultInstance();
  }

  /**
   * Returns an action response that tells Chat to request configuration for the
   * app. The configuration will be tied to the user who sent the event.
   * @param event The event received from Google Chat.
   * @return An ActionResponse message request additional configuration.
   */
  private Message getConfigRequest(JsonNode event) throws Exception {
    String authUrl = oauthFlow.getAuthorizationUrl(
        event.get("user").get("name").textValue(),
        event.get("configCompleteRedirectUrl").textValue());
    return Message.newBuilder().setActionResponse(
        ActionResponse.newBuilder()
            .setType(ActionResponse.ResponseType.REQUEST_CONFIG)
            .setUrl(authUrl))
        .build();
  }
}
