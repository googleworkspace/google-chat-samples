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
const { User } = require('../../model/user');

const SPACE_NAME = 'spaces/test';
const USER_ID = '123';
const USER = new User(USER_ID, 'Display Name', 'avatar.png');

const getTestEnvironment = () => {
  const firestoreServiceMock = {
    getUser: sinon.stub(),
    getUsers: sinon.stub(),
    createOrUpdateUser: sinon.stub(),
  };

  return {
    module: proxyquire('../../services/user-service', {
      './firestore-service': {
        FirestoreService: firestoreServiceMock,
      }
    }),
    mocks: {
      firestoreService: firestoreServiceMock,
    },
  };
};

describe('UserService.getUser', function () {
  it('should return user', async function () {
    const test = getTestEnvironment();
    const UserService = test.module.UserService;
    test.mocks.firestoreService.getUser.returns(USER);

    const user = await UserService.getUser(SPACE_NAME, USER_ID);

    assert.ok(
      test.mocks.firestoreService.getUser.calledOnceWith(SPACE_NAME, USER_ID));
    assert.deepStrictEqual(user, USER);
  });
});

describe('UserService.getUsers', function () {
  it('should return users', async function () {
    const test = getTestEnvironment();
    const UserService = test.module.UserService;
    test.mocks.firestoreService.getUsers.returns({ '123': USER });

    const users = await UserService.getUsers(SPACE_NAME, [USER_ID]);

    assert.ok(
      test.mocks.firestoreService.getUsers.calledOnceWith(
        SPACE_NAME, [USER_ID]));
    assert.deepStrictEqual(users, { '123': USER });
  });
});

describe('UserService.createOrUpdateUser', function () {
  it('should create or update user', async function () {
    const test = getTestEnvironment();
    const UserService = test.module.UserService;

    await UserService.createOrUpdateUser(SPACE_NAME, USER);

    assert.ok(
      test.mocks.firestoreService.createOrUpdateUser.calledOnceWith(
        SPACE_NAME, USER));
  });
});
