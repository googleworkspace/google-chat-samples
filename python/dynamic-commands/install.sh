#!/bin/bash
# Copyright 2023 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Functions
function usage() {
  cat << EOF
install.sh
==========

Usage:
  install.sh [options]

Options:
  --project         GCP Project Id.
  --service-account The service account to use to run the admin app. This
                    should be the same as your main GCP service
                    account.
  --activate-apis   Activate all missing but required Cloud APIs
  --deploy-storage  (Re)Deploy GCS buckets


General switches:
  --dry-run         Don't do anything, just print the commands you would
                    otherwise run. Useful for testing.
  --help | -?       Show this text
EOF
}

function join { local IFS="$1"; shift; echo "$*"; }

PROJECT=
USER=
ACTIVATE_APIS=0
DEPLOY_STORAGE=0

# Command line parser
while [[ $1 == -* ]] ; do
  case $1 in
    --project*)
      IFS="=" read _cmd PROJECT <<< "$1" && [ -z ${PROJECT} ] && shift && PROJECT=$1
      ;;
    --service-account*)
      IFS="=" read _cmd USER <<< "$1" && [ -z ${USER} ] && shift && USER=$1
      ;;
    --activate-apis)
      ACTIVATE_APIS=1
      ;;
    --deploy-storage)
      DEPLOY_STORAGE=1
      ;;
    --dry-run)
      DRY_RUN=echo
      ;;
    --help)
      usage
      exit
      ;;
    "-?")
      usage
      exit
      ;;
    *)
      usage
      echo ""
      echo "Unknown parameter $1."
      exit
      ;;
  esac
  shift
done

# Check for active APIs
APIS_USED=(
  "chat"
  "cloudbuild"
  "cloudfunctions"
  "logging"
  "pubsub"
  "storage"
  "storage-api"
)

if [ ${ACTIVATE_APIS} -eq 1 ]; then
  ACTIVE_SERVICES="$(gcloud --project=${PROJECT} services list | cut -f 1 -d' ' | grep -v NAME)"

  for api in ${APIS_USED[@]}; do
    if [[ "${ACTIVE_SERVICES}" =~ ${api} ]]; then
      echo "${api} already active"
    else
      echo "Activating ${api}"
      ${DRY_RUN} gcloud --project=${PROJECT} services enable ${api}.googleapis.com
    fi
  done
fi

if [ ${DEPLOY_STORAGE} -eq 1 ]; then
  BUCKET=${PROJECT}-dynamic-commands

  # Create bucket if it's not already present
  ${DRY_RUN} gsutil ls -p ${PROJECT} gs://${BUCKET} > /dev/null 2>&1
  RETVAL=$?
  if (( ${RETVAL} != "0" )); then
    ${DRY_RUN} gsutil mb -p ${PROJECT} gs://${BUCKET}
  fi
fi

_ENV_VARS=(
  "GOOGLE_CLOUD_PROJECT=${PROJECT}"
)
ENVIRONMENT=$(join "," ${_ENV_VARS[@]})
PYTHON_RUNTIME=python310

${DRY_RUN} gcloud functions deploy "dynamic_commands" \
  --entry-point=dynamic                               \
  --service-account=${USER}                           \
  --runtime=${PYTHON_RUNTIME}                         \
  --source=`pwd`                                      \
  --set-env-vars=${ENVIRONMENT}                       \
  --memory=4096MB                                     \
  --timeout=240s                                      \
  --trigger-http                                      \
  --allow-unauthenticated                             \
  --quiet                                             \
  --project=${PROJECT}
