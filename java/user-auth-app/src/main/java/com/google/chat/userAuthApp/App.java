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
import com.google.chat.v1.Message;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;

import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

/**
 * The main class for the project, which implements a SpringBoot application
 * and REST controller to listen to HTTP requests from Chat events and the OAuth
 * flow callback.
 */
@SpringBootApplication
@RestController
public class App {
  private static final Logger logger = Logger.getLogger(App.class.getName());

  /** Executes the SpringBoot application. */
  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  private final OauthFlow oauthFlow;
  private final UserAuthPost userAuthPost;

  /** Initializes the app dependencies. */
  public App(OauthFlow oauthFlow, UserAuthPost userAuthPost) {
    this.oauthFlow = oauthFlow;
    this.userAuthPost = userAuthPost;
  }

  /** App route that handles unsupported GET requests. */
  @GetMapping("/")
  public String onGet() {
    return "Hello! This endpoint is meant to be called from Google Chat.";
  }

  /**
   * App route that handles callback requests from the OAuth authorization flow.
   * The handler exhanges the code received from the OAuth2 server with a set of
   * credentials, stores the authentication and refresh tokens in the database,
   * and redirects the request to the config complete URL from the request.
   */
  @GetMapping("/oauth2")
  public RedirectView onOauthCallback(
      @RequestParam("error") Optional<String> error,
      @RequestParam("code") Optional<String> code,
      @RequestParam("state") Optional<String> state) throws Exception {
    String redirectUrl = oauthFlow.oauth2callback(error, code, state);
    return new RedirectView(redirectUrl);
  }

  /** App route that responds to interaction events from Google Chat. */
  @PostMapping("/")
  public String onEvent(
      @RequestHeader("authorization") String authorization,
      @RequestBody JsonNode event) throws Exception {
    if (!RequestVerifier.verifyGoogleChatRequest(authorization)) {
      return "Hello! This endpoint is meant to be called from Google Chat.";
    }
    try {
      return toJson(userAuthPost.postWithUserCredentials(event));
    } catch (Exception e) {
      logger.log(
          Level.SEVERE, "Error calling Chat API: " + e.getMessage(), e);
      return toJson(
          Message
              .newBuilder()
              .setText("Error calling Chat API: " + e.getMessage())
              .build());
    }
  }

  /** Converts a protobuf Message to its JSON representation. */
  private static String toJson(com.google.protobuf.Message message) {
    try {
      return JsonFormat.printer().print(message);
    } catch (InvalidProtocolBufferException e) {
      throw new RuntimeException(
          "Application error: cannot convert message to JSON.", e);
    }
  }
}
