/**
 * Copyright 2022 Google Inc.
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
package com.google.chat.webhook;

// [START hangouts_chat_webhook]
import com.google.gson.Gson;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.net.URI;

public class App {
  private static final String URL = "https://chat.googleapis.com/v1/spaces/AAAAGCYeSRY/messages";
  private static final Gson gson = new Gson();
  private static final HttpClient client = HttpClient.newHttpClient();

  public static void main(String[] args) throws Exception {
    String message = gson.toJson(Map.of("text", "Hello from Java!"));

    HttpRequest request = HttpRequest.newBuilder(URI.create(URL))
      .header("accept", "application/json; charset=UTF-8")
      .POST(HttpRequest.BodyPublishers.ofString(message)).build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

    System.out.println(response.body());
  }
}
// [END hangouts_chat_webhook]
