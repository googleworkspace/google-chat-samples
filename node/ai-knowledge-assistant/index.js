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
 * @fileoverview The main script for the project, which includes the exported
 * Cloud Functions from each respective script file. This project exports
 * multiple Cloud Functions, but each one should be deployed separately.
 */

// Exports a Function with an HTTP trigger and the entry point `app`.
require('./http_index.js');

// Exports a Function with a CloudEvent trigger and the entry point `eventsApp`.
require('./events_index.js');
