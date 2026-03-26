# This code is a test case for a Django application using Selenium 
# to perform end-to-end testing of the home page.
from selenium import webdriver
from selenium.webdriver.common.by import By
from django.test import LiveServerTestCase 

# The HomePageTest class inherits from LiveServerTestCase, 
# which allows us to run tests that require a live server.
            
class HomePageTest(LiveServerTestCase):
    # The setUp method is called before each test method to set up any necessary resources.
    def setUp(self):
        # Initialize the Selenium WebDriver. In this case, we are using Firefox.
        self.browser = webdriver.Firefox()
    
    # The tearDown method is called after each test method to clean up resources. 
    # In this case, it closes the browser.
    def tearDown(self):
        # Quit the browser after each test to free up resources.
        self.browser.quit()
    
    # This is a test method that checks if the home page title is correct. 
    # It navigates to the home page, finds the heading element by its ID, 
    # and asserts that the text of the heading is 'Welcome to My Site!'.
    def test_home_page_title(self):
        # Navigate to the home page of the live server
        self.browser.get(self.live_server_url)

        # Find the heading element by its ID and check its text
        heading = self.browser.find_element(By.ID, 'main-heading')
        self.assertEqual(heading.text, 'Welcome to My Site!')
        self.browser.implicitly_wait(10)  # Wait for 10 seconds to allow the page to load

