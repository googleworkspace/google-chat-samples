# Google Chat Project Management app

This code sample shows how to make a Google Chat app that a team can use to
manage projects in real time.

The Chat app is implemented as a Google Cloud Function using a Node.js runtime,
which responds to
[interaction events](https://developers.google.com/chat/api/guides/message-formats/events)
from Google Chat.

It uses [Vertex AI](https://cloud.google.com/vertex-ai) to help teams write user
stories (which represent features of a software system from the point of view of
a user for the team to develop) and persists the stories in a
[Firestore](https://cloud.google.com/firestore/docs) database.

## Tutorial

For detailed instructions to deploy and run this sample, follow the
[dedicated tutorial](https://developers.google.com/chat/tutorial-project-management)
in the Google Chat developer documentation.

## Scripts

- `npm run test` : Executes all the unit tests.
