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
from typing import Any, Mapping, Union

import flask
from classes.dynamic_command import DynamicCommandHandler


def dynamic(req: Union[Mapping[str, Any], flask.Request]):
  if isinstance(req, Mapping):
    request_json = req

  else:
    if req.method == 'GET':
      return 'Sorry, this function must be called from a Google Chat.'

    request_json = req.get_json(silent=True)

  return DynamicCommandHandler().process(req=request_json)


def main(unused_argv):
  """Used for testing.

  Args:
      unused_argv (List[Any]): unused
  """
  print(DynamicCommandHandler().execute_dynamic_command(command='hello',
      attributes={}))


if __name__ == '__main__':
  main([])
