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

from google.cloud import language


class NLPHelper:
    ENTITY_TYPE = ('UNKNOWN', 'PERSON', 'LOCATION', 'ORGANIZATION',
                   'EVENT', 'WORK_OF_ART', 'CONSUMER_GOOD', 'OTHER')
    POS_TAG = ('UNKNOWN', 'ADJ', 'ADP', 'ADV', 'CONJ', 'DET', 'NOUN', 'NUM',
               'PRON', 'PRT', 'PUNCT', 'VERB', 'X', 'AFFIX')

    def __init__(self):
        self.client = language.LanguageServiceClient()

    def analyze_text(self, text, analysis_type):
        """Analyzes text using GCP's NLP API

            Args:
                text (str): text to be analyzed
                analysis_type(str): determines which api method will be called

            Returns:
                if analysis_type == 'entities'
                    entities (list): a list of entity objects as returned by
                        NLP API (see here:
                        https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity)
                if analysis_type == 'syntax'
                    tokens (list): a list of syntax token objects as returned by NLP API
                        (see here:
                        https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity)
        """
        document = {"content": text, "type_": language.Document.Type.PLAIN_TEXT}

        if analysis_type == "entities":
            return self.client.analyze_entities(
                document=document, encoding_type=language.EncodingType.UTF8
            ).entities
        return self.client.analyze_syntax(
            document=document, encoding_type=language.EncodingType.UTF8
        ).tokens
