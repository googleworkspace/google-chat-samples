/**
 * Copyright 2024 Google LLC
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
const {VertexAI} = require('@google-cloud/vertexai');
const {env} = require('../env.js');

/**
 * Service that executes AI text prediction.
 */
exports.AIPService = {

  /**
   * Executes AI text prediction to determine whether the message contains a question.
   * @param {!string} message The user message.
   * @return {Promise<boolean>} Whether the user message contains a question.
   */
  containsQuestion: async function (message) {
    const prompt = `Does the message contain a question? Message: "${message}".
    Answer 'yes' or 'no' only.`;
    const response = await this.callPredict(prompt);
    return response.toLowerCase().includes('yes');
  },

  /**
   * Executes AI text prediction to respond to user question.
   * @param {!string} question The user question.
   * @param {!import('../model/message').Message[]} messages The messages to feed
   *     into the AI model.
   * @return {Promise<string>} The answer to the user question.
   */
  answerQuestion: async function (question, messages) {
    const messageText = messages.map(message => message.text).join('\n\n');

    const prompt = `You are an AI Knowledge Assistant that can answer questions
    from new employees purely based on previous answers given by users in a chat
    space. Based on the following conversation history: ${messageText}, please
    answer the following question: ${question}. If the conversation history does
    not provide an answer to the question, just respond
    "Information not available". Your response must be a single paragraph in
    plain text with no formatting.`;

    return this.callPredict(prompt);
  },

  /**
   * Executes AI text prediction using the given prompt.
   * @param {!string} prompt The prompt to send in the AI prediction request.
   * @return {Promise<string>} The predicted text.
   */
  callPredict: async function (prompt) {
    // Initialize Vertex with the Cloud project and location
    const vertexAI = new VertexAI({
      project: env.project,
      location: env.location,
    });

    // Instantiate the model
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      temperature: 0,
    });

    const request = {
      contents: [{role: 'user', parts: [{text: prompt, }]}],
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response.candidates[0].content.parts[0].text;

    if (env.logging) {
      console.log(JSON.stringify({
        message: 'callPredict',
        request,
        response,
      }));
    }

    return response;
  },

}
