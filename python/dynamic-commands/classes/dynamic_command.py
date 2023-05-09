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

import os
from typing import Any, Mapping

from card_framework.v2.card import Card
from card_framework.v2.card_header import CardHeader
from card_framework.v2.message import Message
from card_framework.v2.section import Section
from card_framework.v2.widgets.decorated_text import DecoratedText
from card_framework.v2.widgets.icon import Icon
from classes.dynamic import DynamicClass
from stringcase import snakecase

from . import DictObj, error_to_trace


class DynamicCommandHandler(object):
  @property
  def request(self) -> DictObj:
    return self._request

  @request.setter
  def request(self, request: Mapping[str, Any]) -> None:
    self._request = DictObj(request)

  @property
  def project(self) -> str:
    return os.environ.get('GCP_PROJECT')

  def execute_dynamic_command(self,
                              command: str,
                              attributes: Mapping[str, Any]) -> Mapping[str, Any]:
    """Loads and executes a dynamic command file.

    Args:
        command (str): the command to load and execute
        attributes (Mapping[str, Any]): the original request json

    Returns:
        Mapping[str, Any]: the resulting output json
    """
    try:
      processor = DynamicClass.install(module_name=command,
                                           class_name='HelloWorld')
      output = processor().run(attributes=attributes)
    except Exception as e:
      print(f'Exception in command processor: {error_to_trace(e)}')
      output = self.error(command=command)

    return output

  def process(self, req: Mapping[str, Any]) -> Mapping[str, Any]:
    self.request = req
    print(f'Message received: {self.request}')

    try:
      output = dict()

      match req.get('type'):
        case 'MESSAGE':
          if req.get('message').get('slashCommand'):
            # A recognized slash command. These must be defined in the UI
            # as normal.
            # Unknown slash commands ("/hello" for example) would be treated
            # as random text, and passed as a mesage annotation to be handled by
            # one of the below cases.
            # We have not defined any slash commands in the UI, so this it left
            # as an example only.

            # match self.request.message.annotations[0].slashCommand.commandName:
            #   case '/list':
            #     output = self.execute_dynamic_command(command='list',
            #                                           request_json=req)

            #   case '/create':
            #     output = self.fetch_new_job_details()

            #   case '/edit':
            #     output = self.edit_job()

            output = self.error(
                message='Unsupported action {self.request.message.annotations[0].slashCommand.commandName}', type=unknown)

          elif self.request.message.annotations \
                  and self.request.message.annotations[0].userMention:
              # This is a user mention ("@[Bot name] [something something]), where
              # [something something] will be converted to snakeCase and used as
              # the command and hence the filename to load and execute.
            match ' '.join(self.request.message.text.split(' ')[1:]):
              case _ as text:
                command = snakecase(text).lower()
                print(f'Loading and running {text}')
                output = self.execute_dynamic_command(command, {"request_json": req})

          elif self.request.message.space.type == 'DM':
            # This is just random text in a DM with the bot. Anything that's
            # a 'new' slash command (like '/hello', for example) will have the
            # '/' stripped and then be treated as just random text.
            text = ''.join(self.request.message.text.split('/')[1:]) \
                if self.request.message.text[0] == '/' \
                else self.request.message.text
            command = snakecase(text).lower()
            print(f'Loading and running {text}')
            output = self.execute_dynamic_command(command, {"request_json": req})

          else:
            # Anything else? IDK, raise an error.
            output = self.error(
                message='Unsupported action {type}', type=req.get('type'))

        case 'CARD_CLICKED':
          # Standard 'CARD_CLICKED' handler.
          if f := getattr(self,
                          self.request.action.actionMethodName,
                          None):
            output = f()

          else:
            output = self.error(self.request.action.actionMethodName)

        case 'ADDED_TO_SPACE':
          return 'Thanks!'

        case _ as unknown:
          output = self.error(message='Unsupported action {type}', type=unknown)

      if output:
        print(output)

      return output

    except Exception as e:
      return {'text': error_to_trace(e)}

  def error(self, message: str = "'{command}' is not a valid command.",
            **kwargs) -> Mapping[str, Any]:
    """Produces a standard error message card.

    Args:
        message (str, optional): the error message. Defaults to "{command} is not a valid command.".

    Returns:
        Mapping[str, Any]: the error card
    """
    widgets = [DecoratedText(top_label='ERROR.',
                             text=message.format(**kwargs),
                             start_icon=Icon(known_icon=Icon.KnownIcon.STAR))]
    header = CardHeader(title='Error')
    card = Card(header=header, sections=[Section(widgets=widgets)])

    return Message(cards=[card]).render()
