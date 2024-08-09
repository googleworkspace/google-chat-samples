/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This script initiates the app configuration.

const CREATE_COMMAND_ID = 1;
const CLOSE_COMMAND_ID = 2;
const CHAT_CREDENTIALS = {
  // Replace with the Google Chat credentials to use for app authenticatio, the service account
  // private key's JSON.
};
const PROJECT_ID = 'replace-with-gcp-project-id';
const VERTEX_AI_LOCATION_ID = 'us-central1';
const GWS_PUBSUB_TOPIC_ID = `projects/${PROJECT_ID}/topics/workspace-events`;
const GWS_PUBSUB_SUBSCRIPTION_ID = `projects/${PROJECT_ID}/subscriptions/workspace-events-sub`;
