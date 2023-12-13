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

/**
 * @fileoverview Service that calls the Vertex AI API for generative AI text
 * prediction.
 */

/**
 * [Vertex AI Platform](https://cloud.google.com/vertex-ai/docs) client library.
 */
const aiplatform = require('@google-cloud/aiplatform');
const { env } = require('../env.js');

// Imports the Google Cloud Prediction service client.
const { PredictionServiceClient } = aiplatform.v1;

// Imports the helper module for converting arbitrary protobuf.Value objects.
const { helpers } = aiplatform;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: `${env.location}-aiplatform.googleapis.com`,
};

// Specify the Vertex AI model we use to generate text.
const publisher = 'google';
const model = 'text-bison';

// Instantiates a client.
const predictionServiceClient = new PredictionServiceClient(clientOptions);

// Prompts used to generate text using Vertex AI.
const generationPrompt = 'Generate a description for a user story with the following title:';
const grammarPrompt = 'Correct the grammar of the following user story description:'
const expansionPrompt = 'Expand the following user story description:';

/**
 * Service that executes AI text prediction.
 */
exports.AIPService = {

  /**
   * Executes AI text prediction to generate a description for a user story.
   * @param {!string} title The title of the user story.
   * @return {Promise<string>} The generated description.
   */
  generateDescription: async function (title) {
    return this.callPredict(`${generationPrompt}\n\n${title}`);
  },

  /**
   * Executes AI text prediction to expand a user story description.
   * @param {!string} description The description of the user story.
   * @return {Promise<string>} The expanded description.
   */
  expandDescription: async function (description) {
    return this.callPredict(`${expansionPrompt}\n\n${description}`);
  },

  /**
   * Executes AI text prediction to correct the grammar of a user story
   * description.
   * @param {!string} description The description of the user story.
   * @return {Promise<string>} The corrected description.
   */
  correctDescription: async function (description) {
    return this.callPredict(`${grammarPrompt}\n\n${description}`);
  },

  /**
   * Executes AI text prediction using the given prompt.
   * @param {!string} prompt The prompt to send in the AI prediction request.
   * @return {Promise<string>} The predicted text.
   */
  callPredict: async function (prompt) {
    // Configure the parent resource.
    const endpoint =
      `projects/${env.project}/locations/${env.location}/publishers/${publisher}/models/${model}`;

    const requestPrompt = { prompt: prompt };
    const instanceValue = helpers.toValue(requestPrompt);
    const instances = [instanceValue];

    const parameter = {
      temperature: 0.2,
      maxOutputTokens: 256,
      topP: 0.95,
      topK: 40,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Execute the predict request and return the first predicted text content.
    const response = await predictionServiceClient.predict(request);
    return response[0].predictions[0].structValue.fields.content.stringValue;
  },

}
