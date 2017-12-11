# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using Java on Google App Engine,
Standard Environment.


## Run the sample locally

  1. Download the [Google App Engine SDK](https://cloud.google.com/appengine).
  1. Run the sample.
    `mvn appengine:devserver`

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080/bot' \
  -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'
```