/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START chat_avatar_app]
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
import java.util.List;

public class AvatarApp implements HttpFunction {
  private static final Gson gson = new Gson();

  // Command IDs (configure these in Google Chat API)
  private static final int ABOUT_COMMAND_ID = 1; // ID for the "/about" slash command
  private static final int HELP_COMMAND_ID = 2; // ID for the "Help" quick command

  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    JsonObject event = gson.fromJson(request.getReader(), JsonObject.class);

    if (event.has("appCommandMetadata")) {
      handleAppCommands(event, response);
    } else {
      handleRegularMessage(event, response);
    }
  }

  // [START chat_avatar_slash_command]
  /**
   * Handles slash and quick commands.
   *
   * @param event    The Google Chat event.
   * @param response The HTTP response object.
   */
  private void handleAppCommands(JsonObject event, HttpResponse response) throws Exception {
    int appCommandId = event.getAsJsonObject("appCommandMetadata").get("appCommandId").getAsInt();

    switch (appCommandId) {
      case ABOUT_COMMAND_ID:
        Message aboutMessage = new Message();
        aboutMessage.setText("The Avatar app replies to Google Chat messages.");
        aboutMessage.setPrivateMessageViewer(new User()
            .setName(event.getAsJsonObject("user").get("name").getAsString()));
        response.getWriter().write(gson.toJson(aboutMessage));
        return;
      case HELP_COMMAND_ID:
        Message helpMessage = new Message();
        helpMessage.setText("The Avatar app replies to Google Chat messages.");
        helpMessage.setPrivateMessageViewer(new User()
            .setName(event.getAsJsonObject("user").get("name").getAsString()));
        response.getWriter().write(gson.toJson(helpMessage));
        return;
    }
  }
  // [END chat_avatar_slash_command]

  /**
   * Handles regular messages (not commands).
   *
   * @param event    The Google Chat event.
   * @param response The HTTP response object.
   */
  private void handleRegularMessage(JsonObject event, HttpResponse response) throws Exception {

    if (!event.has("user")) {
      response.getWriter().write("Invalid request.");
      return;
    }

    JsonObject user = event.getAsJsonObject("user");
    String displayName = user.has("displayName") ? user.get("displayName").getAsString() : "";
    String avatarUrl = user.has("avatarUrl") ? user.get("avatarUrl").getAsString() : "";
    Message message = createMessage(displayName, avatarUrl);
    response.getWriter().write(gson.toJson(message));
  }

  /**
   * Creates a card message with the user's avatar.
   *
   * @param displayName The user's display name.
   * @param avatarUrl   The URL of the user's avatar.
   * @return The card message object.
   */
  private Message createMessage(String displayName, String avatarUrl) {
    return new Message()
        .setText("Here's your avatar")
        .setCardsV2(List.of(new CardWithId()
            .setCardId("avatarCard")
            .setCard(new GoogleAppsCardV1Card()
                .setName("Avatar Card")
                .setHeader(new GoogleAppsCardV1CardHeader()
                    .setTitle(String.format("Hello %s!", displayName)))
                .setSections(List.of(new GoogleAppsCardV1Section().setWidgets(List.of(
                    new GoogleAppsCardV1Widget()
                        .setTextParagraph(new GoogleAppsCardV1TextParagraph()
                            .setText("Your avatar picture:")),
                    new GoogleAppsCardV1Widget()
                        .setImage(new GoogleAppsCardV1Image().setImageUrl(avatarUrl)))))))));
  }
}
// [END chat_avatar_app]
