from django.test import TestCase

# TODO(ahez): Fill in these test cases

class HandleInboundMessageTestCase(TestCase):
    def setUp(self):
        pass

    def test_start_basic(self):
        pass

    def test_stop_basic(self):
        pass

    def test_log_work_basic(self):
        pass

    def test_start_incorrect_syntax(self):
        pass

    def test_stop_incorrect_syntax(self):
        pass

    def test_stop_while_not_in_active_loop(self):
        pass

    def test_log_work_while_not_in_active_loop(self):
        pass


class StartActiveLoopTestCase(TestCase):
    def setUp(self):
        pass

    def test_start_active_loop_basic(self):
        pass

    def test_start_loop_with_existing_active_loop(self):
        pass


class EndActiveLoopTestCase(TestCase):
    def setUp(self):
        pass

    def test_basic_end_active_loop(self):
        pass

    def test_end_loop_while_not_in_active_loop(self):
        pass


class InActiveLoopTestCase(TestCase):
    def setUp(self):
        pass

    def test_while_in_active_loop(self):
        pass

    def test_while_not_in_active_loop(self):
        pass


class LogUserResponseTestCase(TestCase):
    def setUp(self):
        pass

    def test_log_user_response_basic(self):
        pass

