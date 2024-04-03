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
 * @fileoverview Definition of classes and enums related to the Workspace Events API.
 */

/**
 * Types of
 * [subscription events](https://developers.google.com/workspace/events/guides/events-chat).
 * @enum {string}
 */
exports.SubscriptionEventType = {
  MESSAGE_CREATED: 'google.workspace.chat.message.v1.created',
  MESSAGE_UPDATED: 'google.workspace.chat.message.v1.updated',
  MESSAGE_DELETED: 'google.workspace.chat.message.v1.deleted',
  BATCH_MESSAGE_CREATED: 'google.workspace.chat.message.v1.batchCreated',
  BATCH_MESSAGE_UPDATED: 'google.workspace.chat.message.v1.batchUpdated',
  BATCH_MESSAGE_DELETED: 'google.workspace.chat.message.v1.batchDeleted',
  EXPIRATION_REMINDER: 'google.workspace.events.subscription.v1.expirationReminder',
}
