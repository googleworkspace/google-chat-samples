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
const { BadRequestException, NotFoundException } = require('../../model/exceptions');
const { UserStory, Status } = require('../../model/user-story');
const { User } = require('../../model/user');
const { EditUserStoryCard } = require('../../views/edit-user-story-card');
const { UserStoryCard } = require('../../views/user-story-card');
const { UserStoryCardType } = require('../../views/widgets/user-story-card-type');

const USER_STORY_ID = 'user-story-id';
const USER_STORY = new UserStory(USER_STORY_ID, {
  title: 'Title',
  description: 'Description',
  assignee: 'users/123',
  status: Status.OPEN,
});
const SPACE_NAME = 'spaces/ABC';
const SPACE_DISPLAY_NAME = 'The Space';
const USER_ID = '123';
const USER_NAME = 'users/123';
const USER_DISPLAY_NAME = 'Display Name';
const USER_AVATAR = 'avatar.jpg';
const USER = new User(USER_ID, USER_DISPLAY_NAME, USER_AVATAR);
const EVENT = {
  type: 'CARD_CLICKED',
  space: {
    name: SPACE_NAME,
    displayName: SPACE_DISPLAY_NAME,
  },
  user: {
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
    avatarUrl: USER_AVATAR,
  },
  common: {
  }
}

const getTestEnvironment = () => {
  const aipServiceMock = {
    generateDescription: sinon.stub().returns('New Description'),
    expandDescription: sinon.stub().returns('Expanded Description'),
    correctDescription: sinon.stub().returns('Corrected Description'),
  };
  const userServiceMock = {
    getUser: sinon.stub().returns(USER),
    createOrUpdateUser: sinon.stub(),
  };
  const userStoryServiceMock = {
    getUserStory: sinon.stub().returns(USER_STORY),
    assignUserStory: sinon.stub().returns(USER_STORY),
    startUserStory: sinon.stub().returns(USER_STORY),
    completeUserStory: sinon.stub().returns(USER_STORY),
    updateUserStory: sinon.stub().returns(USER_STORY),
  };
  const chatAppMock = {
    handleMyUserStories: sinon.stub().returns({
      text: 'handleMyUserStories'
    }),
    handleManageUserStories: sinon.stub().returns({
      text: 'handleManageUserStories'
    }),
    handleCleanupUserStories: sinon.stub().returns({
      text: 'handleCleanupUserStories'
    }),
  };

  return {
    AppActionHandler: proxyquire('../../controllers/app-action-handler', {
      '../services/aip-service': {
        AIPService: aipServiceMock,
      },
      '../services/user-service': {
        UserService: userServiceMock,
      },
      '../services/user-story-service': {
        UserStoryService: userStoryServiceMock,
      },
    }),
    mocks: {
      aipService: aipServiceMock,
      userService: userServiceMock,
      userStoryService: userStoryServiceMock,
      chatApp: chatAppMock,
    },
  };
};

const assertResponseIsValid = (test, response, cardType, updated) => {
  switch (cardType) {
    case UserStoryCardType.SINGLE_MESSAGE:
      assert.strictEqual(response.text, updated ? 'User story updated.' : null);
      assert.strictEqual(response.actionResponse.type, 'UPDATE_MESSAGE');
      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoryCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryCard);
      break;
    case UserStoryCardType.LIST_MESSAGE:
      assert.deepStrictEqual(response, {
        text: 'handleMyUserStories',
        type: 'UPDATE_MESSAGE',
      });
      assert.strictEqual(test.mocks.chatApp.handleMyUserStories.callCount, 1);
      break;
    case UserStoryCardType.SINGLE_DIALOG:
      assert.strictEqual(response.actionResponse.type, 'DIALOG');
      assert.deepStrictEqual(response.actionResponse.dialogAction.actionStatus,
        {
          statusCode: 'OK',
          userFacingMessage: 'Saved.'
        }
      );
      assert.ok(
        response.actionResponse.dialogAction.dialog.body
        instanceof EditUserStoryCard);
      break;
    case UserStoryCardType.LIST_DIALOG:
      assert.deepStrictEqual(response, { text: 'handleManageUserStories' });
      assert.strictEqual(
        test.mocks.chatApp.handleManageUserStories.callCount, 1);
      break;
    default:
      assert.strictEqual(response.text, updated ? 'User story updated.' : null);
      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoryCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryCard);
      break;
  }
};

describe('AppActionHandler', function () {
  describe('CANCEL_DIALOG event', function () {
    it('should return action response', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        isDialogEvent: true,
        dialogEventType: 'CANCEL_DIALOG',
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.deepStrictEqual(response, {
        actionResponse: {
          type: 'DIALOG',
          dialogAction: {
            actionStatus: 'OK'
          }
        }
      });
    });
  });

  describe('myUserStories function', function () {
    it('should call app.handleMyUserStories()', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        common: {
          invokedFunction: 'myUserStories'
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.deepStrictEqual(response, { text: 'handleMyUserStories' });
      assert.strictEqual(test.mocks.chatApp.handleMyUserStories.callCount, 1);
    });
  });

  describe('manageUserStories function', function () {
    it('should call app.handleManageUserStories()', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        common: {
          invokedFunction: 'manageUserStories'
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.deepStrictEqual(response, { text: 'handleManageUserStories' });
      assert.strictEqual(
        test.mocks.chatApp.handleManageUserStories.callCount, 1);
    });
  });

  describe('cleanupUserStories function', function () {
    it('should call app.handleCleanupUserStories()', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        common: {
          invokedFunction: 'cleanupUserStories'
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.deepStrictEqual(response, { text: 'handleCleanupUserStories' });
      assert.strictEqual(
        test.mocks.chatApp.handleCleanupUserStories.callCount, 1);
    });
  });

  describe('editUserStory function', function () {
    it('should get user story and return response', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        common: {
          invokedFunction: 'editUserStory',
          parameters: {
            id: USER_STORY_ID
          }
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.strictEqual(response.actionResponse.type, 'DIALOG');
      assert.ok(
        response.actionResponse.dialogAction.dialog.body
        instanceof EditUserStoryCard);
      assert.ok(test.mocks.userStoryService.getUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID));
      assert.ok(test.mocks.userService.getUser.calledOnceWith(
        SPACE_NAME, USER_ID));
    });
  });

  describe('assignUserStory function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should update user story and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            common: {
              invokedFunction: 'assignUserStory',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ true);
          assert.ok(test.mocks.userService.createOrUpdateUser.calledOnceWith(
            SPACE_NAME, USER));
          assert.ok(test.mocks.userStoryService.assignUserStory.calledOnceWith(
            SPACE_NAME, USER_STORY_ID, USER_NAME));
        });
      });
    }
  });

  describe('startUserStory function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should update user story and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            common: {
              invokedFunction: 'startUserStory',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ true);
          assert.ok(test.mocks.userStoryService.startUserStory.calledOnceWith(
            SPACE_NAME, USER_STORY_ID));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });
      });
    }
  });

  describe('completeUserStory function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should update user story and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            common: {
              invokedFunction: 'completeUserStory',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ true);
          assert.ok(test.mocks.userStoryService.completeUserStory.calledOnceWith(
            SPACE_NAME, USER_STORY_ID));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });
      });
    }
  });

  describe('cancelEditUserStory function', function () {
    it('should call app.handleManageUserStories()', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        isDialogEvent: true,
        common: {
          invokedFunction: 'cancelEditUserStory'
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.deepStrictEqual(response, { text: 'handleManageUserStories' });
      assert.strictEqual(
        test.mocks.chatApp.handleManageUserStories.callCount, 1);
    });
  });

  describe('saveUserStory function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should update user story and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            isDialogEvent: true,
            common: {
              invokedFunction: 'saveUserStory',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
              },
              formInputs: {
                title: {
                  stringInputs: {
                    value: ['New Title']
                  }
                },
                description: {
                  stringInputs: {
                    value: ['New Description']
                  }
                },
                status: {
                  stringInputs: {
                    value: ['STARTED']
                  }
                },
                priority: {
                  stringInputs: {
                    value: ['Low']
                  }
                },
                size: {
                  stringInputs: {
                    value: ['Small']
                  }
                },
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ true);
          assert.ok(test.mocks.userStoryService.updateUserStory.calledOnceWith(
            SPACE_NAME,
            USER_STORY_ID,
            'New Title',
            'New Description',
            'STARTED',
            'Low',
            'Small'));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });
      });
    }
  });

  describe('refreshUserStory function', function () {
    it('should get user story and return response', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      const event = {
        ...EVENT,
        common: {
          invokedFunction: 'refreshUserStory',
          parameters: {
            id: USER_STORY_ID
          }
        }
      };

      const response =
        await AppActionHandler.execute(event, test.mocks.chatApp);

      assert.strictEqual(response.actionResponse.type, 'UPDATE_MESSAGE');
      assert.strictEqual(response.cardsV2.length, 1);
      assert.strictEqual(response.cardsV2[0].cardId, 'userStoryCard');
      assert.ok(response.cardsV2[0].card instanceof UserStoryCard);
      assert.ok(test.mocks.userStoryService.getUserStory.calledOnceWith(
        SPACE_NAME, USER_STORY_ID));
      assert.ok(test.mocks.userService.getUser.calledOnceWith(
        SPACE_NAME, USER_ID));
    });
  });

  describe('generateUserStoryDescription function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should call AIP service and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            isDialogEvent: true,
            common: {
              invokedFunction: 'generateUserStoryDescription',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
                assignee: USER_NAME,
              },
              formInputs: {
                title: {
                  stringInputs: {
                    value: ['New Title']
                  }
                },
                description: {
                  stringInputs: {
                    value: ['New Description']
                  }
                },
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ false);
          assert.ok(test.mocks.aipService.generateDescription.calledOnceWith(
            'New Title'));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });

        it('should not call AIP service if title is empty', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            isDialogEvent: true,
            common: {
              invokedFunction: 'generateUserStoryDescription',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
              },
              formInputs: {
                title: {
                  stringInputs: {
                    value: ['']
                  }
                },
                description: {
                  stringInputs: {
                    value: ['']
                  }
                },
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ false);
          assert.ok(test.mocks.aipService.generateDescription.notCalled);
        });
      });
    }
  });

  describe('expandUserStoryDescription function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should call AIP service and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            isDialogEvent: true,
            common: {
              invokedFunction: 'expandUserStoryDescription',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
                assignee: USER_NAME,
              },
              formInputs: {
                title: {
                  stringInputs: {
                    value: ['New Title']
                  }
                },
                description: {
                  stringInputs: {
                    value: ['New Description']
                  }
                },
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ false);
          assert.ok(test.mocks.aipService.expandDescription.calledOnceWith(
            'New Description'));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });

        it('should not call AIP service if description is empty',
          async function () {
            const test = getTestEnvironment();
            const AppActionHandler = test.AppActionHandler;
            const event = {
              ...EVENT,
              isDialogEvent: true,
              common: {
                invokedFunction: 'expandUserStoryDescription',
                parameters: {
                  id: USER_STORY_ID,
                  cardType: cardType,
                },
                formInputs: {
                  title: {
                    stringInputs: {
                      value: ['']
                    }
                  },
                  description: {
                    stringInputs: {
                      value: ['']
                    }
                  },
                }
              }
            };

            const response =
              await AppActionHandler.execute(event, test.mocks.chatApp);

            assertResponseIsValid(test, response, cardType, /* updated= */ false);
            assert.ok(test.mocks.aipService.expandDescription.notCalled);
          });
      });
    }
  });

  describe('correctUserStoryDescriptionGrammar function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should call AIP service and return response', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            isDialogEvent: true,
            common: {
              invokedFunction: 'correctUserStoryDescriptionGrammar',
              parameters: {
                id: USER_STORY_ID,
                cardType: cardType,
                assignee: USER_NAME,
              },
              formInputs: {
                title: {
                  stringInputs: {
                    value: ['New Title']
                  }
                },
                description: {
                  stringInputs: {
                    value: ['New Description']
                  }
                },
              }
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assertResponseIsValid(test, response, cardType, /* updated= */ false);
          assert.ok(test.mocks.aipService.correctDescription.calledOnceWith(
            'New Description'));
          assert.ok(test.mocks.userService.getUser.calledOnceWith(
            SPACE_NAME, USER_NAME));
        });

        it('should not call AIP service if description is empty',
          async function () {
            const test = getTestEnvironment();
            const AppActionHandler = test.AppActionHandler;
            const event = {
              ...EVENT,
              isDialogEvent: true,
              common: {
                invokedFunction: 'correctUserStoryDescriptionGrammar',
                parameters: {
                  id: USER_STORY_ID,
                  cardType: cardType,
                },
                formInputs: {
                  title: {
                    stringInputs: {
                      value: ['']
                    }
                  },
                  description: {
                    stringInputs: {
                      value: ['']
                    }
                  },
                }
              }
            };

            const response =
              await AppActionHandler.execute(event, test.mocks.chatApp);

            assertResponseIsValid(test, response, cardType, /* updated= */ false);
            assert.ok(test.mocks.aipService.correctDescription.notCalled);
          });
      });
    }
  });

  describe('Invalid function', function () {
    for (const cardType in UserStoryCardType) {
      context(`Card type: ${cardType}`, function () {
        it('should return error message', async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          const event = {
            ...EVENT,
            common: {
              invokedFunction: 'invalid',
              parameters: {
                id: USER_STORY_ID,
              },
            }
          };

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          if (this.cardType === UserStoryCardType.SINGLE_DIALOG
            || this.cardType === UserStoryCardType.LIST_DIALOG) {
            assert.deepStrictEqual(response, {
              actionResponse: {
                type: 'DIALOG',
                dialogAction: {
                  actionStatus: {
                    statusCode: 'INVALID_ARGUMENT',
                    userFacingMessage: '⚠️ Unrecognized action.'
                  }
                }
              }
            });
          } else {
            assert.deepStrictEqual(response, {
              text: '⚠️ Unrecognized action.'
            });
          }
        });
      });
    }
  });

  describe('Exceptions', function () {
    const event = {
      ...EVENT,
      common: {
        invokedFunction: 'saveUserStory',
        parameters: {
          id: USER_STORY_ID
        },
        formInputs: {
          title: {
            stringInputs: {
              value: ['New Title']
            }
          },
          description: {
            stringInputs: {
              value: ['New Description']
            }
          },
        }
      }
    };
    const exceptions = [
      new BadRequestException(),
      new NotFoundException(),
    ];

    context('Is Dialog Event', function () {
      for (const e of exceptions) {
        it(`should handle ${e.name}`, async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          test.mocks.userStoryService.updateUserStory.throws(e);
          event.isDialogEvent = true;

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assert.deepStrictEqual(response, {
            actionResponse: {
              type: 'DIALOG',
              dialogAction: {
                actionStatus: {
                  statusCode: e.statusCode,
                  userFacingMessage: e.message
                }
              }
            }
          });
        });
      }
    });

    context('Is Not Dialog Event', function () {
      for (const e of exceptions) {
        it(`should handle ${e.name}`, async function () {
          const test = getTestEnvironment();
          const AppActionHandler = test.AppActionHandler;
          test.mocks.userStoryService.updateUserStory.throws(e);
          event.isDialogEvent = false;

          const response =
            await AppActionHandler.execute(event, test.mocks.chatApp);

          assert.deepStrictEqual(response, {
            text: `⚠️ ${e.message}`
          });
        });
      }
    });

    it('should re-throw unrecognized exception', async function () {
      const test = getTestEnvironment();
      const AppActionHandler = test.AppActionHandler;
      test.mocks.userStoryService.updateUserStory.throws(new Error('test'));

      await assert.rejects(
        async () => AppActionHandler.execute(event, test.mocks.chatApp), Error);
    });
  });
});
