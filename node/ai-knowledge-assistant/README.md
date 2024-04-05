# Google Chat AI Knowledge Assistant app

This code sample shows how to make a Google Chat app that answers questions
based on conversations in Chat spaces with generative AI powered by Vertex AI
with Gemini. The Chat app uses the Google Workspace Events API plus PubSub to
recognize and answer questions posted in Chat spaces in real time, even when it
isn't mentioned.

The Chat app uses all the messages sent in the space as a data source and
knowledge base: when someone asks a question, the Chat app checks for previously
shared answers and then shares the best one. If no answer is found, it @mentions
a space manager to ask for an answer. By using Gemini AI, the Google Chat app
adapts and grows its knowledge base as it continuously trains on conversations
in spaces it's added to.

The Chat app is implemented as two Google Cloud Function using a Node.js runtime,
which respond to
[interaction events](https://developers.google.com/workspace/chat/interaction-events)
and
[subscription events](https://developers.google.com/workspace/events/guides/events-chat)
from Google Chat.

It uses [Vertex AI](https://cloud.google.com/vertex-ai) with the
[Gemini](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/overview)
model to answer to user questions based on the knowledge base extracted from the
conversation history.

## Tutorial

For detailed instructions to deploy and run this sample, follow the
[dedicated tutorial](https://developers.google.com/workspace/chat/tutorial-ai-knowledge-assistant)
in the Google Chat developer documentation.

## Scripts

- `npm run test` : Executes all the unit tests.
- `./deploy.sh`  : Deploys the two Cloud Functions to GCP using gcloud CLI.
