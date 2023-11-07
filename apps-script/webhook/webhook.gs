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


// [START hangouts_chat_webhook]
function webhook() {
  const url = "https://chat.googleapis.com/v1/spaces/{{'<var>'}}SPACE_ID{{'</var>'}}/messages?key={{'<var>'}}KEY{{'</var>'}}&token={{'<var>'}}TOKEN{{'</var>'}}";
  const options = {
    "method": "post",
    "headers": {"Content-Type": "application/json; charset=UTF-8"},
    "payload": JSON.stringify({"text": "Hello from Apps Script!"})
  };
  const response = UrlFetchApp.fetch(url, options);
  console.log(response);
}
// [END hangouts_chat_webhook]
