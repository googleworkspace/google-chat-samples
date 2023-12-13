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

/**
 * @fileoverview Definition of classes and enums that the application services
 * use to store and pass user story data between functions. They set the data
 * model for the Firestore database.
 */

/**
 * User story statuses.
 * @enum {string}
 */
exports.Status = {
  /** Work on the user story has not started yet. */
  OPEN: 'OPEN',
  /** Work on the user story has started. */
  STARTED: 'STARTED',
  /** Work on the user story is completed. */
  COMPLETED: 'COMPLETED',
};

/**
 * User story status icons.
 * @enum {string}
 */
exports.StatusIcon = {
  /** Work on the user story has not started yet. */
  OPEN: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/pending/materialiconsoutlined/48dp/1x/outline_pending_black_48dp.png',
  /** Work on the user story has started. */
  STARTED: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_circle/materialiconsoutlined/48dp/1x/outline_play_circle_black_48dp.png',
  /** Work on the user story is completed. */
  COMPLETED: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/check_circle/materialiconsoutlined/48dp/1x/outline_check_circle_black_48dp.png',
}

/**
 * User story priority levels.
 * @enum {string}
 */
exports.Priority = {
  /** Low priority. */
  LOW: 'Low',
  /** Medium priority. */
  MEDIUM: 'Medium',
  /** High priority. */
  HIGH: 'High',
};

/**
 * User story sizes.
 * @enum {string}
 */
exports.Size = {
  /** Small size. */
  SMALL: 'Small',
  /** Medium size. */
  MEDIUM: 'Medium',
  /** Large size. */
  LARGE: 'Large',
};

/**
 * The user-provided data for a User Story.
 * @record
 */
exports.UserStoryData = class {
  constructor() {
    /** @type {!string} The short title of the user story. */
    this.title;
    /** @type {!string} The long description of the user story. */
    this.description;
    /** @type {!Status} The current status of the user story. */
    this.status;
    /** @type {?Priority} The relative priority of the user story. */
    this.priority;
    /** @type {?Size} The relative size of the user story. */
    this.size;
    /** @type {?string} The current assignee of the user story. */
    this.assignee;
  }
}

/**
 * A user story managed by the app.
 * @record
 */
exports.UserStory = class {
  constructor(id, data) {
    /** @type {!string} The ID of the user story in storage. */
    this.id = id;
    /** @type {!UserStoryData} The user-provided data of the user story. */
    this.data = data;
  }
}
