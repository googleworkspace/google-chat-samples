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
const { VertexAI } = require('@google-cloud/vertexai');
const { env } = require('../env.js');

// Prompts used to generate text using Vertex AI.
const questionPrompt = 'The following message was sent by a user in a chat conversation.'
  + ' Does the message contain a question? Answer yes or no only.\n\nMessage:';
const chatCorpusPrompt = 'You are an AI Knowledge Assistant that can answer questions'
  + ' from new employees based on previous answers given by users in a chat space'
  + ' or content posted by users in the chat space.\n\n'
  + 'This is the conversation history so far:';
const answerQuestionPrompt = 'Based on the knowledge provided in the conversation'
  + ' history above, please answer the following question. If the conversation'
  + ' history does not provide an answer to the question, politely explain that'
  + ' you cannot answer the question.';

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
    const response = await this.callPredict(`${questionPrompt} ${message}`);
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
    return this.callPredict(
      `${chatCorpusPrompt}\n\n${messageText}\n\n${answerQuestionPrompt}\n\n${question}`);
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
      model: 'gemini-1.0-pro',
    });

    const chat = generativeModel.startChat({});
    const result = await chat.sendMessage(prompt);
    return result.response.candidates[0].content.parts[0].text;
  },

}
