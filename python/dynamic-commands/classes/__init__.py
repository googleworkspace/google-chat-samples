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
from __future__ import annotations
from copy import deepcopy
from functools import wraps

import traceback
from operator import contains
from typing import Any, Callable, Dict


def error_to_trace(error: Exception = None) -> str:
  """Pulls a python stack trace from an error.

  Args:
      error (Exception, optional): the exception. Defaults to None.

  Returns:
      str: the stack trace
  """
  trace = ''
  if error:
    tb = traceback.TracebackException.from_exception(error).format()
    if tb:
      trace = '\n\nTrace:\n\n' + ''.join(tb)

  return f'{trace}'


class DictObj(dict):
  """DictObj allows Python `dict` items to be treated as first class objects.

  This allows the user to request items from `dict`s using the standard object
  notation, for example given a `dict` of
  ```
    d = DictObj({ 'a': { 'b': { 'c': 1 } } })
  ```
  the user can refer to `c` as
    `d.a.b.c`
  _or_
    `d.get('a').get('b').get('c')`

  Nested `dict`s will return as `DictObj`s themselves.
  """
  def dictobj(f: Callable) -> Any:
    """Decorator to ensure that a returned `dict` is converted to a `DictObj`

    Args:
        f (Callable): the function to wrap
    """
    @wraps(f)
    def wrapper(*args, **kwargs) -> Any:
      o = f(*args, **kwargs)
      if isinstance(o, dict):
        return DictObj(o)
      elif isinstance(o, list):
        return [DictObj(i) if isinstance(i, dict) else i for i in o]
      else:
        return o
    return wrapper

  def __init__(self, *args, **kw):
    super(DictObj, self).__init__(*args, **kw)

  def __get_field(self, __key: list[str], __default: Any = None,
                  __source: dict = None) -> Any:
    """Gets a field from the `__source` dict.

    This traverses the dict looking for the named field.

    Args:
        __key (str): the field to get.
        __default (Any, optional): default if field does not exist. Defaults to None.
        __source (dict, optional): dict to search. Defaults to None.

    If no `__source` is specified, the main `dict` is used, starting at the root.

    Returns:
        Any: the field value
    """
    if __source := __source.get(__key.pop(0), None):
      return self.__get_field(__key, __default, __source) if __key else __source

    return __source.get(__key, __default)

  @dictobj
  def get(self, __key: str, __default: Any = None) -> Any:
    """Gets a field from the dict.

    Args:
        __key (str): the field to get.
        __default (Any, optional): default if field does not exist. Defaults to None.

    Returns:
        Any: the field value or `__default` if the field is not found.
    """
    if contains(__key, '.'):
      k, r = __key.split('.', 1)
      o = DictObj(super().get(k, __default))
      return o.get(r, __default)

    else:
      return super().get(__key, __default)

  @dictobj
  def __getattribute__(self, __name: str) -> Any:
    """__getattribute__ _summary_

    Args:
        __name (str): _description_

    Returns:
        Any: _description_

    Raises:
        AttributeError:
    """
    try:
      return super().__getattribute__(__name)
    except AttributeError:
      # match (self.get(__name), self.RAISE_ON_EXCEPTION):
      #   case (None, True):
      #     raise
      #   case (o, _):
      #     return o
      return self.get(__name)

  @dictobj
  def __isub__(self, __key: str) -> DictObj:
    """Implements the '-' key to remove items.

    Args:
        __key (str): the key to remove
    """
    if contains(__key, '.'):
      k, r = __key.split('.', 1)
      o = DictObj(self.get(k))
      self[k] = o - r

    else:
      del self[__key]

    return self

  @dictobj
  def __sub__(self, __key: str) -> DictObj:
    """Implements the '-' key to remove items.

    Args:
        __key (str): the key to remove
    """
    if contains(__key, '.'):
      k, r = __key.split('.', 1)
      _o = self.get(k).copy()
      o = DictObj(_o)
      new = { k: o - r }

    else:
      new = self.copy()
      del new[__key]

    return new

  @dictobj
  def __add__(self, __value: Any) -> DictObj:
    """Implements the '+' key to add items.

    Args:
        __key (str): the key to add
    """
    return {**self, **__value}

  @dictobj
  def __iadd__(self, __value: Any) -> DictObj:
    """Implements the '+' key to add items.

    Args:
        __key (str): the key to add
    """
    self.update(__value)
    return self
