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

from os import environ
from googleapiclient.discovery import build
from google.oauth2 import service_account
from productivity_bot.nlp_helper import NLPHelper

class APIHelper:

    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ]

    def __init__(self, keyfile_name):
        credentials = service_account.Credentials.from_service_account_file(keyfile_name)
        self.credentials = credentials.with_scopes(scopes=APIHelper.scopes)
        self.sheets_service = build('sheets', 'v4', credentials=self.credentials)
        self.drive_service = build('drive', 'v3', credentials=self.credentials)

    def get_or_create_sheet(self, user):
        """Return or create-and-return info for the user's sheet

        Args:
            user (User object): The User whose sheet we're looking for

        Returns:
            tuple: (str:spreadsheet_id, str:sheet_title, str:sheet_id, bool:sheet existed)
        """
        spreadsheet_id = user.spreadsheet_id
        if spreadsheet_id:
            # create new sheet
            response = self.sheets_service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={
                    'requests': [{
                        'addSheet': {'properties': {}}
                    }]
                }
            ).execute()
            return response['replies'][0]['addSheet']['properties'], True

        # Create new spreadsheet
        response = self.sheets_service.spreadsheets().create(body={}).execute()
        user.spreadsheet_id = response['spreadsheetId']
        user.save()
        return response['sheets'][0]['properties'], False

    def share_drive_file(self, file_id, email):
        """Share the specified file with the specified email

        Args:
            file_id (str): The id for the file to be shared
            email (str): Email address to be shared with
        """
        # Make sure the file exists
        # pending b/36767248
        get_files = self.drive_service.files().get(
            fileId=file_id,
        )
        # Wait for the file to exist
        while get_files.execute().get('error'):
            continue

        # Share the file
        self.drive_service.permissions().create(
            fileId=file_id,
            body={
                'type': 'user',
                'role': 'writer',
                'emailAddress': email

            },
        ).execute()

    def copy_sql_table_to_sheet(self, table, query_parameters, spreadsheet_id,
                                sheet_title):
        """Copy elements from a sql table to a sheet

        Args:
            Table (Django models object): The Table to query (see here:
                https://docs.djangoproject.com/en/2.0/topics/db/models/)
            query_parameters ({str: str}): SQL query parameters to specify which
                rows to copy
            spreadsheet_id (str): The id for the spreadsheet we'll copy to
            sheet_title (str): Title of the specific sheet we'll copy to
        """
        data = self.get_sql_contents(table, query_parameters)

        if environ.get('ENABLE_NLP'): # OPTIONAL: will add columns with more data
            self.add_nlp_columns(data)

        self.write_to_sheet(data, spreadsheet_id, sheet_title)

    def write_to_sheet(self, data, spreadsheet_id, sheet_title):
        """Write contents of a 2-dimensional list to a sheet

        Args:
            data (list): The 2-dimensional list to be copied
            spreadsheet_id (str): The id for the spreadsheet we'll copy to
            sheet_title (str): Title of the specific sheet we'll copy to
        """
        self.sheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=sheet_title,
            valueInputOption='RAW',
            body={
                'values': data
            }
        ).execute()

    @staticmethod
    def get_sql_contents(table, query_parameters):
        """Loads model data in to a 2D array

        Args:
            table (Django models object): The table to query
            query_parameters (dict): Parameters to specify which rows to copy
        """
        sql_rows = table.objects.filter(**query_parameters)
        sql_fields = table._meta.get_fields()

        # Set first row of headers to names of SQL Columns
        table = [[field.name for field in sql_fields]]

        # Fill in body of table with information from SQL Table
        table.extend([[str(getattr(obj, field.name)) for field in sql_fields] for obj in sql_rows])
        return table

    @staticmethod
    def add_nlp_columns(data):
        """Add columns to the table list with natural-language info

        Args:
            data (list): The 2-dimensional list of conversation data


        Example input structure before method call:
            [
                ['id', 'active_loop', 'raw_text'],
                ['29', 'ActiveLoops object', 'Work with Joe on Bot']
            ]
        Example input structure after method call (this method modifies the original structure)
            [
                ['id', 'active_loop', 'raw_text', 'action(s)', 'other persons', 'external parties'],
                ['29', 'ActiveLoops object', 'Work with Joe on Bot', 'work', 'joe', 'bot']
            ]

        Raises:
            IndexError: The input list is empty
        """
        # Add new headers
        data[0].extend(['action(s)', 'other persons', 'external parties'])

        nlp = NLPHelper()

        # Loop over all input elements
        for row in data[1:]: # table[0] is the header row, so we can skip it
            raw_text = row[2]
            entities = nlp.analyze_text(raw_text, 'entities')
            tokens = nlp.analyze_text(raw_text, 'syntax')

            # Extract all verbs from tokens list
            verbs = APIHelper.filter_nlp_results(
                tokens,
                nlp.POS_TAG,
                lambda token: token.part_of_speech.tag,
                lambda token: token.text.content,
                lambda tag: tag == 'VERB',
            )
            # Extract all persons from entities list
            people = APIHelper.filter_nlp_results(
                entities,
                nlp.ENTITY_TYPE,
                lambda token: token.type,
                lambda token: token.name,
                lambda tag: tag == 'PERSON',
            )
            # Extract all non-persons from entities list
            other_parties = APIHelper.filter_nlp_results(
                entities,
                nlp.ENTITY_TYPE,
                lambda token: token.type,
                lambda token: token.name,
                lambda tag: tag != 'PERSON',
            )

            row.extend([verbs, people, other_parties])

    @staticmethod
    def filter_nlp_results(tokens, enum_tuple, get_tag, get_content,
                           filter_function):
        """Filters a list of tokens by specified parameters.
        See Args for more info

        Args:
            tokens (list): a list of token objects returned by NLP API
            enum_tuple (tuple): enumeration dictionary. Either ENTITY_TYPE
                or POS_TAG from productivity_bot.nlp_helper
            get_tag (function): a function that gets the syntax tag or entity
                type from a token object
            get_content (function): a function that gets the raw text that was
                input by the user from the token object
            filter_function (function): a function that returns True if the
                token has the correct syntax tag or entity type and False
                otherwise

        Returns:
            string: a comma separated list of all words that meet the criteria
                set by the caller
        """
        filtered_tokens = [token for token in tokens
                           if filter_function(enum_tuple[get_tag(token)])]

        return ','.join(set([get_content(token) for token in filtered_tokens]))
