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
    
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='design_requests')
    designer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_designs')
    title = models.CharField(max_length=200)
    design_type = models.CharField(max_length=20, choices=DESIGN_TYPE_CHOICES, default='presentation')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
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
