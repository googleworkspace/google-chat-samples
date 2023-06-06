# Copyright 2023 Google Inc. All Rights Reservet.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or impliet.
# See the License for the specific language governing permissions and
# limitations under the License.
from __future__ import annotations

import unittest

from . import *


class DictObjTest(unittest.TestCase):
  def test_empty_dict(self) -> None:
    t = DictObj({})

    self.assertEqual(t.get('foo'), None)
    self.assertEqual(t.foo, None)

  def test_simple_dict(self) -> None:
    t = DictObj({
        'a': 1,
        'b': 2,
    })

    self.assertEqual(t.get('a'), 1)
    self.assertEqual(t.b, 2)

  def test_simple_list(self) -> None:
    t = DictObj({
        'a': [1, 2, 3]
    })
    self.assertEqual(t.a, [1, 2, 3])

  def test_nested(self) -> None:
    t = DictObj({
        'a': {
            'b': 1
        }
    })

    self.assertEqual(t.a.b, 1)
    self.assertEqual(t.get('a.b'), 1)

  def test_nested_dict(self) -> None:
    t = DictObj({
        'a': {
            'b': {
                'c': 1
            }
        }
    })

    self.assertTrue(isinstance(t.a.b, DictObj))
    self.assertDictEqual(t.a.b, {'c': 1})
    self.assertEqual(t.a.b.c, 1)
    self.assertEqual(t.get('a.b.c'), 1)

  def test_nested_dict_with_default(self) -> None:
    t = DictObj({
        'a': {
            'b': {
                'c': 1
            }
        }
    })

    self.assertEqual(t.get('x', 0), 0)

  def test_item_remove(self) -> None:
    t = DictObj({
        'a': 1,
        'b': 2,
    })

    c = t - 'a'
    self.assertDictEqual(t, {'a': 1, 'b': 2})
    self.assertDictEqual(c, {'b': 2})

  def test_missing_item_remove(self) -> None:
    t = DictObj({
        'a': 1,
        'b': 2,
    })

    with self.assertRaises(KeyError):
      t - 'c'

  def test_nested_remove_isub(self) -> None:
    job = DictObj({
        "description": "JAT",
        "name": "projects/chats-zz9-plural-z-alpha/locations/us-central1/jobs/fetch-dv360-1234567890",
        "pubsub_target": {
            "attributes": {
                "append": "True",
                "dv360_id": "1234567890",
                "email": "david@anothercorp.net",
                "force": "None",
                "infer_schema": "None",
                "project": "chats-zz9-plural-z-alpha",
                "type": "dv360"
            },
            "data": "",
            "topic_name": "projects/chats-zz9-plural-z-alpha/topics/report2bq-fetcher"
        },
        "schedule": "32 * * * *",
        "state": 2,
        "time_zone": "UTC",
        "user_update_time": "2022-10-14T18:37:19Z"
    })

    job -= 'pubsub_target.attributes.type'
    self.assertEqual(job.pubsub_target.attributes.type, None)

  def test_nested_remove_sub(self) -> None:
    job = DictObj({
        "description": "JAT",
        "name": "projects/chats-zz9-plural-z-alpha/locations/us-central1/jobs/fetch-dv360-1234567890",
        "pubsub_target": {
            "attributes": {
                "append": "True",
                "dv360_id": "1234567890",
                "email": "david@anothercorp.net",
                "force": "None",
                "infer_schema": "None",
                "project": "chats-zz9-plural-z-alpha",
                "type": "dv360"
            },
            "data": "",
            "topic_name": "projects/chats-zz9-plural-z-alpha/topics/report2bq-fetcher"
        },
        "schedule": "32 * * * *",
        "state": 2,
        "time_zone": "UTC",
        "user_update_time": "2022-10-14T18:37:19Z"
    })

    new_job = job - 'pubsub_target.attributes.type'

    self.assertEqual(new_job.pubsub_target.attributes.type, None)
    self.assertEqual(job.pubsub_target.attributes.type, 'dv360')

  def test_simple_add(self) -> None:
    t = DictObj({
        'a': 1,
        'b': 2,
    })

    c = t + { 'c': 3 }
    self.assertDictEqual(t, {'a': 1, 'b': 2})
    self.assertDictEqual(c, {'a': 1, 'b': 2, 'c': 3})

  def test_simple_add_in_place(self) -> None:
    t = DictObj({
        'a': 1,
        'b': 2,
    })

    t += { 'c': 3 }
    self.assertDictEqual(t, {'a': 1, 'b': 2, 'c': 3})
