/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// [START google_chat_webhook]
/**
 * Sends asynchronous message to Google Chat
 * @return {Object} response
 */
async function webhook() {
  const url = "https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=KEY&token=TOKEN&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD"
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json; charset=UTF-8"},
    body: JSON.stringify({
      text: "Hello from a Node script!",
      thread: {threadKey: "THREAD_KEY_VALUE"}
    })
  });
  return await res.json();
}

webhook().then(res => console.log(res));
// [END google_chat_webhook]
