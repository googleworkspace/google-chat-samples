# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from productivity_bot.models import User, ActiveLoops, UserResponses

# Register your models here.
admin.site.register(User)
admin.site.register(ActiveLoops)
admin.site.register(UserResponses)