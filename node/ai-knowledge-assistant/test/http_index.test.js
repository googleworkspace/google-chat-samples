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

const {getTestServer} = require('@google-cloud/functions-framework/testing');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const request = require('supertest');

const getTestEnvironment = () => {
  const app = {
    execute: sinon.stub().returns({text: 'App executed.'}),
  };

  return {
    http_index: proxyquire('../http_index', {
      './controllers/app': app,
      './services/user-auth': {
        oauth2callback: async (_, res) => res.send('oauth2callback executed.')
      },
      './env.js': {
        env: {
          logging: false, // disable request/response logging during tests
        },
      }
    }),
    mocks: {app},
  };
};

describe('app', function () {
  it('should execute app and send response', async function () {
    const test = getTestEnvironment();
    const server = getTestServer('app');

    const response = await request(server)
      .post('/')
      .send({
        type: 'MESSAGE',
        message: {},
      })
      .set('Content-Type', 'application/json');

    assert.ok(test.mocks.app.execute.calledOnceWith({
      type: 'MESSAGE',
      message: {}
    }))
    assert.match(response.headers['content-type'], /json/);
    assert.equal(response.status, 200);
    assert.equal(response.body.text, 'App executed.');
  });

  it('should send status 400 if event type is undefined', async function () {
    const test = getTestEnvironment();
    const server = getTestServer('app');

    const response = await request(server)
      .post('/')
      .send({})
      .set('Content-Type', 'application/json');

    assert.ok(test.mocks.app.execute.notCalled);
    assert.equal(response.status, 400);
    assert.equal(
      response.text, 'This function is meant to be used in a Google Chat app.');
  });

  it('should send status 400 if request method is GET', async function () {
    const test = getTestEnvironment();
    const server = getTestServer('app');

    const response = await request(server).get('/');

    assert.ok(test.mocks.app.execute.notCalled);
    assert.equal(response.status, 400);
    assert.equal(
      response.text, 'This function is meant to be used in a Google Chat app.');
  });

  it('should execute oauth2callback', async function () {
    const test = getTestEnvironment();
    const server = getTestServer('app');

    const response = await request(server).get('/oauth2');

    assert.ok(test.mocks.app.execute.notCalled);
    assert.equal(response.status, 200);
    assert.equal(response.text, 'oauth2callback executed.');
  });
});
