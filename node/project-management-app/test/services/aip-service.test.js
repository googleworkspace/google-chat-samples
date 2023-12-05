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

const getTestEnvironment = () => {
  const env = {
    project: 'project-id',
    location: 'location-id',
  };

  const predictionServiceClientMock = {
    predict: sinon.stub().returns([{
      predictions: [{
        structValue: {
          fields: {
            content: {
              stringValue: 'Predicted text.'
            }
          }
        }
      }]
    }]),
  };

  const aiplatformV1Mock = {
    PredictionServiceClient: sinon.stub().returns(predictionServiceClientMock),
  };

  const helpersMock = {
    toValue: sinon.stub().returnsArg(0),
  }

  return {
    module: proxyquire('../../services/aip-service', {
      '@google-cloud/aiplatform': {
        v1: aiplatformV1Mock,
        helpers: helpersMock,
      },
      '../env.js': {
        env: env,
      }
    }),
    mocks: {
      aiplatformV1: aiplatformV1Mock,
      helpers: helpersMock,
      predictionServiceClient: predictionServiceClientMock,
    },
  };
};

const getExpectedRequest = (prompt) => ({
  endpoint: 'projects/project-id/locations/location-id/publishers/google/models/text-bison',
  instances: [{ prompt: prompt }],
  parameters: {
    temperature: 0.2,
    maxOutputTokens: 256,
    topP: 0.95,
    topK: 40,
  },
});

describe('AIPService.generateDescription', function () {
  it('should call prediction service with generate description prompt',
    async function () {
      const test = getTestEnvironment();
      const AIPService = test.module.AIPService;
      const prompt =
        'Generate a description for a user story with the following title:'
        + '\n\nTitle';

      const predictedText = await AIPService.generateDescription('Title');

      assert.strictEqual(predictedText, 'Predicted text.');
      assert.strictEqual(test.mocks.helpers.toValue.callCount, 2);
      assert.ok(
        test.mocks.predictionServiceClient.predict.calledOnceWith(
          getExpectedRequest(prompt)));
    });
});

describe('AIPService.expandDescription', function () {
  it('should call prediction service with expand description prompt',
    async function () {
      const test = getTestEnvironment();
      const AIPService = test.module.AIPService;
      const prompt =
        'Expand the following user story description:\n\nDescription';

      const predictedText = await AIPService.expandDescription('Description');

      assert.strictEqual(predictedText, 'Predicted text.');
      assert.strictEqual(test.mocks.helpers.toValue.callCount, 2);
      assert.ok(
        test.mocks.predictionServiceClient.predict.calledOnceWith(
          getExpectedRequest(prompt)));
    });
});

describe('AIPService.correctDescription', function () {
  it('should call prediction service with correct grammar prompt',
    async function () {
      const test = getTestEnvironment();
      const AIPService = test.module.AIPService;
      const prompt =
        'Correct the grammar of the following user story description:'
        + '\n\nDescription';

      const predictedText = await AIPService.correctDescription('Description');

      assert.strictEqual(predictedText, 'Predicted text.');
      assert.strictEqual(test.mocks.helpers.toValue.callCount, 2);
      assert.ok(
        test.mocks.predictionServiceClient.predict.calledOnceWith(
          getExpectedRequest(prompt)));
    });
});

describe('AIPService.callPredict', function () {
  it('should call prediction service', async function () {
    const test = getTestEnvironment();
    const AIPService = test.module.AIPService;
    const prompt =
      'Generate a description for a user story with the following title:';

    const predictedText = await AIPService.callPredict('Prompt.');

    assert.strictEqual(predictedText, 'Predicted text.');
    assert.strictEqual(test.mocks.helpers.toValue.callCount, 2);
    assert.ok(
      test.mocks.predictionServiceClient.predict.calledOnceWith(
        getExpectedRequest('Prompt.')));
  });
});
