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
const { NotFoundException } = require('../../model/exceptions');
const { UserStory, Status } = require('../../model/user-story');
const { User } = require('../../model/user');
const { HelpCard } = require('../../views/help-card');
const { UserStoryCard } = require('../../views/user-story-card');
const { UserStoryListCard } = require('../../views/user-story-list-card');

const USER_STORY_ID = 'user-story-id';
const USER_STORY = new UserStory(USER_STORY_ID, {
  title: 'Title',
  description: 'Description',
  assignee: '123',
  status: Status.OPEN,
});
const SPACE_NAME = 'spaces/ABC';
const SPACE_DISPLAY_NAME = 'The Space';
const USER_NAME = 'users/123';
const USER_ID = '123';
const USER = new User(USER_ID, 'Display Name', 'avatar.jpg');
const EVENT = {
  type: 'MESSAGE',
  space: {
    name: SPACE_NAME,
    displayName: SPACE_DISPLAY_NAME,
  },
  user: {
    name: USER_NAME,
  },
}

const getTestEnvironment = () => {
  const aipServiceMock = {
    generateDescription: sinon.stub().returns('Description'),
  };
  const spaceServiceMock = {
    createSpace: sinon.stub(),
    deleteSpace: sinon.stub(),
  };
  const userServiceMock = {
    getUser: sinon.stub().returns(USER),
    getUsers: sinon.stub().returns({ '123': USER }),
  };
  const userStoryServiceMock = {
    getUserStory: sinon.stub().returns(USER_STORY),
    createUserStory: sinon.stub().returns(USER_STORY),
    listAllUserStories: sinon.stub().returns([USER_STORY]),
    listUserStoriesByUser: sinon.stub().returns([USER_STORY]),
    cleanupUserStories: sinon.stub(),
  };
  const appActionHandlerMock = {
    execute: sinon.stub().returns({ text: 'Card clicked.' }),
  };

  return {
    App: proxyquire('../../controllers/app', {
      '../services/aip-service': {
        AIPService: aipServiceMock,
      },
      '../services/space-service': {
        SpaceService: spaceServiceMock,
      },
      '../services/user-service': {
        UserService: userServiceMock,
      },
      '../services/user-story-service': {
        UserStoryService: userStoryServiceMock,
      },
      './app-action-handler': appActionHandlerMock,
    }),
    mocks: {
      aipService: aipServiceMock,
      spaceService: spaceServiceMock,
      userService: userServiceMock,
      userStoryService: userStoryServiceMock,
      appActionHandler: appActionHandlerMock,
    },
  };
};

describe('App', function () {
  describe('ADDED_TO_SPACE event', function () {
    it('should create space and return welcome message', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = { ...EVENT, type: 'ADDED_TO_SPACE' };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: 'Thank you for adding the Project Management app.' +
          ' Message the app for a list of available commands.'
      });
      assert.ok(test.mocks.spaceService.createSpace.calledOnceWith(
        SPACE_NAME, SPACE_DISPLAY_NAME));
    });
  });

  describe('REMOVED_FROM_SPACE event', function () {
    it('should delete space and return empty response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = { ...EVENT, type: 'REMOVED_FROM_SPACE' };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {});
      assert.ok(test.mocks.spaceService.deleteSpace.calledOnceWith(SPACE_NAME));
    });
  });

  describe('CARD_CLICKED event', function () {
    it('should execute AppActionHandler', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = { ...EVENT, type: 'CARD_CLICKED' };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, { text: 'Card clicked.' });
      assert.ok(test.mocks.appActionHandler.execute.calledOnceWith(event));
    });
  });

  describe('MESSAGE event with /createUserStory command', function () {
    it('should create user story and return response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          argumentText: 'Title',
          slashCommand: {
            commandId: 1
          }
        }
      };

      const response = await App.execute(event);

      assert.strictEqual(
        response.text, `<${USER_NAME}> created a user story.`);
      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoryCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryCard);
      assert.ok(
        test.mocks.aipService.generateDescription.calledOnceWith('Title'));
      assert.ok(
        test.mocks.userStoryService.createUserStory.calledOnceWith(
          SPACE_NAME, 'Title', 'Description'));
    });

    it('should return error message if title is empty', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          argumentText: '',
          slashCommand: {
            commandId: 1
          }
        }
      };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: 'Title is required.'
          + ' Include a title in the command: */createUserStory* _title_'
      });
      assert.ok(test.mocks.userStoryService.createUserStory.notCalled);
    });
  });

  describe('MESSAGE event with /myUserStories command', function () {
    it('should list user stories and return response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          slashCommand: {
            commandId: 2
          }
        }
      };

      const response = await App.execute(event);

      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoriesCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryListCard);
      assert.ok(
        test.mocks.userStoryService.listUserStoriesByUser.calledOnceWith(
          SPACE_NAME, USER_NAME));
    });
  });

  describe('MESSAGE event with /userStory command', function () {
    it('should get user story and return response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          argumentText: USER_STORY_ID,
          slashCommand: {
            commandId: 3
          }
        }
      };

      const response = await App.execute(event);

      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoryCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryCard);
      assert.ok(
        test.mocks.userStoryService.getUserStory.calledOnceWith(
          SPACE_NAME, USER_STORY_ID));
      assert.ok(
        test.mocks.userService.getUser.calledOnceWith(SPACE_NAME, USER_ID));
    });

    it('should return error message if story is not found', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          argumentText: USER_STORY_ID,
          slashCommand: {
            commandId: 3
          }
        }
      };
      test.mocks.userStoryService.getUserStory.throws(new NotFoundException());

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: `⚠️ User story ${USER_STORY_ID} not found.`
      });
      assert.ok(
        test.mocks.userStoryService.getUserStory.calledOnceWith(
          SPACE_NAME, USER_STORY_ID));
    });

    it('should return error message if title is empty', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          argumentText: '',
          slashCommand: {
            commandId: 3
          }
        }
      };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: 'User story ID is required.'
          + ' Include an ID in the command: */userStory* _id_'
      });
      assert.ok(test.mocks.userStoryService.getUserStory.notCalled);
    });
  });

  describe('MESSAGE event with /manageUserStories command', function () {
    it('should list user stories and return response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          slashCommand: {
            commandId: 4
          }
        }
      };

      const response = await App.execute(event);

      assert.strictEqual(response.actionResponse.type, 'DIALOG');
      assert.ok(
        response.actionResponse.dialogAction.dialog.body
        instanceof UserStoryListCard);
      assert.ok(
        test.mocks.userStoryService.listAllUserStories.calledOnceWith(
          SPACE_NAME));
      assert.ok(
        test.mocks.userService.getUsers.calledOnceWith(SPACE_NAME, [USER_ID]));
    });
  });

  describe('MESSAGE event with /cleanupUserStories command', function () {
    it('should delete user stories and return response', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          slashCommand: {
            commandId: 5
          }
        }
      };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: `<${USER_NAME}> deleted all the user stories.`
      });
      assert.ok(
        test.mocks.userStoryService.cleanupUserStories.calledOnceWith(
          SPACE_NAME));
    });
  });

  describe('MESSAGE event with invalid slash command', function () {
    it('should return error message', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          slashCommand: {
            commandId: 99
          }
        }
      };

      const response = await App.execute(event);

      assert.deepStrictEqual(response, {
        text: '⚠️ Unrecognized command.'
      });
    });
  });

  describe('MESSAGE event with user stories argument text', function () {
    const acceptedArguments = [
      'user stories',
      'USER STORIES',
      'User Stories',
      ' user stories ',
      'userstories',
      'USERSTORIES',
      'UserStories',
      ' userstories ',
    ];
    for (const argumentText of acceptedArguments) {
      context(`with argument text: ${argumentText}`, function () {
        it('should list user stories and return response', async function () {
          const test = getTestEnvironment();
          const App = test.App;
          const event = {
            ...EVENT,
            message: {
              text: argumentText,
              argumentText: argumentText,
            }
          };

          const response = await App.execute(event);

          assert.strictEqual(response.cardsV2.length, 1);
          assert.strictEqual(response.cardsV2[0].cardId, 'userStoriesCard');
          assert.ok(response.cardsV2[0].card instanceof UserStoryListCard);
          assert.ok(
            test.mocks.userStoryService.listUserStoriesByUser.calledOnceWith(
              SPACE_NAME, USER_NAME));
        });
      });
    }
  });

  describe('MESSAGE event without any commands', function () {
    it('should return help card', async function () {
      const test = getTestEnvironment();
      const App = test.App;
      const event = {
        ...EVENT,
        message: {
          text: 'Any',
          argumentText: 'Any',
        }
      };

      const response = await App.execute(event);

      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'helpCard');
      assert.ok(response.cardsV2[0].card instanceof HelpCard);
    });
  });
});
