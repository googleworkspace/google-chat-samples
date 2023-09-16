/**
 * Copyright 2023 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fetch = require('node-fetch');

/**
 * Google Cloud Function that responds to PageSpeed requests sent from a
 * Google Chat room.
 *
 * @param {!Object} req Request sent from Google Chat room
 * @param {!Object} res Response to send back
 */
exports.checkSpeed = async (req, res) => {
  if (req.method === 'GET' || !req.body.message) {
    res.send('Hello! This function is meant to be used in Google Chat.');
  }

  if (req.body.type === 'ADDED_TO_SPACE' && req.body.space.type === 'ROOM') {
    res.json({
      text: `Thank you for installing me to the ${req.body.space.displayName}!\nWhenever you need my help type @PageSpeed App followed by a URL in the format of https://example.com or https://www.example.com.`,
    });
  }

  const url = req.body.message.argumentText.replace(/\s/g, '');

  if (!validURL(url)) {
    if (req.body.message.space.type === 'DM') {
      res.json({text: 'Please send me an URL in the format of https://example.com or https://www.example.com so that I can check the corresponding PageSpeed Insights.'});
    } else {
      res.json({text: 'So that I can check PageSpeed Insights please type @PageSpeed App followed by an URL in the format of https://example.com or https://www.example.com.'});
    }
  }

  const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`);

  if (response.ok) {
    const data = await response.json();
    res.send(createMessage(url, data));
  } else {
    res.json({text: 'Something went wrong. Please make sure that the URL is of the format of https://example.com or https://www.example.com.'});
  }
};

/**
 * Validates a URL.
 * @param {string} url the URL.
 * @return {boolean} whether a URL is valid.
 */
function validURL(url) {
  const regex = new RegExp(/http(s)?:\/\/.*/i);
  return regex.test(url);
}

/**
 * Creates a card with PageSpeed data.
 * @param {string} url the URL.
 * @param {!Object} data the PageSpeed data.
 * @return {!Object} a card with the PageSpeed data.
 */
function createMessage(url, data) {
  const header = {
    title: 'PageSpeed Insights',
    subtitle: 'Powered by PageSpeed App',
    imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/speed/default/48px.svg',
    imageType: 'CIRCLE',
    imageAltText: '',
  };

  const textSection = {
    widgets: [
      {
        textParagraph: {
          text: `Page tested: ${url}`,
        },
      },
    ],
  };

  const metrics = data.loadingExperience.metrics;

  const chromeSection = {
    header: 'Chrome User Experience Report Results',
    widgets: [
      {
        decoratedText: {
          topLabel: 'First Contentful Paint',
          text: metrics.FIRST_CONTENTFUL_PAINT_MS.category,
        },
      },
      {
        decoratedText: {
          topLabel: 'First Input Delay',
          text: metrics.FIRST_INPUT_DELAY_MS.category,
        },
      },
    ],
  };

  const lighthouseSection = {
    header: 'Lighthouse Results',
    widgets: [],
  };

  for (const value of Object.values(data.lighthouseResult.audits)) {
    if ('displayValue' in value) {
      lighthouseSection.widgets.push({
        decoratedText: {
          topLabel: value.title,
          text: value.displayValue,
        },
      });
    }
  }

  return {
    cardsV2: [{
      cardId: 'pageSpeed',
      card: {
        name: 'PageSpeed Card',
        header,
        sections: [
          textSection,
          chromeSection,
          lighthouseSection,
        ],
      },
    }],
  };
}
