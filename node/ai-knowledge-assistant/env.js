/**
 * Copyright 2024 Google LLC
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

/**
 * Project environment settings.
 */
const env = {
  // Replace with your GCP project ID.
  project: 'project-id',

  // Replace with your GCP project location. Used for Vertex AI calls.
  location: 'us-central1',

  // Replace with the PubSub topic to receive events.
  // The topic must be in the same GCP project as the Chat app.
  topic: 'events-api',

  // Whether to log the request & response on each function call.
  logging: true,
};

exports.env = env;
