/**
 * Copyright 2018 Google Inc.
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

/**
 * Description: A basic Chat Bot setup, to be used with Google Cloud Functions.
 */

var BOT_NAME = "Basicbot";

exports.basicBot = (req, res) => {
  switch (req.body.type) {
    case "ADDED_TO_SPACE":
      res.send(handleAddToSpace(req.body));
      break;
    case "MESSAGE":
      res.send(handleMessage(req.body));
      break;
    case "CARD_CLICKED":
      res.send(handleCardClick(req.body));
      break;
  }
};

/**
 * Handles interactions when when the Bot is added to the Room
 * @param {Object} body
 * @returns {Object} returns a Card with widgets containing key value pairs
 */
function handleAddToSpace(body) {
  return getHelp();
}

/**
 * Handles Type of MESSAGE, cleans the text to find what search text was used and returns proper response
 * @param {Object} body , the request body object, here is deferenced to more easily use the text string
 * @returns {Object} Returns a Card object with multiple images and buttons
 */
function handleMessage({ text, ...body }) {
  switch (cleanText(text)) {
    case "i love dogs":
      return getInteractiveCard();
      break;
  }
}

/**
 * Handles the interaction when a card is clicked. Returns a single image
 * @param {Object} body
 * @returns {Object} returns a card object with the proper actionResponse to update the existing comment
 */
function handleCardClick(body) {
  let { cards } = getSingleImage(body.action.parameters[0].value);
  return {
    actionResponse: {
      type: "UPDATE_MESSAGE"
    },
    cards
  };
}

/**
 * Removed bot name, extra spaces, and returns back the important part of the text sent
 * @param {String} text
 * @return {String}
 */
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(`@${BOTNAME.toLowerCase()}`, "")
    .split(" ")
    .filter(char => char !== "")
    .join(" ");
}

/**
 * Returns a static interactive card, you can map over arrays to populate something similar
 * @returns {Object}
 */
function getInteractiveCard() {
  let imageUrls = [
    "http://www.freepngimg.com/download/dog/9-dog-png-image-picture-download-dogs.png",
    "http://www.freepngimg.com/download/dog/9-dog-png-image-picture-download-dogs.png",
    "http://www.freepngimg.com/download/dog/9-dog-png-image-picture-download-dogs.png"
  ];
  return {
    cards: [
      {
        header: {
          title: "Which type",
          subtitle: "Click on to Choose",
          imageUrl:
            "http://www.freepngimg.com/download/dog/9-dog-png-image-picture-download-dogs.png",
          imageStyle: "IMAGE"
        },
        sections: [
          {
            widgets: getWidgets(imageUrls, getImageButtonWidget)
          }
        ]
      }
    ]
  };
}

/**
 * Return an array of widgets
 * @param {Array} urls a simple array of imageUrls, strings
 * @param {Function} widgetComposer a function used to compose a widget object
 * @returns {Array}
 */
function getWidgets(urls, widgetComposer) {
  return urls.map(url => widgetComposer(url));
}

/**
 * Returns a Widget with an image and button with a set url parameter
 * @param {String} imageUrl
 * @param {String} actionMethodName a simple string that can be passed to choose what actionMethodName is to be specified
 * @return {Object} a widget with an image and button
 */
function getImageButtonWidget(imageUrl, actionMethodName = "choose") {
  return {
    image: {
      imageUrl
    },
    buttons: [
      {
        textButton: {
          text: "Select",
          onClick: {
            action: {
              actionMethodName,
              parameters: [
                {
                  key: "url",
                  value: imageUrl
                }
              ]
            }
          }
        }
      }
    ]
  };
}

/**
 * Returns a Single Card with a Single Image
 * @param {String} imageUrl
 * @returns {Object}
 */
function getSingleImage(imageUrl) {
  return {
    cards: [
      {
        sections: [
          {
            widgets: [
              {
                image: {
                  imageUrl
                }
              }
            ]
          }
        ]
      }
    ]
  };
}

/**
 * Returns a Card List Commands/Usage of the bot
 * @returns {Object}
 */
function getHelp({ user }) {
  let commands = [
    ["Your First Command", `@${BOTNAME} {command name}`],
    ["Interactive Command", `@${BOTNAME} i love dogs`]
  ];
  return {
    cards: [
      {
        header: {
          title: `Need Help ${user.displayName}?`,
          subtitle: "Examples Below:",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2000px-Google_%22G%22_Logo.svg.png",
          imageStyle: "IMAGE"
        },
        sections: [
          {
            widgets: getWidgetValuePair(commands)
          }
        ]
      }
    ]
  };
}

/**
 * Creates an array of widget objects with key value pairs
 * @param {Array} commands an array of array of length 2 (aka array of tuples or key value pairs)
 * @returns {Array}
 */
function getWidgetValuePair(commands) {
  return commands.map(command => ({
    keyValue: {
      topLabel: command[0],
      content: command[1]
    }
  }));
}
