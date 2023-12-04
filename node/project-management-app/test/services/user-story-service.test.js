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
const { BadRequestException } = require('../../model/exceptions');
const { UserStory, Status, Priority, Size } = require('../../model/user-story');

const SPACE_NAME = 'spaces/test';
const USER_NAME = 'users/123';
const USER_ID = '123';
const USER_STORY_ID = 'abc';
const USER_STORY_DATA = {
  title: 'User Story',
  description: 'User Story description.',
  status: Status.OPEN,
};
const USER_STORY = new UserStory(USER_STORY_ID, USER_STORY_DATA);

const getTestEnvironment = () => {
  const firestoreServiceMock = {
    getUserStory: sinon.stub().returns(USER_STORY),
    createUserStory: sinon.stub(),
    updateUserStory: sinon.stub(),
    listAllUserStories: sinon.stub(),
    listUserStoriesByUser: sinon.stub(),
    cleanupUserStories: sinon.stub(),
  };

  return {
    module: proxyquire('../../services/user-story-service', {
      './firestore-service': {
        FirestoreService: firestoreServiceMock,
      }
    }),
    mocks: {
      firestoreService: firestoreServiceMock,
    },
  };
};

describe('UserStoryService.getUserStory', function () {
  it('should return user story', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    const userStory =
      await UserStoryService.getUserStory(SPACE_NAME, USER_STORY_ID);

    assert.ok(
      test.mocks.firestoreService.getUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID));
    assert.deepStrictEqual(userStory, USER_STORY);
  });
});

describe('UserStoryService.createUserStory', function () {
  it('should create user story', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.createUserStory.returns(USER_STORY);

    const userStory =
      await UserStoryService.createUserStory(
        SPACE_NAME, USER_STORY_DATA.title, USER_STORY_DATA.description);

    assert.ok(
      test.mocks.firestoreService.createUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_DATA));
    assert.deepStrictEqual(userStory, USER_STORY);
  });

  it('should throw if title is empty', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.createUserStory(SPACE_NAME, /* title= */ ''),
      BadRequestException);
  });

  it('should throw if title is null', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.createUserStory(SPACE_NAME, /* title= */ null),
      BadRequestException);
  });

  it('should throw if title is undefined', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.createUserStory(SPACE_NAME),
      BadRequestException);
  });
});

describe('UserStoryService.assignUserStory', function () {
  it('should assign user story', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    const updatedUserStory =
      new UserStory(USER_STORY_ID, { ...USER_STORY_DATA, assignee: USER_ID });
    test.mocks.firestoreService.updateUserStory.returns(updatedUserStory);

    const userStory =
      await UserStoryService.assignUserStory(
        SPACE_NAME, USER_STORY_ID, USER_NAME);

    assert.ok(
      test.mocks.firestoreService.updateUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID, { assignee: USER_ID }));
    assert.deepStrictEqual(userStory, updatedUserStory);
  });

  it('should throw if story is completed', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.getUserStory.returns(
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.COMPLETED,
      }));

    assert.rejects(async () =>
      await UserStoryService.assignUserStory(
        SPACE_NAME, USER_STORY_ID, USER_NAME),
      BadRequestException);
  });
});

describe('UserStoryService.updateUserStory', function () {
  it('should update all user story fields', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    const updatedUserStory =
      new UserStory(USER_STORY_ID, {
        title: 'New title',
        description: 'New description',
        status: Status.STARTED,
        priority: Priority.LOW,
        size: Size.SMALL,
      });
    test.mocks.firestoreService.updateUserStory.returns(updatedUserStory);

    const userStory =
      await UserStoryService.updateUserStory(
        SPACE_NAME,
        USER_STORY_ID,
        'New title',
        'New description',
        Status.STARTED,
        Priority.LOW,
        Size.SMALL);

    assert.ok(
      test.mocks.firestoreService.updateUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID, {
        title: 'New title',
        description: 'New description',
        status: Status.STARTED,
        priority: Priority.LOW,
        size: Size.SMALL,
      }));
    assert.deepStrictEqual(userStory, updatedUserStory);
  });

  it('should not update undefined fields', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.updateUserStory.returns(USER_STORY);

    const userStory =
      await UserStoryService.updateUserStory(SPACE_NAME, USER_STORY_ID);

    assert.ok(
      test.mocks.firestoreService.updateUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID, {}));
    assert.deepStrictEqual(userStory, USER_STORY);
  });

  it('should throw if title is empty', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.updateUserStory(
        SPACE_NAME,
        USER_STORY_ID,
        /* title= */ ''),
      BadRequestException);
  });

  it('should throw if status is empty', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.updateUserStory(
        SPACE_NAME,
        USER_STORY_ID,
        'New Title',
        /* status= */ ''),
      BadRequestException);
  });

  it('should throw if priority is empty', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.updateUserStory(
        SPACE_NAME,
        USER_STORY_ID,
        'New Title',
        Status.STARTED,
        /* priority= */ ''),
      BadRequestException);
  });

  it('should throw if size is empty', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    assert.rejects(async () =>
      await UserStoryService.updateUserStory(
        SPACE_NAME,
        USER_STORY_ID,
        'New Title',
        Status.STARTED,
        Priority.LOW,
        /* size= */ ''),
      BadRequestException);
  });
});

describe('UserStoryService.startUserStory', function () {
  it('should start user story', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    const updatedUserStory =
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.STARTED,
      });
    test.mocks.firestoreService.updateUserStory.returns(updatedUserStory);

    const userStory =
      await UserStoryService.startUserStory(SPACE_NAME, USER_STORY_ID);

    assert.ok(
      test.mocks.firestoreService.updateUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID, { status: Status.STARTED }));
    assert.deepStrictEqual(userStory, updatedUserStory);
  });

  it('should throw if story is started', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.getUserStory.returns(
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.STARTED,
      }));

    assert.rejects(async () =>
      await UserStoryService.startUserStory(
        SPACE_NAME, USER_STORY_ID, USER_NAME),
      BadRequestException);
  });

  it('should throw if story is completed', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.getUserStory.returns(
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.COMPLETED,
      }));

    assert.rejects(async () =>
      await UserStoryService.startUserStory(
        SPACE_NAME, USER_STORY_ID, USER_NAME),
      BadRequestException);
  });
});

describe('UserStoryService.completeUserStory', function () {
  it('should complete user story', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    const updatedUserStory =
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.COMPLETED,
      });
    test.mocks.firestoreService.updateUserStory.returns(updatedUserStory);

    const userStory =
      await UserStoryService.completeUserStory(SPACE_NAME, USER_STORY_ID);

    assert.ok(
      test.mocks.firestoreService.updateUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID, { status: Status.COMPLETED }));
    assert.deepStrictEqual(userStory, updatedUserStory);
  });

  it('should throw if story is completed', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.getUserStory.returns(
      new UserStory(USER_STORY_ID, {
        ...USER_STORY_DATA,
        status: Status.COMPLETED,
      }));

    assert.rejects(async () =>
      await UserStoryService.completeUserStory(
        SPACE_NAME, USER_STORY_ID, USER_NAME),
      BadRequestException);
  });
});

describe('UserStoryService.listAllUserStories', function () {
  it('should list all user stories', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.listAllUserStories.returns([USER_STORY]);

    const userStories =
      await UserStoryService.listAllUserStories(SPACE_NAME);

    assert.ok(
      test.mocks.firestoreService.listAllUserStories.calledOnceWith(
        SPACE_NAME));
    assert.deepStrictEqual(userStories, [USER_STORY]);
  });
});

describe('UserStoryService.listUserStoriesByUser', function () {
  it('should list user stories by user', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;
    test.mocks.firestoreService.listUserStoriesByUser.returns([USER_STORY]);

    const userStories =
      await UserStoryService.listUserStoriesByUser(SPACE_NAME, USER_NAME);

    assert.ok(
      test.mocks.firestoreService.listUserStoriesByUser.calledOnceWith(
        SPACE_NAME, USER_ID));
    assert.deepStrictEqual(userStories, [USER_STORY]);
  });
});

describe('UserStoryService.cleanupUserStories', function () {
  it('should delete all user stories', async function () {
    const test = getTestEnvironment();
    const UserStoryService = test.module.UserStoryService;

    await UserStoryService.cleanupUserStories(SPACE_NAME);

    assert.ok(
      test.mocks.firestoreService.cleanupUserStories.calledOnceWith(
        SPACE_NAME));
  });
});
