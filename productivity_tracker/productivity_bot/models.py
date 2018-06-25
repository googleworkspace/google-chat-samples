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

from django.db import models

class User(models.Model):

    # A field to identify the user's chat space (must be DM)
    # (this will be used to match a user to their chat space)
    space_name = models.CharField(max_length=100)

    # A field to identify a user in their chat
    # (this will be used to match a user to their sheet_id)
    user_name = models.CharField(max_length=100)

    # A field to store whether or not a sheet has been created
    sheet_created = models.BooleanField(blank=True, default=False)

    # a field to identify and retrieve info about the user's sheet
    sheet_id = models.CharField(max_length=100, blank=True, default="")


#
# To be used as a job/batch queue
#
class ActiveLoops(models.Model):

    # a field to match each loop to a user
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="active_loop"
    )

    # a field to store the frequency of messages (in minutes)
    # i.e. the number of minutes between each bot message
    mssg_freq = models.IntegerField()

    # a field to store the amount of time until the next message
    # 
    # This field will start at -mssg_freq and every minute,
    # when the cron job fires, we will increase this number
    # by one. 
    # To determine who to message, we will filter this table
    # by all instances whose mins_to_mssg are 0.
    # After messaging those instances, we will reset these values.
    mins_to_mssg = models.IntegerField()

#
# To be used as a job/batch queue
#
class UserResponses(models.Model):

    # a field to match each loop to a user
    active_loop = models.ForeignKey(
        ActiveLoops,
        on_delete=models.CASCADE,
        related_name="user_responses"
    )

    # a field to store the raw user response
    raw_text = models.CharField(max_length=300)

