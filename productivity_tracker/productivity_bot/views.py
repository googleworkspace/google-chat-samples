# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.http import JsonResponse
from django.views import View

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from productivity_bot.inbound_message_helpers import handle_inbound_message
from productivity_bot.message_users_helpers import send_reminder

from productivity_bot.models import ActiveLoops

import json

class ChatbotEvent(View):
    """This is the View that will handle chatbot events 
    (i.e. ADDED_TO_SPACE, MESSAGE, etc.)

    Corresponds to '/chatbot_event'

    This endpoint is to be invoked by Hangouts Chat Server

    Methods:
        dispatch: 
            Simply inheriting from super. Only present so we can add the
            method decorator 'csrf_exempt' and remove csrf protection as it is
            not relevant here.
        post: 
            This method will react according to the event.
    """

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(ChatbotEvent, self).dispatch(request, *args, **kwargs)

    def post(self, request):
        event = json.loads(request.body)
        print(request.POST)
        print(request.body)

        if event['type'] == 'ADDED_TO_SPACE':
            response = ('Hi, my name is Productivity Bot! I\'m going to help '+
                'you keep track of your productivity. To start your first'+
                'Working Session, say "start every X hours" (you can define '+
                'X to be anything over 1, including decimal values!)')
            return JsonResponse({'text': response})

        elif event['type'] == 'MESSAGE':
            message_text = event['message']['text']
            username = event['user']['name']
            space_name = event['space']['name']
            response = handle_inbound_message(message_text, username, space_name)
            return JsonResponse({'text': response})

        return JsonResponse({'status': '404'})


class MessageUsers(View):
    """This view is responsible for messaging users every X hours.

    Corresponds to '/message_users'

    This endpoint is to be invoked by App Engine's Cron Job

    Methods:
        dispatch: 
            Simply inheriting from super. Only present so we can add the
            method decorator 'csrf_exempt' and remove csrf protection as it is
            not relevant here.
        post: 
            This method will increment the mins_to_mssg attribute for every
            ActiveLoop object. It will also determine which users need to be
            messaged and message those users.
    """

    # Remove csrf protection from this endpoint
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(MessageUsers, self).dispatch(request, *args, **kwargs)

    def get(self, request):
        # TODO(ahez): Modularize this code into functions
        #    productivity_bot.message_users_helpers.py to make testing easier

        # increment all time units
        active_loops = ActiveLoops.objects.all()
        increment_loop_counters(active_loops)

        loops_to_mssg = active_loops.filter(mins_to_mssg=0)

        # Message spaces attributed to elems of loops_to_mssg
        spaces_to_message = map(
            lambda active_loop: active_loop.user.space_name, 
            loops_to_mssg
        )
        map(send_reminder,spaces_to_message)

        # Reset mins_to_mssg attribute for loops in loops_to_mssg
        for active_loop in loops_to_mssg:
            active_loop.mins_to_mssg = -1*active_loop.mssg_freq
            active_loop.save()

        return JsonResponse({'status': '404'})