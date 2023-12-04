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

const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const SPACE_NAME = 'spaces/test';
const DISPLAY_NAME = 'Space';

const getTestEnvironment = () => {
  const firestoreServiceMock = {
    createSpace: sinon.stub(),
    deleteSpace: sinon.stub(),
  };

  return {
    module: proxyquire('../../services/space-service', {
      './firestore-service': {
        FirestoreService: firestoreServiceMock,
      }
    }),
    mocks: {
      firestoreService: firestoreServiceMock,
    },
  };
};

describe('SpaceService.createSpace', function () {
  it('should create space', async function () {
    const test = getTestEnvironment();
    const SpaceService = test.module.SpaceService;

    await SpaceService.createSpace(SPACE_NAME, DISPLAY_NAME);

    assert.ok(
      test.mocks.firestoreService.createSpace.calledOnceWith(
        SPACE_NAME, DISPLAY_NAME));
  });
});

describe('SpaceService.deleteSpace', function () {
  it('should delete space', async function () {
    const test = getTestEnvironment();
    const SpaceService = test.module.SpaceService;

    await SpaceService.deleteSpace(SPACE_NAME);

    assert.ok(
      test.mocks.firestoreService.deleteSpace.calledOnceWith(SPACE_NAME));
  });
});
