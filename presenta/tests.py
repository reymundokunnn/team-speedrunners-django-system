from selenium import webdriver
from selenium.webdriver.common.by import By
from django.test import LiveServerTestCase 

# The HomePageTest class inherits from LiveServerTestCase, 
# which allows us to run tests that require a live server.
            
class UserLoginTest(LiveServerTestCase):
    def setUp(self):
        # Set up the Selenium WebDriver
        self.browser = webdriver.Firefox()

    def tearDown(self):
        # Quit the browser after each test
        self.browser.quit()

    def test_user_can_login(self):
        self.browser.implicitly_wait(10)  # Wait for elements to load

        # Open the login page
        self.browser.get(self.live_server_url + '/signin/')
        
        # Find the username and password fields and enter credentials
        username_input = self.browser.find_element(By.ID, 'id_username')
        password_input = self.browser.find_element(By.ID, 'id_password')
        
        username_input.send_keys('kanon@example.com')
        password_input.send_keys('default')
        
        # Submit the login form
        login_button = self.browser.find_element(By.XPATH, '//button[@type="submit"]')
        login_button.click()

        self.assertIn('Good afternoon', self.browser.page_source)

