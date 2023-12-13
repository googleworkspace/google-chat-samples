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
const { UserStory, Status, Priority, Size } = require('../../../model/user-story');
const { UserStoryButtonsWidget } = require('../../../views/widgets/user-story-buttons-widget');
const { UserStoryCardType } = require('../../../views/widgets/user-story-card-type');

describe('UserStoryButtonsWidget', function () {
  it('should return widget for open story', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.OPEN,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Assign to me',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
                altText: 'Assign to me',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'assignUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Start',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/24dp/1x/baseline_play_arrow_black_24dp.png',
                altText: 'Start',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'startUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ false,
      /* showSave= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget for open story with edit button', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.OPEN,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Assign to me',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
                altText: 'Assign to me',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'assignUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Start',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/24dp/1x/baseline_play_arrow_black_24dp.png',
                altText: 'Start',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'startUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Edit',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/editor/edit_note/materialiconsoutlined/24dp/1x/outline_edit_note_black_24dp.png',
                altText: 'Edit',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'editUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ true,
      /* showSave= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget for open story with save button', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.OPEN,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Save',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/save/materialiconsoutlined/24dp/1x/outline_save_black_24dp.png',
                altText: 'Save',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'saveUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Assign to me',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
                altText: 'Assign to me',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'assignUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Start',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/24dp/1x/baseline_play_arrow_black_24dp.png',
                altText: 'Start',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'startUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Cancel',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/clear/materialicons/24dp/1x/baseline_clear_black_24dp.png',
                altText: 'Cancel',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'cancelEditUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ false,
      /* showSave= */ true);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget for open story with refresh button', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.OPEN,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Assign to me',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
                altText: 'Assign to me',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'assignUserStory',
                  interaction: undefined,
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_MESSAGE
                    }
                  ]
                }
              }
            },
            {
              text: 'Start',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/24dp/1x/baseline_play_arrow_black_24dp.png',
                altText: 'Start',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'startUserStory',
                  interaction: undefined,
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_MESSAGE
                    }
                  ]
                }
              }
            },
            {
              text: 'Refresh',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/navigation/refresh/materialicons/24dp/1x/baseline_refresh_black_24dp.png',
                altText: 'Refresh',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'refreshUserStory',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_MESSAGE
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_MESSAGE,
      /* showEdit= */ false,
      /* showSave= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget for started story', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.STARTED,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Assign to me',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
                altText: 'Assign to me',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'assignUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            },
            {
              text: 'Complete',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/done/materialicons/24dp/1x/baseline_done_black_24dp.png',
                altText: 'Complete',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'completeUserStory',
                  interaction: 'OPEN_DIALOG',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_DIALOG
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ false,
      /* showSave= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget for completed story with refresh button', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.COMPLETED,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
      Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
        buttonList: {
          buttons: [
            {
              text: 'Refresh',
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/navigation/refresh/materialicons/24dp/1x/baseline_refresh_black_24dp.png',
                altText: 'Refresh',
                imageType: 'CIRCLE'
              },
              onClick: {
                action: {
                  function: 'refreshUserStory',
                  parameters: [
                    {
                      key: 'id',
                      value: 'id'
                    },
                    {
                      key: 'cardType',
                      value: UserStoryCardType.SINGLE_MESSAGE
                    }
                  ]
                }
              }
            }
          ]
        }
      });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_MESSAGE,
        /* showEdit= */ false,
        /* showSave= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return empty object for completed story', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.COMPLETED,
      priority: Priority.LOW,
      size: Size.SMALL,
    });

    const actual = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ false,
      /* showSave= */ false);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story is null', function () {
    const actual = new UserStoryButtonsWidget(null);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story is undefined', function () {
    const actual = new UserStoryButtonsWidget();

    assert.strictEqual(Object.keys(actual).length, 0);
  });
});
