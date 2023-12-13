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

const { FieldPath } = require('@google-cloud/firestore');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { NotFoundException } = require('../../model/exceptions');
const { UserStory } = require('../../model/user-story');
const { User } = require('../../model/user');

const SPACES_COLLECTION = 'spaces';
const USER_STORIES_COLLECTION = 'userStories';
const USERS_COLLECTION = 'users';
const SPACE_NAME = 'spaces/test';
const SPACE_ID = 'test';
const DISPLAY_NAME = 'Space';
const USER_STORY_ID = 'abc';
const USER_STORY_DATA = { title: 'User Story' };
const USER_ID = '123';
const BATCH_SIZE = 50;

const getTestEnvironment = () => {
  const queryMock = {
    limit: sinon.stub().returnsThis(),
    get: sinon.stub().returns({ size: 0 }),
  }
  const childCollectionMock = {
    doc: sinon.stub().returnsThis(),
    add: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis(),
    get: sinon.stub().returnsThis(),
    update: sinon.stub().returnsThis(),
    delete: sinon.stub(),
    where: sinon.stub().returnsThis(),
    orderBy: sinon.stub().returns(queryMock),
    exists: true,
  }
  const spacesCollectionMock = {
    collection: sinon.stub().returns(childCollectionMock),
    doc: sinon.stub().returnsThis(),
    set: sinon.stub(),
    delete: sinon.stub(),
  }
  const batchMock = {
    delete: sinon.stub(),
    commit: sinon.stub(),
  }
  const firestoreMock = {
    collection: sinon.stub().returns(spacesCollectionMock),
    batch: sinon.stub().returns(batchMock),
  };

  return {
    module: proxyquire('../../services/firestore-service', {
      '@google-cloud/firestore': {
        Firestore: sinon.stub().returns(firestoreMock)
      }
    }),
    mocks: {
      firestore: firestoreMock,
      spaces: spacesCollectionMock,
      children: childCollectionMock,
      query: queryMock,
      batch: batchMock,
    },
  };
};

describe('FirestoreService.createSpace', function () {
  it('should create space', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;

    await FirestoreService.createSpace(SPACE_NAME, DISPLAY_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledOnceWith(SPACE_ID));
    assert.ok(
      test.mocks.spaces.set.calledOnceWith({ displayName: DISPLAY_NAME }));
  });
});

describe('FirestoreService.deleteSpace', function () {
  it('should delete space', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;

    await FirestoreService.deleteSpace(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.alwaysCalledWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledWith(SPACE_ID));
    assert.ok(test.mocks.spaces.collection.calledWith(USER_STORIES_COLLECTION));
    assert.ok(test.mocks.spaces.collection.calledWith(USERS_COLLECTION));
    assert.strictEqual(test.mocks.spaces.delete.callCount, 1);
    assert.strictEqual(test.mocks.query.get.callCount, 2);
  });
});

describe('FirestoreService.getUserStory', function () {
  it('should return user story', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.data = () => USER_STORY_DATA;

    const userStory =
      await FirestoreService.getUserStory(SPACE_NAME, USER_STORY_ID);

    assert.ok(test.mocks.children.doc.calledOnceWith(USER_STORY_ID));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      userStory, new UserStory(USER_STORY_ID, USER_STORY_DATA));
  });

  it('should throw when user story doesn\'t exist', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.exists = false;

    await assert.rejects(async () => {
      return FirestoreService.getUserStory(SPACE_NAME, USER_STORY_ID);
    }, NotFoundException);
  });
});

describe('FirestoreService.createUserStory', function () {
  it('should create user story', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.id = USER_STORY_ID;
    test.mocks.children.data = () => USER_STORY_DATA;

    const userStory =
      await FirestoreService.createUserStory(SPACE_NAME, USER_STORY_DATA);

    assert.ok(test.mocks.children.add.calledOnceWith(USER_STORY_DATA));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      userStory, new UserStory(USER_STORY_ID, USER_STORY_DATA));
  });
});

describe('FirestoreService.updateUserStory', function () {
  it('should update user story', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.data = () => USER_STORY_DATA;

    const userStory =
      await FirestoreService.updateUserStory(
        SPACE_NAME, USER_STORY_ID, USER_STORY_DATA);

    assert.ok(test.mocks.children.doc.calledWith(USER_STORY_ID));
    assert.ok(test.mocks.children.update.calledOnceWith(USER_STORY_DATA));
    assert.strictEqual(test.mocks.children.doc.callCount, 2);
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      userStory, new UserStory(USER_STORY_ID, USER_STORY_DATA));
  });
});

describe('FirestoreService.listAllUserStories', function () {
  it('should list all user stories', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.get = sinon.stub().returns([
      { id: '1', data: () => ({ title: 'Story 1' }) },
      { id: '2', data: () => ({ title: 'Story 2' }) },
    ]);

    const userStories =
      await FirestoreService.listAllUserStories(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledOnceWith(SPACE_ID));
    assert.ok(
      test.mocks.spaces.collection.calledOnceWith(USER_STORIES_COLLECTION));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      userStories, [
      new UserStory('1', { title: 'Story 1' }),
      new UserStory('2', { title: 'Story 2' }),
    ]);
  });
});

describe('FirestoreService.listUserStoriesByUser', function () {
  it('should list user stories by user', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.get = sinon.stub().returns([
      { id: '1', data: () => ({ title: 'Story 1' }) },
      { id: '2', data: () => ({ title: 'Story 2' }) },
    ]);

    const userStories =
      await FirestoreService.listUserStoriesByUser(SPACE_NAME, USER_ID);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledOnceWith(SPACE_ID));
    assert.ok(
      test.mocks.spaces.collection.calledOnceWith(USER_STORIES_COLLECTION));
    assert.ok(
      test.mocks.children.where.calledOnceWith('assignee', '==', USER_ID));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      userStories, [
      new UserStory('1', { title: 'Story 1' }),
      new UserStory('2', { title: 'Story 2' }),
    ]);
  });
});

describe('FirestoreService.cleanupUserStories', function () {
  it('should delete all user stories', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.query.get.onFirstCall().returns({
      size: 2,
      docs: [
        { ref: 'abc' },
        { ref: 'def' },
      ]
    });
    test.mocks.query.get.onSecondCall().returns({ size: 0 });

    await FirestoreService.cleanupUserStories(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledWith(SPACE_ID));
    assert.ok(test.mocks.spaces.collection.calledWith(USER_STORIES_COLLECTION));
    assert.ok(test.mocks.children.orderBy.calledOnceWith('__name__'));
    assert.ok(test.mocks.query.limit.calledOnceWith(BATCH_SIZE));
    assert.strictEqual(test.mocks.query.get.callCount, 2);
    assert.strictEqual(test.mocks.firestore.batch.callCount, 1);
    assert.strictEqual(test.mocks.batch.delete.callCount, 2);
    assert.strictEqual(test.mocks.batch.commit.callCount, 1);
  });

  it('should do nothing if there are zero user stories', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.query.get.returns({ size: 0 });

    await FirestoreService.cleanupUserStories(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledWith(SPACE_ID));
    assert.ok(test.mocks.spaces.collection.calledWith(USER_STORIES_COLLECTION));
    assert.ok(test.mocks.children.orderBy.calledOnceWith('__name__'));
    assert.ok(test.mocks.query.limit.calledOnceWith(BATCH_SIZE));
    assert.strictEqual(test.mocks.query.get.callCount, 1);
    assert.ok(test.mocks.firestore.batch.notCalled);
    assert.ok(test.mocks.batch.delete.notCalled);
    assert.ok(test.mocks.batch.commit.notCalled);
  });
});

describe('FirestoreService.getUser', function () {
  it('should return user', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.data = () => ({
      displayName: 'User',
      avatarUrl: 'avatar',
    });

    const user =
      await FirestoreService.getUser(SPACE_NAME, USER_ID);

    assert.ok(test.mocks.children.doc.calledOnceWith(USER_ID));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(user, new User(USER_ID, 'User', 'avatar'));
  });

  it('should throw when user doesn\'t exist', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.exists = false;

    await assert.rejects(async () => {
      return FirestoreService.getUser(SPACE_NAME, USER_ID);
    }, NotFoundException);
  });
});

describe('FirestoreService.getUsers', function () {
  it('should list users', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.get = sinon.stub().returns([
      { id: '1', data: () => ({ displayName: 'User 1' }) },
      { id: '2', data: () => ({ displayName: 'User 2' }) },
    ]);

    const users =
      await FirestoreService.getUsers(SPACE_NAME, ['1', '2']);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledOnceWith(SPACE_ID));
    assert.ok(
      test.mocks.spaces.collection.calledOnceWith(USERS_COLLECTION));
    assert.ok(
      test.mocks.children.where.calledOnceWith(
        FieldPath.documentId(), 'in', ['1', '2']));
    assert.strictEqual(test.mocks.children.get.callCount, 1);
    assert.deepStrictEqual(
      users, {
      '1': new User('1', 'User 1'),
      '2': new User('2', 'User 2'),
    });
  });

  it('should return empty array if input is empty', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;

    const users =
      await FirestoreService.getUsers(SPACE_NAME, []);

    assert.ok(test.mocks.firestore.collection.notCalled);
    assert.ok(test.mocks.spaces.doc.notCalled);
    assert.ok(test.mocks.spaces.collection.notCalled);
    assert.ok(test.mocks.children.get.notCalled);
    assert.deepStrictEqual(users, {});
  });
});

describe('FirestoreService.createOrUpdateUser', function () {
  it('should create or update user', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;

    await FirestoreService.createOrUpdateUser(
      SPACE_NAME, new User(USER_ID, 'User', 'avatar'));

    assert.ok(test.mocks.children.doc.calledOnceWith(USER_ID));
    assert.ok(test.mocks.children.set.calledOnceWith({
      displayName: 'User',
      avatarUrl: 'avatar',
    }));
  });

  it('should throw when user doesn\'t exist', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.children.exists = false;

    await assert.rejects(async () => {
      return FirestoreService.getUser(SPACE_NAME, USER_ID);
    }, NotFoundException);
  });
});

describe('FirestoreService.cleanupUsers', function () {
  it('should delete all users', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.query.get.onFirstCall().returns({
      size: 2,
      docs: [
        { ref: 'abc' },
        { ref: 'def' },
      ]
    });
    test.mocks.query.get.onSecondCall().returns({ size: 0 });

    await FirestoreService.cleanupUsers(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledWith(SPACE_ID));
    assert.ok(test.mocks.spaces.collection.calledWith(USERS_COLLECTION));
    assert.ok(test.mocks.children.orderBy.calledOnceWith('__name__'));
    assert.ok(test.mocks.query.limit.calledOnceWith(BATCH_SIZE));
    assert.strictEqual(test.mocks.query.get.callCount, 2);
    assert.strictEqual(test.mocks.firestore.batch.callCount, 1);
    assert.strictEqual(test.mocks.batch.delete.callCount, 2);
    assert.strictEqual(test.mocks.batch.commit.callCount, 1);
  });

  it('should do nothing if there are zero users', async function () {
    const test = getTestEnvironment();
    const FirestoreService = test.module.FirestoreService;
    test.mocks.query.get.returns({ size: 0 });

    await FirestoreService.cleanupUsers(SPACE_NAME);

    assert.ok(
      test.mocks.firestore.collection.calledOnceWith(SPACES_COLLECTION));
    assert.ok(test.mocks.spaces.doc.calledWith(SPACE_ID));
    assert.ok(test.mocks.spaces.collection.calledWith(USERS_COLLECTION));
    assert.ok(test.mocks.children.orderBy.calledOnceWith('__name__'));
    assert.ok(test.mocks.query.limit.calledOnceWith(BATCH_SIZE));
    assert.strictEqual(test.mocks.query.get.callCount, 1);
    assert.ok(test.mocks.firestore.batch.notCalled);
    assert.ok(test.mocks.batch.delete.notCalled);
    assert.ok(test.mocks.batch.commit.notCalled);
  });
});
