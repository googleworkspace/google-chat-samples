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
 * @fileoverview Service with the application logic specific to working with
 * user stories.
 */

const { BadRequestException, NotFoundException } = require('../model/exceptions');
const { UserStory, Status, Priority, Size } = require('../model/user-story');
const { FirestoreService } = require('./firestore-service');

/** The prefix used by the Google Chat API in the User resource name. */
const USERS_PREFIX = 'users/';

/**
 * Service that executes all the User Story application logic.
 */
exports.UserStoryService = {

  /**
   * Fetches a user story from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @return {Promise<UserStory>} The fetched user story data.
   * @throws {NotFoundException} If the user story does not exist.
   */
  getUserStory: async function (spaceName, id) {
    return FirestoreService.getUserStory(spaceName, id);
  },

  /**
   * Creates a new user story in storage with the given title and the status
   * set to `OPEN`.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} title The short title of the user story.
   * @param {?string} description The description of the user story.
   * @return {Promise<UserStory>} The created user story data.
   * @throws {BadRequestException} If the `title` is null or empty.
   */
  createUserStory: async function (spaceName, title, description) {
    if (title === undefined || title === null || title.trim().length === 0) {
      throw BadRequestException('Title is required.');
    }
    let data = {
      title: title,
      status: Status.OPEN,
    }
    if (description) {
      data.description = description;
    }
    return FirestoreService.createUserStory(spaceName, data);
  },

  /**
  * Updates the `assignee` field of the user story.
  * @param {!string} spaceName The resource name of the space.
  * @param {!string} id The ID of the user story in storage.
  * @param {!string} userName The resource name of the user.
  * @return {Promise<UserStory>} The updated user story data.
  * @throws {NotFoundException} If the user story does not exist.
  * @throws {BadRequestException} If the user story is already completed.
  */
  assignUserStory: async function (spaceName, id, userName) {
    const userStory = await this.getUserStory(spaceName, id);
    if (userStory.data.status === Status.COMPLETED) {
      throw BadRequestException('User story is already completed.');
    }
    return FirestoreService.updateUserStory(spaceName, id, {
      assignee: userName.replace(USERS_PREFIX, '')
    });
  },

  /**
   * Updates the fields of the user story.
   * Only the provided fields will be updated.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @param {?string} title The short title of the user story.
   * @param {?string} description The long description of the user story.
   * @param {?Status} status The current status of the user story.
   * @param {?Priority} priority The relative priority of the user story.
   * @param {?Size} size The relative size of the user story.
   * @return {Promise<UserStory>} The updated user story data.
   * @throws {NotFoundException} If the user story does not exist.
   * @throws {BadRequestException} If the user story is already completed or if
   *     one of the provided field values is invalid.
   */
  updateUserStory: async function (
    spaceName, id, title, description, status, priority, size) {
    // getUserStory will throw NotFoundException if the story doesn't exist.
    await this.getUserStory(spaceName, id);
    let data = {};
    if (title !== undefined && title !== null) {
      if (title.trim().length === 0) {
        throw new BadRequestException('Title is required.');
      }
      data.title = title;
    }
    if (description !== undefined && description !== null) {
      data.description = description;
    }
    if (status !== undefined && status !== null) {
      if (!Object.values(Status).includes(status)) {
        throw new BadRequestException('Invalid status value.');
      }
      data.status = status;
    }
    if (priority !== undefined && priority !== null) {
      if (priority !== '' && !Object.values(Priority).includes(priority)) {
        throw new BadRequestException('Invalid priority value.');
      }
      data.priority = priority;
    }
    if (size !== undefined && size !== null) {
      if (size !== '' && !Object.values(Size).includes(size)) {
        throw new BadRequestException('Invalid size value.');
      }
      data.size = size;
    }
    return FirestoreService.updateUserStory(spaceName, id, data);
  },

  /**
   * Sets the `status` of the user story to `OPEN`.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @return {Promise<UserStory>} The updated user story data.
   * @throws {NotFoundException} If the user story does not exist.
   * @throws {BadRequestException} If the user story is already started.
   */
  startUserStory: async function (spaceName, id) {
    const userStory = await this.getUserStory(spaceName, id);
    if (userStory.data.status !== Status.OPEN) {
      throw Error('User story is already started or completed.');
    }
    const data = { status: Status.STARTED };
    return FirestoreService.updateUserStory(spaceName, id, data);
  },

  /**
   * Sets the `status` of the user story to `COMPLETED`.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @return {Promise<UserStory>} The updated user story data.
   * @throws {NotFoundException} If the user story does not exist.
   * @throws {BadRequestException} If the user story is already completed.
   */
  completeUserStory: async function (spaceName, id) {
    const userStory = await this.getUserStory(spaceName, id);
    if (userStory.data.status === Status.COMPLETED) {
      throw Error('User story is already completed.');
    }
    const data = { status: Status.COMPLETED };
    return FirestoreService.updateUserStory(spaceName, id, data);
  },

  /**
   * Lists all the user stories in storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<UserStory[]>} An array with the fetched user story data.
   */
  listAllUserStories: async function (spaceName) {
    return FirestoreService.listAllUserStories(spaceName);
  },

  /**
   * Lists all the user stories in storage assigned to the specified user.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} userName The resource name of the user.
   * @return {Promise<UserStory[]>} An array with the fetched user story data.
   */
  listUserStoriesByUser: async function (spaceName, userName) {
    return FirestoreService.listUserStoriesByUser(
      spaceName, userName.replace(USERS_PREFIX, ''));
  },

  /**
   * Deletes all the user stories in storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  cleanupUserStories: async function (spaceName) {
    return FirestoreService.cleanupUserStories(spaceName);
  },

}
