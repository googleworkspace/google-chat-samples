#!/bin/bash

# Deploys the two Cloud Functions in this project to Google Cloud.

# Before running this script, install the gcloud CLI, run `gcloud auth login` to
# authenticate, and `gcloud config set project` to select the GCP project for your Chat app,
# Optionally, replace `us-central1` below to deploy to a different GCP region.

echo "Deploying function app..."
gcloud functions deploy app \
  --gen2 \
  --region=us-central1 \
  --runtime=nodejs20 \
  --source=. \
  --entry-point=app \
  --trigger-http \
  --allow-unauthenticated

echo "Deploying function events-app..."
gcloud functions deploy events-app \
  --gen2 \
  --region=us-central1 \
  --runtime=nodejs20 \
  --source=. \
  --entry-point=eventsApp \
  --trigger-topic=events-api

echo "DONE!"
