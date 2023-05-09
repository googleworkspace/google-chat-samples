# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging

from auth.credentials import Credentials
from google.cloud import storage


class Cloud_Storage(object):
  """Cloud Storage helper

  Handles GCS operations.

  """

  def __init__(self, in_cloud=True, email: str = None, project: str = None):
    """constructor

    Keyword Arguments:
        in_cloud (bool):   (default: {True})
        email (str):  email address for the token (default: {None})
        project (str):  GCP project name (default: {None})
    """
    self.in_cloud = in_cloud
    self.email = email
    self.project = project

  @staticmethod
  def client(credentials: Credentials = None) -> storage.Client:
    return storage.Client(
        credentials=(credentials.credentials if credentials else None))

  @staticmethod
  def fetch_file(bucket: str, file: str,
                 credentials: Credentials = None) -> str:
    """fetch a file from GCS

    Arguments:
      bucket (str):  bucket name
      file (str):  file name

    Returns:
      (str):  file content
    """
    client = storage.Client(
        credentials=(credentials.credentials if credentials else None))

    try:
      content = client.get_bucket(bucket).blob(file).download_as_string()
    except Exception as ex:
      content = None
      logging.error('Error fetching file {f}\n{e}'.format(f=file, e=ex))

    return content
