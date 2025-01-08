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

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.common.collect.ImmutableMap;

import java.util.Optional;

import org.springframework.stereotype.Repository;

/** Service that saves and loads OAuth user tokens on Firestore. */
@Repository
public class FirestoreService {
  // The prefix used by the Google Chat API in the User resource name.
  private static final String USERS_PREFIX = "users/";

  // The name of the users collection in the database.
  private static final String USERS_COLLECTION = "users";

  private final Firestore db;

  /**
   * Initializes the Firestore database using Application Default Credentials.
   */
  public FirestoreService() {
    FirestoreOptions firestoreOptions =
        FirestoreOptions.newBuilder().setDatabaseId("auth-data").build();
    db = firestoreOptions.getService();
  }

  /**
   * Stores the user's access and refresh tokens in Firestore.
   * @param userName the user's name
   * @param tokens the user's tokens to be stored
   * @throws Exception if there is an error storing the tokens in Firestore
   */
  public void storeToken(String userName, Tokens tokens) throws Exception {
    ImmutableMap<String, Object> data = ImmutableMap.of(
        "accessToken", tokens.getAccessToken(),
        "refreshToken", tokens.getRefreshToken(),
        "expiryDate", tokens.getExpiryDate());
    db
        .collection(USERS_COLLECTION)
        .document(userName.replace(USERS_PREFIX, ""))
        .set(data)
        .get();
  }

  /**
   * Retrieves the user's access and refresh tokens from Firestore.
   * @param userName the user's name
   * @return an object containing the user's access and refresh tokens or an
   *     empty optional if the user does not exist in storage
   * @throws Exception if there is an error retrieving the tokens from Firestore
   */
  public Optional<Tokens> getToken(String userName) throws Exception {
    DocumentSnapshot doc = db
        .collection(USERS_COLLECTION)
        .document(userName.replace(USERS_PREFIX, ""))
        .get()
        .get();
    if (doc.exists()) {
      return Optional.of(new Tokens(
          doc.getString("accessToken"),
          doc.getString("refreshToken"),
          doc.getDate("expiryDate")));
    } else {
      return Optional.empty();
    }
  }
}
