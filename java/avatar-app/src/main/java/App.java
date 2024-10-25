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

// [START chat_avatar_app]
import java.util.List;

import com.google.api.services.chat.v1.model.CardWithId;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Card;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1CardHeader;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Image;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Section;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1TextParagraph;
import com.google.api.services.chat.v1.model.GoogleAppsCardV1Widget;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.User;
import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class App implements HttpFunction {
  private static final Gson gson = new Gson();

  // The ID of the slash command "/about".
  // It's not enabled by default, set to the actual ID to enable it. You need to
  // use the same ID as set in the Google Chat API configuration.
  private static final String ABOUT_COMMAND_ID = "";

  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    JsonObject body = gson.fromJson(request.getReader(), JsonObject.class);

    if (request.getMethod().equals("GET") || !body.has("message")) {
      response.getWriter().write("Hello! This function must be called from Google Chat.");
      return;
    }

    // [START chat_avatar_slash_command]
    // Checks for the presence of a slash command in the message.
    if (body.getAsJsonObject("message").has("slashCommand")) {
      // Executes the slash command logic based on its ID.
      // Slash command IDs are set in the Google Chat API configuration.
      JsonObject slashCommand = body.getAsJsonObject("message").getAsJsonObject("slashCommand");
      switch (slashCommand.get("commandId").getAsString()) {
        case ABOUT_COMMAND_ID:
          Message aboutMessage = new Message();
          aboutMessage.setText("The Avatar app replies to Google Chat messages.");
          aboutMessage.setPrivateMessageViewer(new User()
            .setName(body.getAsJsonObject("user").get("name").getAsString()));
          response.getWriter().write(gson.toJson(aboutMessage));
          return;
      }
    }
    // [END chat_avatar_slash_command]

    JsonObject sender = body.getAsJsonObject("message").getAsJsonObject("sender");
    String displayName = sender.has("displayName") ? sender.get("displayName").getAsString() : "";
    String avatarUrl = sender.has("avatarUrl") ? sender.get("avatarUrl").getAsString() : "";
    Message message = createMessage(displayName, avatarUrl);
    response.getWriter().write(gson.toJson(message));
  }

  Message createMessage(String displayName, String avatarUrl) {
    return new Message()
      .setText("Here's your avatar")
      .setCardsV2(List.of(new CardWithId()
        .setCardId("previewLink")
        .setCard(new GoogleAppsCardV1Card()
          .setName("Avatar Card")
          .setHeader(new GoogleAppsCardV1CardHeader()
            .setTitle(String.format("Hello %s!", displayName)))
          .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(List.of(
            new GoogleAppsCardV1Widget()
              .setTextParagraph(new GoogleAppsCardV1TextParagraph()
                .setText("Your avatar picture: ")),
            new GoogleAppsCardV1Widget()
              .setImage(new GoogleAppsCardV1Image().setImageUrl(avatarUrl)))))))));
  }
}
// [END chat_avatar_app]
