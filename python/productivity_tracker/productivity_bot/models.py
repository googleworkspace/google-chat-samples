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
    '''Stores persistant information about all users

    Fields:
        space_name (charfield): identifies a user's chat space
        user_name (charfield): identifies a user in their chat space
        user_email (charfield): stores the User's email address
        spreadsheet_id (charfield): identifies the user's sheet
    '''
    space_name = models.CharField(max_length=100)
    user_id = models.CharField(max_length=100, unique=True)
    email = models.CharField(max_length=100)
    spreadsheet_id = models.CharField(max_length=100, blank=True, default="")

    def __str__(self):
        return str(self.email)

class ActiveLoops(models.Model):
    ''' To store all of the users that are currently in a working session

    Fields:
        user (OnToOne): identifies each loop's matching user
    '''
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="active_loop"
    )

    def __str__(self):
        return f"Activity loop for {self.user}"

    class Meta:
        verbose_name = "Activity Loop"



class UserResponses(models.Model):
    ''' To store user responses during active loops

    Fields:
        active_loop (foreignkey): identifies each response's matching loop
        raw_text (charfield): Stores the raw user response
    '''
    active_loop = models.ForeignKey(
        ActiveLoops,
        on_delete=models.CASCADE,
        related_name="user_responses"
    )
    raw_text = models.CharField(max_length=300)

    def __str__(self):
        return f"User response in {self.active_loop}"

    class Meta:
        verbose_name = "User Response"