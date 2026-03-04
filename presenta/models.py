from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password


class User(models.Model):
    """Primary user model for Presenta. All user data should be stored here."""
    USER_ROLE_CHOICES = [
        ('user', 'Client'),
        ('designer', 'Designer'),
        ('admin', 'Administrator'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say'),
    ]
    
    ONLINE_STATUS_CHOICES = [
        ('online', 'Online'),
        ('idle', 'Idle'),
        ('do_not_disturb', 'Do Not Disturb'),
    ]
    
    # Auth link
    auth_user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='presenta_user', null=True, blank=True)
    
    # Basic info
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    
    # Profile info
    user_role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES, default='user')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    pronouns = models.CharField(max_length=50, blank=True, null=True, help_text='e.g., he/him, she/her, they/them')
    
    # Status
    online_status = models.CharField(max_length=20, choices=ONLINE_STATUS_CHOICES, default='online')
    
    # Verification
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    # Timestamps
    joined_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-joined_date']

    def __str__(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return name or self.email

    def get_user_role_display(self):
        return dict(self.USER_ROLE_CHOICES).get(self.user_role, 'User')
    
    def set_password(self, raw_password):
        """Hash and set the password."""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash."""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)


class Profile(models.Model):
    # kept for backward compatibility sa nakaraang model na gawa ko. pwede na siguro tanggalin eventually.
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    presenta_user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='django_profile')
    account_type = models.CharField(max_length=50, blank=True, null=True)
    presenta_id = models.IntegerField(blank=True, null=True, help_text='Optional id of the original presenta.User')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return getattr(self.user, 'username', 'profile')
    
    @property
    def user_role(self):
        return self.presenta_user.user_role if self.presenta_user else 'user'
    
    @property
    def get_user_role_display(self):
        return self.presenta_user.get_user_role_display() if self.presenta_user else 'User'


class DesignRequest(models.Model):    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('for_payment', 'For Payment'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    DESIGN_TYPE_CHOICES = [
        ('presentation', 'Presentation'),
        ('infographic', 'Infographic'),
        ('poster', 'Poster'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('PHP', 'Philippine Peso (₱)'),
        ('JPY', 'Japanese Yen (¥)'),
        ('AUD', 'Australian Dollar (A$)'),
        ('CAD', 'Canadian Dollar (C$)'),
    ]
    
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='design_requests')
    designer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_designs')
    title = models.CharField(max_length=200)
    design_type = models.CharField(max_length=20, choices=DESIGN_TYPE_CHOICES, default='presentation')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='USD', blank=True)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    def get_finished_files(self):
        """Get all finished files for this design request."""
        return self.files.filter(file_type='finished')
    
    def get_reference_files(self):
        """Get all reference files for this design request."""
        return self.files.filter(file_type='reference')


class DesignRequestFile(models.Model):
    """Model for reference files attached to design requests."""
    
    FILE_TYPE_CHOICES = [
        ('reference', 'Reference File'),
        ('finished', 'Finished Design'),
    ]
    
    design_request = models.ForeignKey(DesignRequest, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='design_requests/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='reference')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']
    
    def __str__(self):
        return f"{self.design_request.title} - {self.file.name}"


class Activity(models.Model):
    """Model for tracking user activities across the platform."""
    
    ACTIVITY_TYPE_CHOICES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('request_submitted', 'Request Submitted'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Designer Assigned'),
        ('completed', 'Completed'),
        ('payment_received', 'Payment Received'),
        ('payment_confirmed', 'Payment Confirmed'),
        ('revision_requested', 'Revision Requested'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('request_rejected', 'Request Rejected'),
        ('request_cancelled', 'Request Cancelled'),
        ('file_uploaded', 'File Uploaded'),
        ('profile_updated', 'Profile Updated'),
        ('password_changed', 'Password Changed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES)
    message = models.TextField()
    related_request = models.ForeignKey(DesignRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='targeted_activities')
    is_cleared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class UserSettings(models.Model):
    """Model for storing user-specific settings and preferences."""
    
    THEME_CHOICES = [
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
        ('auto', 'Auto'),
    ]
    
    NOTIFICATION_FREQUENCY_CHOICES = [
        ('immediate', 'Immediate'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
        ('never', 'Never'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('PHP', 'Philippine Peso (₱)'),
        ('JPY', 'Japanese Yen (¥)'),
        ('AUD', 'Australian Dollar (A$)'),
        ('CAD', 'Canadian Dollar (C$)'),
    ]
    
    CONTACT_METHOD_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('inapp', 'In-App Messaging'),
    ]
    
    HOURS_CHOICES = [
        ('hours_9_5', '9 AM - 5 PM'),
        ('hours_8_6', '8 AM - 6 PM'),
        ('hours_10_8', '10 AM - 8 PM'),
        ('flexible', 'Flexible Hours'),
        ('custom', 'Custom Hours'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_settings')
    
    # Display & Theme Settings
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default='auto')
    timezone = models.CharField(max_length=50, default='UTC', blank=True)
    language = models.CharField(max_length=10, default='en', blank=True)
    
    # Notification Settings
    email_notifications_enabled = models.BooleanField(default=True)
    order_updates_email = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)
    notification_frequency = models.CharField(max_length=20, choices=NOTIFICATION_FREQUENCY_CHOICES, default='immediate')
    
    # Privacy Settings
    profile_visibility = models.CharField(max_length=20, choices=[('public', 'Public'), ('private', 'Private')], default='public')
    show_user_status = models.BooleanField(default=True)
    
    # Profile-related settings (all roles)
    social_media_links = models.JSONField(default=dict, blank=True, help_text='Social media URLs: {"linkedin": "", "twitter": "", "instagram": "", "portfolio": ""}')
    availability_hours = models.CharField(max_length=20, choices=HOURS_CHOICES, default='flexible', blank=True)
    custom_hours = models.CharField(max_length=100, blank=True, help_text='Custom availability hours, e.g., "Mon-Fri 2PM-10PM"')
    preferred_contact_method = models.CharField(max_length=20, choices=CONTACT_METHOD_CHOICES, default='email', blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    
    # User/Client-specific settings
    currency_preference = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='USD', blank=True)
    preferred_design_types = models.TextField(blank=True, help_text='Comma-separated preferred design types')
    
    # Designer-specific settings
    designer_availability = models.CharField(max_length=20, choices=[('available', 'Available'), ('unavailable', 'Unavailable')], default='available')
    designer_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    designer_specializations = models.TextField(blank=True, help_text='Comma-separated list of specializations')
    accept_project_requests = models.BooleanField(default=True)
    portfolio_url = models.URLField(blank=True, null=True)
    max_concurrent_projects = models.IntegerField(default=5, blank=True)
    revision_limit = models.IntegerField(default=3, blank=True, help_text='Maximum revisions per project')
    minimum_project_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    turnaround_time_days = models.IntegerField(default=5, blank=True, help_text='Typical project turnaround time in days')
    industry_expertise = models.TextField(blank=True, help_text='Comma-separated industries: Tech, Fashion, Real Estate, etc.')
    software_tools = models.TextField(blank=True, help_text='Design software proficiency: Figma, Adobe Suite, etc.')
    extra_revision_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Price per extra revision')
    rush_job_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.25, help_text='Multiplier for rush jobs (e.g., 1.25 = 25% extra)')
    communication_preference = models.CharField(max_length=20, choices=CONTACT_METHOD_CHOICES, default='email', blank=True)
    portfolio_public = models.BooleanField(default=True, help_text='Show portfolio to non-logged-in users')
    auto_accept_criteria = models.JSONField(default=dict, blank=True, help_text='Auto-accept projects matching criteria')
    show_testimonials = models.BooleanField(default=True, help_text='Display client testimonials on profile')
    payout_method = models.CharField(max_length=50, blank=True, help_text='Preferred payout method: bank transfer, PayPal, etc.')
    payout_frequency = models.CharField(max_length=20, choices=[('weekly', 'Weekly'), ('biweekly', 'Bi-weekly'), ('monthly', 'Monthly')], default='monthly', blank=True)
    
    # Admin settings
    maintenance_mode = models.BooleanField(default=False)
    user_approval_required = models.BooleanField(default=False, help_text='Require admin approval for new user signups')
    platform_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text='Platform commission percentage')
    email_template_welcome = models.TextField(blank=True, help_text='Custom HTML for welcome email')
    email_template_notification = models.TextField(blank=True, help_text='Custom HTML for notification email')
    announcement_banner = models.TextField(blank=True, help_text='Site-wide announcement banner message')
    announcement_banner_visible = models.BooleanField(default=False)
    announcement_banner_type = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Info (Blue)'),
            ('warning', 'Warning (Orange)'),
            ('success', 'Success (Green)'),
            ('error', 'Error (Red)'),
        ],
        default='info',
        help_text='Type of announcement banner'
    )
    announcement_banner_bg_color = models.CharField(
        max_length=20,
        default='',
        blank=True,
        help_text='Custom background color (e.g., #FF5733). Leave empty for default type color.'
    )
    announcement_banner_text_color = models.CharField(
        max_length=20,
        default='',
        blank=True,
        help_text='Custom text color (e.g., #FFFFFF). Leave empty for default white text.'
    )
    moderation_keywords = models.TextField(blank=True, help_text='Comma-separated keywords for content flagging')
    backup_schedule = models.CharField(max_length=20, choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='daily', blank=True)
    api_rate_limit = models.IntegerField(default=100, help_text='API requests per hour limit')
    form_submission_limit = models.IntegerField(default=50, help_text='Form submissions per hour limit')
    grant_analytics_to_roles = models.TextField(blank=True, help_text='Comma-separated roles with analytics access: designer, admin')
    dispute_resolution_days = models.IntegerField(default=30, help_text='Days allowed for dispute resolution')
    auto_refund_enabled = models.BooleanField(default=True)
    seasonal_active = models.BooleanField(default=False, help_text='Enable seasonal settings')
    seasonal_name = models.CharField(max_length=100, blank=True, help_text='e.g., Holiday Season, New Year')
    seasonal_start_date = models.DateField(null=True, blank=True)
    seasonal_end_date = models.DateField(null=True, blank=True)
    seasonal_fee_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.0, help_text='Fee multiplier during peak season')
    
    # Two-factor authentication
    two_fa_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings for {self.user.username}"
    
    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'