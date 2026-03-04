from django import forms
from django.contrib.auth.models import User as DjangoUser
from .models import User as PresentaUser
import pytz

# Get timezone choices
TIMEZONE_CHOICES = [(tz, tz) for tz in pytz.common_timezones]


class EditProfileForm(forms.ModelForm):
    """Form for editing user profile."""
    
    class Meta:
        model = PresentaUser
        fields = ('first_name', 'last_name', 'email', 'gender', 'phone_number', 'date_of_birth', 'company', 'location', 'bio', 'pronouns')
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone Number'}),
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'company': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Company'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Location'}),
            'bio': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Bio', 'rows': 4}),
            'pronouns': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., he/him, she/her, they/them'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['gender'].choices = [('', '-- Select Gender --')] + PresentaUser.GENDER_CHOICES
        # Make all fields optional for editing
        for field in self.fields:
            self.fields[field].required = False


class RegistrationForm(forms.ModelForm):
    """Form for user registration with custom User model."""
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm Password'})
    )

    class Meta:
        model = PresentaUser
        fields = ('username', 'email', 'first_name', 'last_name', 'user_role', 'gender', 'phone_number', 'date_of_birth', 'company', 'location')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
            'user_role': forms.Select(attrs={'class': 'form-control'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone Number'}),
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'company': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Company'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Location'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make gender optional
        self.fields['gender'].required = False
        self.fields['gender'].choices = [('', '-- Select Gender --')] + PresentaUser.GENDER_CHOICES

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if PresentaUser.objects.filter(username=username).exists():
            raise forms.ValidationError('This username is already taken.')
        if DjangoUser.objects.filter(username=username).exists():
            raise forms.ValidationError('This username is already taken.')
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if PresentaUser.objects.filter(email=email).exists():
            raise forms.ValidationError('This email address is already registered.')
        if DjangoUser.objects.filter(email=email).exists():
            raise forms.ValidationError('This email address is already registered.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        
        if password1 and password2:
            if password1 != password2:
                raise forms.ValidationError('Passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        # Don't call super().save() since we have custom logic
        cleaned_data = self.cleaned_data
        password = cleaned_data.get('password1')
        
        if commit:
            # Create custom Presenta User with all the data
            user = PresentaUser(
                username=cleaned_data.get('username'),
                email=cleaned_data.get('email'),
                first_name=cleaned_data.get('first_name') or '',
                last_name=cleaned_data.get('last_name') or '',
                user_role=cleaned_data.get('user_role'),
                gender=cleaned_data.get('gender') or '',
                phone_number=cleaned_data.get('phone_number') or '',
                date_of_birth=cleaned_data.get('date_of_birth'),
                company=cleaned_data.get('company') or '',
                location=cleaned_data.get('location') or '',
            )
            user.set_password(password)
            user.save()
            
            # Also create Django User for authentication
            django_user, created = DjangoUser.objects.get_or_create(
                username=user.username,
                defaults={
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            )
            django_user.set_password(password)
            django_user.save()
            
            # Link them together
            user.auth_user = django_user
            user.save()
            
            # Create profile linking both
            from .models import Profile
            profile, _ = Profile.objects.get_or_create(user=django_user)
            profile.presenta_user = user
            profile.save()
            
            # Return the Django user for login purposes
            return django_user
        
        return None

class UserSettingsForm(forms.Form):
    """Form for general user settings (account & notifications)."""
    
    # Account settings
    current_password = forms.CharField(
        label='Current Password (required to change)',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Current Password'}),
        required=False
    )
    new_password = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'New Password'}),
        required=False
    )
    confirm_password = forms.CharField(
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm Password'}),
        required=False
    )
    
    # Display settings
    timezone = forms.ChoiceField(
        label='Timezone',
        choices=TIMEZONE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    language = forms.CharField(
        label='Language',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., en, es, fr'}),
        initial='en',
        required=False
    )
    currency_preference = forms.ChoiceField(
        label='Currency Preference',
        choices=[
            ('USD', 'US Dollar ($)'),
            ('EUR', 'Euro (€)'),
            ('GBP', 'British Pound (£)'),
            ('PHP', 'Philippine Peso (₱)'),
            ('JPY', 'Japanese Yen (¥)'),
            ('AUD', 'Australian Dollar (A$)'),
            ('CAD', 'Canadian Dollar (C$)'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    
    # Notification settings
    email_notifications_enabled = forms.BooleanField(
        label='Enable Email Notifications',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    order_updates_email = forms.BooleanField(
        label='Order/Project Updates via Email',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    marketing_emails = forms.BooleanField(
        label='Promotional & Marketing Emails',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    notification_frequency = forms.ChoiceField(
        label='Notification Frequency',
        choices=[
            ('immediate', 'Immediate'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('never', 'Never'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    
    # Privacy settings
    profile_visibility = forms.ChoiceField(
        label='Profile Visibility',
        choices=[('public', 'Public'), ('private', 'Private')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        required=False
    )
    show_user_status = forms.BooleanField(
        label='Show Your User Status',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )


class ProfileSettingsForm(forms.Form):
    """Form for profile settings (social media, availability, etc.)."""
    
    # Social media links
    linkedin_url = forms.URLField(
        label='LinkedIn Profile',
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://linkedin.com/in/yourprofile'}),
        required=False
    )
    twitter_url = forms.URLField(
        label='Twitter Profile',
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://twitter.com/yourprofile'}),
        required=False
    )
    instagram_url = forms.URLField(
        label='Instagram Profile',
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://instagram.com/yourprofile'}),
        required=False
    )
    portfolio_url_profile = forms.URLField(
        label='Portfolio Website',
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://yourportfolio.com'}),
        required=False
    )
    
    # Availability
    availability_hours = forms.ChoiceField(
        label='Availability Hours',
        choices=[
            ('hours_9_5', '9 AM - 5 PM'),
            ('hours_8_6', '8 AM - 6 PM'),
            ('hours_10_8', '10 AM - 8 PM'),
            ('flexible', 'Flexible Hours'),
            ('custom', 'Custom Hours'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    custom_hours = forms.CharField(
        label='Custom Hours (if selected above)',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Mon-Fri 2PM-10PM'}),
        required=False
    )
    
    # Contact preference
    preferred_contact_method = forms.ChoiceField(
        label='Preferred Contact Method',
        choices=[
            ('email', 'Email'),
            ('phone', 'Phone'),
            ('inapp', 'In-App Messaging'),
        ],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        required=False
    )
    
    # Emergency contact
    emergency_contact_name = forms.CharField(
        label='Emergency Contact Name',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Full Name'}),
        required=False
    )
    emergency_contact_phone = forms.CharField(
        label='Emergency Contact Phone',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+1 (555) 000-0000'}),
        required=False
    )


class DesignerSettingsForm(forms.Form):
    """Form for designer-specific settings."""
    
    # Work availability and hours
    designer_availability = forms.ChoiceField(
        label='Availability Status',
        choices=[('available', 'Available'), ('unavailable', 'Currently Unavailable')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    availability_hours = forms.ChoiceField(
        label='Work Hours',
        choices=[
            ('hours_9_5', '9 AM - 5 PM'),
            ('hours_8_6', '8 AM - 6 PM'),
            ('hours_10_8', '10 AM - 8 PM'),
            ('flexible', 'Flexible Hours'),
            ('custom', 'Custom Hours'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    custom_hours = forms.CharField(
        label='Custom Work Hours',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Mon-Fri 2PM-10PM'}),
        required=False
    )
    timezone = forms.ChoiceField(
        label='Time Zone',
        choices=TIMEZONE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    
    # Rate & Pricing
    designer_rate = forms.DecimalField(
        label='Hourly Rate ($)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
        required=False,
        decimal_places=2
    )
    turnaround_time_days = forms.IntegerField(
        label='Typical Turnaround Time (days)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '5', 'min': '1'}),
        required=False
    )
    extra_revision_price = forms.DecimalField(
        label='Price Per Extra Revision ($)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
        required=False,
        decimal_places=2
    )
    rush_job_multiplier = forms.DecimalField(
        label='Rush Job Price Multiplier (e.g., 1.25 = 25% extra)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '1.25', 'step': '0.05', 'min': '1'}),
        required=False,
        decimal_places=2
    )
    minimum_project_budget = forms.DecimalField(
        label='Minimum Project Budget ($)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
        required=False,
        decimal_places=2
    )
    
    # Specializations & Skills
    designer_specializations = forms.CharField(
        label='Specializations/Skills',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Enter comma-separated specializations (e.g., Presentations, Infographics, Posters)',
            'rows': 3
        }),
        required=False,
        help_text='Comma-separated list of your areas of expertise'
    )
    industry_expertise = forms.CharField(
        label='Industry Expertise',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Tech, Fashion, Real Estate, Healthcare, etc.',
            'rows': 2
        }),
        required=False,
        help_text='Industries you specialize in'
    )
    software_tools = forms.CharField(
        label='Software & Tools Proficiency',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Figma, Adobe Suite, Canva, etc.',
            'rows': 2
        }),
        required=False,
        help_text='Design software you are proficient in'
    )
    
    # Project Requests
    accept_project_requests = forms.BooleanField(
        label='Accept New Project Requests',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    max_concurrent_projects = forms.IntegerField(
        label='Max Concurrent Projects',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '5', 'min': '1'}),
        required=False,
        help_text='Maximum number of projects you can work on simultaneously'
    )
    revision_limit = forms.IntegerField(
        label='Revision Limit Per Project',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '3', 'min': '1'}),
        required=False,
        help_text='Maximum number of revisions you include per project'
    )
    
    # Portfolio & Professional Info
    portfolio_url = forms.URLField(
        label='Portfolio URL',
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://example.com/portfolio'}),
        required=False,
        help_text='Link to your portfolio or website'
    )
    portfolio_public = forms.BooleanField(
        label='Show Portfolio to Non-Logged-In Users',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    show_testimonials = forms.BooleanField(
        label='Display Client Testimonials on Profile',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    
    # Project Preferences
    communication_preference = forms.ChoiceField(
        label='Preferred Project Communication Method',
        choices=[
            ('email', 'Email'),
            ('phone', 'Phone'),
            ('inapp', 'In-App Messaging'),
        ],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        required=False
    )
    
    # Payment & Payout
    payout_method = forms.CharField(
        label='Payout Method (e.g., Bank Transfer, PayPal)',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Bank Transfer'}),
        required=False
    )
    payout_frequency = forms.ChoiceField(
        label='Payout Frequency',
        choices=[
            ('weekly', 'Weekly'),
            ('biweekly', 'Bi-weekly'),
            ('monthly', 'Monthly'),
        ],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        required=False
    )



class AdminSettingsForm(forms.Form):
    """Form for admin-specific settings."""
    
    # User Management
    user_approval_required = forms.BooleanField(
        label='Require Admin Approval for New Signups',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    maintenance_mode = forms.BooleanField(
        label='Maintenance Mode (Restricts User Access)',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False,
        help_text='Enable to restrict user access for maintenance'
    )
    
    # Commission & Fees
    platform_commission_percent = forms.DecimalField(
        label='Platform Commission Percentage (%)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '10.00', 'step': '0.01', 'min': '0'}),
        required=False,
        decimal_places=2
    )
    
    # Site Information & Customization
    site_name = forms.CharField(
        label='Site Name',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Presenta'}),
        required=False
    )
    site_description = forms.CharField(
        label='Site Description',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        required=False
    )
    support_email = forms.EmailField(
        label='Support Email',
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'support@example.com'}),
        required=False
    )
    
    # Email Templates
    email_template_welcome = forms.CharField(
        label='Welcome Email Template (HTML)',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        required=False,
        help_text='Custom HTML for welcome email'
    )
    email_template_notification = forms.CharField(
        label='Notification Email Template (HTML)',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        required=False,
        help_text='Custom HTML for notification email'
    )
    
    # Announcements & Notifications
    announcement_banner = forms.CharField(
        label='Site-Wide Announcement Banner',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Enter announcement text'}),
        required=False
    )
    announcement_banner_visible = forms.BooleanField(
        label='Show Announcement Banner',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    announcement_banner_type = forms.ChoiceField(
        label='Banner Type',
        choices=[
            ('info', 'Info (Blue)'),
            ('warning', 'Warning (Orange)'),
            ('success', 'Success (Green)'),
            ('error', 'Error (Red)'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    announcement_banner_bg_color = forms.CharField(
        label='Custom Background Color',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '#3498db (leave empty for default)'}),
        required=False,
        help_text='Enter hex color code (e.g., #FF5733). Leave empty to use default type color.'
    )
    announcement_banner_text_color = forms.CharField(
        label='Custom Text Color',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '#FFFFFF (leave empty for default)'}),
        required=False,
        help_text='Enter hex color code (e.g., #FFFFFF). Leave empty to use default white text.'
    )
    
    # Content Moderation
    moderation_keywords = forms.CharField(
        label='Content Moderation Keywords',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Comma-separated keywords to flag',
            'rows': 3
        }),
        required=False,
        help_text='Auto-flag content containing these keywords'
    )
    
    # Backup & Maintenance
    backup_schedule = forms.ChoiceField(
        label='Automatic Backup Schedule',
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        required=False
    )
    
    # Rate Limiting
    api_rate_limit = forms.IntegerField(
        label='API Rate Limit (requests per hour)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '100', 'min': '10'}),
        required=False
    )
    form_submission_limit = forms.IntegerField(
        label='Form Submission Limit (per hour)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '50', 'min': '10'}),
        required=False
    )
    
    # Analytics Access
    grant_analytics_to_roles = forms.CharField(
        label='Grant Analytics Dashboard Access to Roles',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'designer, admin',
            'rows': 2
        }),
        required=False,
        help_text='Comma-separated list of roles with access'
    )
    
    # Dispute Resolution
    dispute_resolution_days = forms.IntegerField(
        label='Dispute Resolution Window (days)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '30', 'min': '7'}),
        required=False
    )
    auto_refund_enabled = forms.BooleanField(
        label='Enable Auto-Refunds for Disputes',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )
    
    # Seasonal Settings
    seasonal_active = forms.BooleanField(
        label='Activate Seasonal Settings',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False,
        help_text='Enable seasonal pricing or fee multipliers'
    )
    seasonal_name = forms.CharField(
        label='Seasonal Period Name',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Holiday Season'}),
        required=False
    )
    seasonal_start_date = forms.DateField(
        label='Seasonal Period Start Date',
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        required=False
    )
    seasonal_end_date = forms.DateField(
        label='Seasonal Period End Date',
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        required=False
    )
    seasonal_fee_multiplier = forms.DecimalField(
        label='Seasonal Fee Multiplier (e.g., 1.2 = 20% increase)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '1.2', 'step': '0.05', 'min': '1'}),
        required=False,
        decimal_places=2
    )


class ChangePasswordForm(forms.Form):
    """Form for changing password with validation."""
    
    current_password = forms.CharField(
        label='Current Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Current Password'})
    )
    new_password = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'New Password'}),
        help_text='Must be at least 8 characters'
    )
    confirm_password = forms.CharField(
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm Password'})
    )
    
    def clean_new_password(self):
        password = self.cleaned_data.get('new_password')
        if password and len(password) < 8:
            raise forms.ValidationError('Password must be at least 8 characters long.')
        return password
    
    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if new_password and confirm_password and new_password != confirm_password:
            raise forms.ValidationError('Passwords do not match.')
        
        return cleaned_data