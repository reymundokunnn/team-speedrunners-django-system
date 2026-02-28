from django import forms
from django.contrib.auth.models import User as DjangoUser
from .models import User as PresentaUser


class EditProfileForm(forms.ModelForm):
    """Form for editing user profile."""
    
    class Meta:
        model = PresentaUser
        fields = ('first_name', 'last_name', 'email', 'gender', 'phone_number', 'date_of_birth', 'company', 'location', 'bio')
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
    theme_preference = forms.ChoiceField(
        label='Theme',
        choices=[('light', 'Light Mode'), ('dark', 'Dark Mode'), ('auto', 'Auto')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    timezone = forms.CharField(
        label='Timezone',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., UTC, America/New_York'}),
        required=False
    )
    language = forms.CharField(
        label='Language',
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., en, es, fr'}),
        initial='en',
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
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    # Privacy settings
    profile_visibility = forms.ChoiceField(
        label='Profile Visibility',
        choices=[('public', 'Public'), ('private', 'Private')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    show_online_status = forms.BooleanField(
        label='Show Online Status',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )


class DesignerSettingsForm(forms.Form):
    """Form for designer-specific settings."""
    
    designer_availability = forms.ChoiceField(
        label='Availability Status',
        choices=[('available', 'Available'), ('unavailable', 'Currently Unavailable')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    designer_rate = forms.DecimalField(
        label='Hourly Rate ($)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
        required=False,
        decimal_places=2
    )
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
    accept_project_requests = forms.BooleanField(
        label='Accept New Project Requests',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False
    )


class AdminSettingsForm(forms.Form):
    """Form for admin-specific settings."""
    
    maintenance_mode = forms.BooleanField(
        label='Maintenance Mode',
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        required=False,
        help_text='Enable to restrict user access for maintenance'
    )
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