# Copyright 2020 Google LLC
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
import time
import tracemalloc

from functools import wraps
from typing import Any, Callable, Mapping, Tuple, Union


def timeit(f: Callable):
  """Times how long a method takes to run.

  Args:
      f (Callable): the method.

  Returns:
      Any: the method's return.
  """
  def timed(*args: Mapping[str, Any], **kw: Mapping[str, Any]) -> Any:
    ts = time.time()
    try:
      return f(*args, **kw)
    finally:
      te = time.time()
      logging.debug('%s %0.3fms', f.__name__, ((te - ts) * 1000))
  return timed


def measure_memory(f: Callable) -> Any:
  """Measures the execution time and memory usage of a method.

  Args:
      f (Callable): the method.

  Returns:
      Any: the method's return.
  """
  def decorate(*args: Mapping[str, Any], **kw: Mapping[str, Any]) -> Any:
    try:
      tracemalloc.start()
      ts = time.time()
      return f(*args, **kw)
    finally:
      te = time.time()
      current, peak = tracemalloc.get_traced_memory()
      logging.info('Function Name        : %s', f.__name__)
      logging.info('Execution time       : %0.3fms', ((te - ts) * 1000))
      logging.info('Current memory usage : %04.3fM', (current / 10**6))
      logging.info('Peak                 : %04.3fM', (peak / 10**6))
      tracemalloc.stop()
  return decorate


def retry(exceptions: Union[Exception, Tuple[Exception]],
          tries: int = 4, delay: int = 5, backoff: int = 2):
  """Retry calling the decorated function using an exponential backoff.

    Args:
        exceptions: The exception to check. may be a tuple of
            exceptions to check.
        tries: Number of times to try (not retry) before giving up.
        delay: Initial delay between retries in seconds.
        backoff: Backoff multiplier (e.g. value of 2 will double the delay
            each retry).
        logger: Logger to use. If None, print.
    """

  def deco_retry(f):

    @wraps(f)
    def f_retry(*args, **kwargs):
      mtries, mdelay = tries, delay
      while mtries > 1:
        try:
          return f(*args, **kwargs)
        except exceptions as e:
          logging.warning('Try %d: "%s" - retrying in %d seconds...',
                          (tries - mtries + 1), e, mdelay)
          time.sleep(mdelay)
          mtries -= 1
          mdelay *= backoff
      return f(*args, **kwargs)

    return f_retry  # true decorator

  return deco_retry


def lazy_property(f: Callable):
  """Decorator that makes a property lazy-evaluated.

  Args:
    f: the function to convert to a lazy property.
  """
  attr_name = '_lazy_' + f.__name__

  @property
  def _lazy_property(self) -> Any:
    if not hasattr(self, attr_name):
      setattr(self, attr_name, f(self))
    return getattr(self, attr_name)
  return _lazy_property
