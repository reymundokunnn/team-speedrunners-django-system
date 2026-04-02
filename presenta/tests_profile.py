# Import the webdriver module from selenium to control the browser
from selenium import webdriver

# Import By to specify how to locate elements (by ID, class, tag, etc.)
from selenium.webdriver.common.by import By

# Import Service to manage the ChromeDriver process
from selenium.webdriver.chrome.service import Service

# Import LiveServerTestCase to spin up a live Django server during tests
from django.test import LiveServerTestCase

# Import ChromeDriverManager to automatically download and manage ChromeDriver
from webdriver_manager.chrome import ChromeDriverManager


class ProfilePageTest(LiveServerTestCase):
    """Test cases for the profile page."""

    def setUp(self):
        """Set up the Selenium WebDriver with Brave browser."""
        options = webdriver.ChromeOptions()
        options.binary_location = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        self.browser = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )

    def tearDown(self):
        """Clean up the WebDriver session after each test."""
        self.browser.quit()

    def test_profile_page_loads(self):
        """Test that the profile page loads without errors."""
        self.browser.get(f"{self.live_server_url}/profile/")
        self.browser.implicitly_wait(10)
        # Verify the page loads by checking the title
        self.assertIn("Presenta", self.browser.title)

    def test_profile_page_has_dashboard_section(self):
        """Test that the profile page contains the dashboard section."""
        self.browser.get(f"{self.live_server_url}/profile/")
        self.browser.implicitly_wait(10)
        # Check if dashboard section exists
        dashboard_section = self.browser.find_element(By.CLASS_NAME, "dashboard-section")
        self.assertIsNotNone(dashboard_section)

    def test_profile_page_has_profile_container(self):
        """Test that the profile page contains the profile container."""
        self.browser.get(f"{self.live_server_url}/profile/")
        self.browser.implicitly_wait(10)
        # Check if profile container exists
        profile_container = self.browser.find_element(By.CLASS_NAME, "profile-container")
        self.assertIsNotNone(profile_container)
