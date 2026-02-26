from django.test import TestCase
from django.urls import reverse

# Create your tests here.
class WebServerTest(TestCase):
    def test_home_page(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

class SigninFormTest(TestCase):
    def test_signup_page(self):
        response = self.client.get(reverse('signin'))
        self.assertEqual(response.status_code, 200)

    def test_signup_form_submission(self):
        response = self.client.post(reverse('signin'), {
            'username': 'testuser',
            'email': 'testemail@example.com',
            'password': 'testpassword123',
        })
        self.assertEqual(response.status_code, 302)