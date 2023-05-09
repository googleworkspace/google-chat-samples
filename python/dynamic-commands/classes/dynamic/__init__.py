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
from __future__ import annotations

import os
import sys
import types
from importlib import abc, import_module, machinery, reload
from typing import Any, Dict, Mapping, Optional

from .cloud_storage import Cloud_Storage


class DynamicClassFinder(abc.MetaPathFinder):
  """Check class type

  This class checks to see if the class being loaded is a subclass of
  'DynamicClass'. If it isn't, it won't be loaded.
  """

  def find_spec(self,
                fullname: str,
                path: str,
                target: Optional[str] = None) -> machinery.ModuleSpec:
    """Locate the file in GCS.

    Args:
        fullname (str): fully specified class name
        path (str): path to the file. unused here as we hardwire the path to
                    the GCS bucket in the loader for security.
        target (Optional[str], optional): The target. Defaults to None.

    Returns:
        machinery.ModuleSpec: a module spec
    """
    print(f'in find_spec: full_name = "{fullname}"')
    if 'dynamic' not in fullname:
      return None                     # we don't handle this this

    else:
      return machinery.ModuleSpec(fullname, DynamicClassLoader())


class DynamicClassLoader(abc.Loader):
  """Load a DynamicClass

  Load an arbitrary DynamicClass subclass into the Python class library
  dynamically. The location to check is hardwired here for security
  reasons.
  """

  def exec_module(self, module: types.ModuleType):
    """Read the code from GCS and execute (load) it.

    Args:
        module (types.ModuleType): the module.

    Raises:
        ModuleNotFoundError: raised if the module does not exist.
    """
    try:
      # Fetch the code here as string:
      # GCS? BQ? Firestore? All good options
      filename = module.__name__.split('.')[-1]
      code = Cloud_Storage.fetch_file(
          bucket=(f'{os.environ.get("GOOGLE_CLOUD_PROJECT")}-dynamic-commands'),
          file=f'{filename}.py'
      )
      exec(code, vars(module))
    except:
      raise ModuleNotFoundError()


class DynamicClass(object):
  """DynamicClass Abstract parent class

  In order to be loaded by the DynamicClass mechanism, all/any classes
  MUST extend this class and implement the 'run' method.
  """

  def install(module_name: str,
              class_name: str = 'Class') -> DynamicClass:
    """Inserts the finder into the import machinery.

    Args:
        module_name (str): the name of the module
        class_name (str, optional): the name of the loaded class.
                                    Defaults to 'Class'.

    Returns:
        DynamicClass: the new Class
    """
    sys.meta_path.append(DynamicClassFinder())
    _module = f'classes.dynamic.{module_name}'

    if _module in sys.modules:
      module = sys.modules[_module]
      module = reload(module)

    else:
      module = import_module(_module)

    return getattr(module, class_name)

  def run(self, **attributes: Mapping[str, str]) -> Dict[str, Any]:
    """Run the user's slash command code

    Args:
        context ([type], optional): Cloud Function context. Defaults to None.
        **attributes: list of attributes passed to the Class.

    Returns:
        Dict[str, Any]: return value
    """
    pass
