package com.google.chat.userAuthApp;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.logging.Logger;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** Utility to verify that an HTTP request was sent by Google Chat. */
public class RequestVerifier {
  private static final Logger logger =
      Logger.getLogger(RequestVerifier.class.getName());

  private static final JsonFactory JSON_FACTORY =
      GsonFactory.getDefaultInstance();

  // Bearer Tokens received by Chat apps will always specify this issuer.
  private static final String CHAT_ISSUER = "chat@system.gserviceaccount.com";

  /**
   * Verifies that an HTTP request was sent by Google Chat.
   * @param authorization the value of the Authorization HTTP header
   * @return <code>>true</code> if the bearer token in the request is valid and
   *     sent by Google Chat to this server; <code>>false</code> otherwise.
   */
  public static boolean verifyGoogleChatRequest(String authorization) {
    // Extract the signed token sent by Google Chat from the request.
    String token = authorization.substring(7, authorization.length());
    // The ID token audience should correspond to the server URl.
    String audience = ServletUriComponentsBuilder
        .fromCurrentContextPath()
        .build()
        .toUriString()
        // Chat sends https request but AppEngine acts as a proxy and transforms
        // it to http. So, the audience should be https.
        .replace("http:", "https:");
    logger.info("Audience: " + audience);
    // Verify valid token, signed by CHAT_ISSUER, intended for this server.
    try {
      GoogleIdTokenVerifier verifier =
          new GoogleIdTokenVerifier
              .Builder(
                  GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY)
              .setAudience(Collections.singletonList(audience))
              .build();
      GoogleIdToken idToken = GoogleIdToken.parse(JSON_FACTORY, token);
      return idToken != null
          && verifier.verify(idToken)
          && idToken.getPayload().getEmailVerified()
          && idToken.getPayload().getEmail().equals(CHAT_ISSUER);
    } catch (Exception unused) {
      return false;
    }
  }
}
