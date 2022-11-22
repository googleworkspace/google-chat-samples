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

// [START hangouts_chat_avatar_bot]
import com.google.api.services.chat.v1.model.Card;
import com.google.api.services.chat.v1.model.CardHeader;
import com.google.api.services.chat.v1.model.Image;
import com.google.api.services.chat.v1.model.Message;
import com.google.api.services.chat.v1.model.Section;
import com.google.api.services.chat.v1.model.TextParagraph;
import com.google.api.services.chat.v1.model.WidgetMarkup;
import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.List;

public class HelloChat implements HttpFunction {
  private static final Gson gson = new Gson();

  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    JsonObject body = gson.fromJson(request.getReader(), JsonObject.class);

    if (request.getMethod().equals("GET") || !body.has("message")) {
      response.getWriter().write("Hello! This function must be called from Google Chat.");
      return;
    }

    JsonObject sender = body.getAsJsonObject("message").getAsJsonObject("sender");
    String displayName = sender.has("displayName") ? sender.get("displayName").getAsString() : "";
    String avatarUrl = sender.has("avatarUrl") ? sender.get("avatarUrl").getAsString() : "";
    Message message = createMessage(displayName, avatarUrl);

    response.getWriter().write(gson.toJson(message));
  }

  Message createMessage(String displayName, String avatarUrl) {
    CardHeader cardHeader = new CardHeader().setTitle(String.format("Hello %s!", displayName));
    TextParagraph textParagraph = new TextParagraph().setText("Your avatar picture: ");
    WidgetMarkup avatarWidget = new WidgetMarkup().setTextParagraph(textParagraph);
    Image image = new Image().setImageUrl(avatarUrl);
    WidgetMarkup avatarImageWidget = new WidgetMarkup().setImage(image);
    Section section = new Section().setWidgets(List.of(avatarWidget, avatarImageWidget));
    Card card = new Card().setName("Avatar Card").setHeader(cardHeader).setSections(List.of(section));

    return new Message().setCards(List.of(card));
  }
}
// [END hangouts_chat_avatar_bot]
