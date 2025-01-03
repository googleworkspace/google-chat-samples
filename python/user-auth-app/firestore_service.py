# Copyright 2025 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Functions to handle database operations."""

from google.cloud import firestore

# The prefix used by the Google Chat API in the User resource name.
USERS_PREFIX = "users/"

# The name of the users collection in the database.
USERS_COLLECTION = "users"

# Initialize the Firestore database using Application Default Credentials.
db = firestore.Client(database="auth-data")

def store_token(user_name: str, access_token: str, refresh_token: str):
    """Saves the user's OAuth2 tokens to storage."""
    doc_ref = db.collection(USERS_COLLECTION).document(user_name.replace(USERS_PREFIX, ""))
    doc_ref.set({ "accessToken": access_token, "refreshToken": refresh_token })

def get_token(user_name: str) -> dict | None:
    """Fetches the user's OAuth2 tokens from storage."""
    doc = db.collection(USERS_COLLECTION).document(user_name.replace(USERS_PREFIX, "")).get()
    if doc.exists:
        return doc.to_dict()
    return None
