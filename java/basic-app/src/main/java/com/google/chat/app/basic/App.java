/**
 * Copyright 2017 Google Inc.
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
package com.google.chat.app.basic;

import java.util.Collections;
import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GooglePublicKeysManager;
import com.google.api.client.http.apache.ApacheHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.chat.v1.model.Message;

@SpringBootApplication
@RestController
public class App {

  // Authentication audience (either APP_URL or PROJECT_NUMBER)
  static String AUDIENCE_TYPE = "AUDIENCE_TYPE";

  // Intended audience of the token:
  // - The URL of the app when AUDIENCE_TYPE is set to APP_URL
  // - The project number when AUDIENCE_TYPE is set to PROJECT_NUMBER
  static String AUDIENCE = "AUDIENCE";

  private static final Logger logger = Logger.getLogger(App.class.getName());

  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }

  // Returns a simple text message app response based on the type of triggering event
  @PostMapping("/")
  @ResponseBody
  public Message onEvent(
      @RequestBody JsonNode event, @RequestHeader("Authorization") String authorization)
      throws Exception {
    String replyText = "";
    if (!verifyChatAppRequest(
        authorization.substring("Bearer ".length(), authorization.length()))) {
      replyText = "Failed verification!";
    } else {
      switch (event.get("type").asText()) {
        case "ADDED_TO_SPACE":
          String spaceType = event.at("/space/type").asText();
          if ("ROOM".equals(spaceType)) {
            String displayName = event.at("/space/displayName").asText();
            replyText = String.format("Thanks for adding me to %s", displayName);
          } else {
            String displayName = event.at("/user/displayName").asText();
            replyText = String.format("Thanks for adding me to a DM, %s!", displayName);
          }
          break;
        case "MESSAGE":
          String message = event.at("/message/text").asText();
          replyText = String.format("Your message: %s", message);
          break;
        case "REMOVED_FROM_SPACE":
          String name = event.at("/space/name").asText();
          logger.info(String.format("App removed from %s", name));
          break;
        default:
          replyText = "Cannot determine event type";
      }
    }

    return new Message().setText(replyText);
  }

  private boolean verifyChatAppRequest(String bearer) throws Exception {
    if ("APP_URL".equals(AUDIENCE_TYPE)) {
      // [START chat_request_verification_app_url]

      String CHAT_ISSUER = "chat@system.gserviceaccount.com";
      JsonFactory factory = JacksonFactory.getDefaultInstance();

      GoogleIdTokenVerifier verifier =
          new GoogleIdTokenVerifier.Builder(new ApacheHttpTransport(), factory)
              .setAudience(Collections.singletonList(AUDIENCE))
              .build();

      GoogleIdToken idToken = GoogleIdToken.parse(factory, bearer);
      return idToken != null
          && verifier.verify(idToken)
          && idToken.getPayload().getEmailVerified()
          && idToken.getPayload().getEmail().equals(CHAT_ISSUER);

      // [END chat_request_verification_app_url]
    } else if ("PROJECT_NUMBER".equals(AUDIENCE_TYPE)) {
      // [START chat_request_verification_project_number]

      String CHAT_ISSUER = "chat@system.gserviceaccount.com";
      JsonFactory factory = JacksonFactory.getDefaultInstance();

      GooglePublicKeysManager keyManagerBuilder =
          new GooglePublicKeysManager.Builder(new ApacheHttpTransport(), factory)
              .setPublicCertsEncodedUrl(
                  "https://www.googleapis.com/service_accounts/v1/metadata/x509/" + CHAT_ISSUER)
              .build();

      GoogleIdTokenVerifier verifier =
          new GoogleIdTokenVerifier.Builder(keyManagerBuilder).setIssuer(CHAT_ISSUER).build();

      GoogleIdToken idToken = GoogleIdToken.parse(factory, bearer);
      return idToken != null
          && verifier.verify(idToken)
          && idToken.verifyAudience(Collections.singletonList(AUDIENCE))
          && idToken.verifyIssuer(CHAT_ISSUER);

      // [END chat_request_verification_project_number]
    }

    // Skip verification if AUDIENCE_TYPE is not set with supported value
    return true;
  }
}
