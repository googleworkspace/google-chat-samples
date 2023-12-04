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
// [START chat_project_management_env]

/**
 * Project environment settings.
 */
const env = {
  project: 'developer-productivity-402319', //'YOUR_PROJECT_ID',
  location: 'us-central1', // replace with your GCP project location
};

exports.env = env;

// [END chat_project_management_env]