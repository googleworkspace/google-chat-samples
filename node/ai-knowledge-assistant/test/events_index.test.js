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

const {getFunction} = require('@google-cloud/functions-framework/testing');
const {CloudEvent} = require('cloudevents');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const getTestEnvironment = () => {
  const eventApp = {
    execute: sinon.stub().returnsThis()
  };

  return {
    http_index: proxyquire('../events_index', {
      './controllers/event-app': eventApp,
      './env.js': {
        env: {
          logging: false, // disable request/response logging during tests
        },
      }
    }),
    mocks: {eventApp},
  };
};

describe('eventsApp', function () {
  it('should execute event app', async function () {
    const test = getTestEnvironment();
    const aiSupportEvents = getFunction('eventsApp');
    const event = {
      type: 'MESSAGE',
      message: {}
    };
    const message = {
      attributes: {
        'ce-type': 'google.workspace.chat.message.v1.created'
      },
      data: Buffer.from(JSON.stringify(event)).toString('base64')
    };

    await aiSupportEvents(new CloudEvent({
      type: 'google.cloud.pubsub.topic.v1.messagePublished',
      source: '//pubsub.googleapis.com/projects/test/topics/events',
      data: {message},
    }));

    assert.ok(test.mocks.eventApp.execute.calledOnceWith(
      'google.workspace.chat.message.v1.created', event));
  });
});
