/**
 * Copyright 2023 Google LLC
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
// [START google_chat_incident_response]

const PROJECT_ID = 'replace-with-your-project-id';
const CLOSE_INCIDENT_COMMAND_ID = 1;
const SETUP_SPACE_ENDPOINT = 'https://chat.googleapis.com/v1/spaces:setup';
const MEMBERSHIPS_ENDPOINT = (spaceName) => `https://chat.googleapis.com/v1/${spaceName}/members`;
const MESSAGES_ENDPOINT = (spaceName) => `https://chat.googleapis.com/v1/${spaceName}/messages`;
const VERTEX_TEXT_AI_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/text-bison:predict`;
const SUMMARIZE_CHAT_HISTORY_PROMPT = `Summarize the following conversation between Engineers resolving an incident in a few sentences. Use only the information from the conversation.`;

// [END google_chat_incident_response]
