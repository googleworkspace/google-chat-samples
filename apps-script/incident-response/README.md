# Google Chat Incident Response app

This code sample creates a Google Chat app that helps users respond to technical
incidents.

This example creates an Apps Script app with two parts: a web page and a Chat app.

The web page simulates an incident by asking users to enter some basic incident
information: title, description, and email addresses of the responders.
The information entered is passed on to the Chat app, which automatically creates
a [Chat space](https://developers.google.com/chat/api/reference/rest/v1/spaces),
adds the responders as members, and posts the incident description as a message.
This represents a starting point for an incident response in this example,
but it could be modified, for example, to respond automatically to an outage
detected by a monitoring agent or a high-priority case created in a CRM.

After the response team resolves the incident, they use a slash command to
automatically create a post-mortem in Google Docs.
The app adds a user-provided description of the incident resolution, a transcript
of the Chat conversation, and a summary of the conversation (automatically
generated using [Vertex AI](https://cloud.google.com/vertex-ai)) to the post-mortem.
