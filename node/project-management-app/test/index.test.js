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

const { getFunction } = require('@google-cloud/functions-framework/testing');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const getTestEnvironment = () => {
  const app = {
    execute: sinon.stub().returns({ text: 'App executed.' }),
  };
  const res = {
    send: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
    status: sinon.stub().returnsThis(),
  };

  return {
    index: proxyquire('../index', {
      './controllers/app': app,
      './env.js': {
        env: {
          logging: false, // disable request/response logging during tests
        },
      }
    }),
    mocks: { app, res },
  };
};

describe('projectManagementChatApp', function () {
  it('should execute app and send response', async function () {
    const test = getTestEnvironment();
    const projectManagementChatApp = getFunction('projectManagementChatApp');
    const req = {
      method: 'POST',
      body: {
        type: 'MESSAGE',
        message: {},
      }
    };

    await projectManagementChatApp(req, test.mocks.res);

    assert.ok(test.mocks.app.execute.calledOnceWith({
      type: 'MESSAGE',
      message: {}
    }))
    assert.ok(test.mocks.res.json.calledOnceWith({
      text: 'App executed.'
    }));
  });

  it('should send status 400 if event message is undefined', async function () {
    const test = getTestEnvironment();
    const projectManagementChatApp = getFunction('projectManagementChatApp');
    const req = {
      method: 'POST',
      body: {
        type: 'MESSAGE',
      }
    };

    await projectManagementChatApp(req, test.mocks.res);

    assert.ok(test.mocks.app.execute.notCalled);
    assert.ok(test.mocks.res.status.calledOnceWith(400));
    assert.ok(test.mocks.res.send.calledOnceWith(
      'This function is meant to be used in a Google Chat app.'));
  });

  it('should send status 400 if request method is GET', async function () {
    const test = getTestEnvironment();
    const projectManagementChatApp = getFunction('projectManagementChatApp');
    const req = {
      method: 'GET',
      body: {
        type: 'MESSAGE',
        message: {},
      }
    };

    await projectManagementChatApp(req, test.mocks.res);

    assert.ok(test.mocks.app.execute.notCalled);
    assert.ok(test.mocks.res.status.calledOnceWith(400));
    assert.ok(test.mocks.res.send.calledOnceWith(
      'This function is meant to be used in a Google Chat app.'));
  });
});
