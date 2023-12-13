/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A
 * [card](https://developers.google.com/chat/api/guides/v1/messages/create#create)
 * with a description of the available commands.
 */
exports.HelpCard = class {

  /**
   * Creates a Card with a description of the available commands.
   */
  constructor() {
    this.header = {
      title: 'Project Manager',
      subtitle: 'Agile Project Management app'
    };

    const commandsSection = {
      header: 'Available commands',
      widgets: [
        {
          decoratedText: {
            text: '/createUserStory <i>title</i>',
            bottomLabel: 'Create a user story with the given title.'
          }
        },
        {
          divider: {}
        },
        {
          decoratedText: {
            text: '/userStory <i>id</i>',
            bottomLabel: 'Displays the current status of a user story.'
          }
        },
        {
          divider: {}
        },
        {
          decoratedText: {
            text: '/myUserStories',
            bottomLabel: 'Lists all the user stories assigned to the user.',
            button: {
              text: 'Try it',
              onClick: {
                action: {
                  function: 'myUserStories'
                }
              }
            }
          }
        },
        {
          divider: {}
        },
        {
          decoratedText: {
            text: '/manageUserStories',
            bottomLabel: 'Opens a dialog for user story management.',
            button: {
              text: 'Try it',
              onClick: {
                action: {
                  function: 'manageUserStories',
                  interaction: 'OPEN_DIALOG'
                }
              }
            }
          }
        },
        {
          divider: {}
        },
        {
          decoratedText: {
            text: '/cleanupUserStories',
            bottomLabel: 'Deletes all user stories in the space.',
            button: {
              text: 'Try it',
              onClick: {
                action: {
                  function: 'cleanupUserStories'
                }
              }
            }
          }
        },
        {
          divider: {}
        },
        {
          decoratedText: {
            text: '<b>@Project Manager</b> userstories',
            bottomLabel: 'Lists all the user stories assigned to the user.'
          }
        },
      ]
    };

    this.sections = [commandsSection];
  }

}
