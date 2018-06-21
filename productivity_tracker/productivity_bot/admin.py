# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from productivity_bot.models import User, ActiveLoops, UserResponses

# Registers Django models.
# https://docs.djangoproject.com/en/2.0/topics/db/models/
admin.site.register(User)
admin.site.register(ActiveLoops)
admin.site.register(UserResponses)