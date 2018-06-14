# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import JsonResponse

from django.shortcuts import render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json


class ChatbotEvent(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(ChatbotEvent, self).dispatch(request, *args, **kwargs)

    def post(self, request):
        event = json.loads(request.body)

        if event['type'] == 'ADDED_TO_SPACE' and event['space']['type'] == 'ROOM':
            text = 'Thanks for adding me to "%s"!' % event['space']['displayName']
        elif event['type'] == 'MESSAGE':
            text = 'You said: `%s`' % event['message']['text']
        else:
            return
        return JsonResponse({'text': text})