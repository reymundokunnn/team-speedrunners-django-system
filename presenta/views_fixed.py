from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User as DjangoUser
from django.views.decorators.csrf import ensure_csrf_cookie
from .forms import RegistrationForm, EditProfileForm
from .models import Profile, DesignRequest, User, DesignRequestFile, Activity, UserSettings
from PIL import Image
from io import BytesIO
import base64


def log_activity(user, activity_type, message, related_request=None, target_user=None):
    """Helper function to create activity logs."""
    Activity.objects.create(
        user=user,
        activity_type=activity_type,
        message=message,
        related_request=related_request,
        target_user=target_user
    )


def index(request):
    """Redirect authenticated users to their dashboard, otherwise show homepage."""
    if request.user.is_authenticated:
        # Get user profile and redirect based on role
        try:
            profile = request.user.profile
            # Block pending admins
            try:
                presenta_user = profile.presenta_user
                if profile.user_role == 'admin' and presenta_user.admin_approval_status != 'approved':
                    logout(request)
                    return render(request, 'signin.html', {
                        'login_error': 'Your admin account is pending superuser approval. Please contact the site administrator.',
                    })
            except AttributeError:
                pass
            if request.user.is_superuser or profile.user_role == 'admin':
                return redirect('admin_dashboard')
            elif profile.user_role == 'designer':
                return redirect('designer_dashboard')
            else:
                return redirect('user_dashboard')
        except Profile.DoesNotExist:
            # If no profile exists, show homepage
            pass
    return render(request, 'index.html')

def services(request):
    return render(request, 'services.html')

def logout_view(request):
    """Log out the user and redirect to index immediately (accepts GET)."""
    # Log logout activity before logging out
    if request.user.is_authenticated:
        log_activity(
            user=request.user,
            activity_type='logout',
            message="User logged out."
        )
    logout(request)
    return redirect('index')

def contact(request):
    return render(request, 'contact.html')

def pricing(request):
    return render(request, 'pricing.html')

def samples(request):
    return render(request, 'samples.html')


@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def login_view(request):
    """Custom login view with role-based redirection."""
    # If user is already authenticated, redirect to their dashboard
    if request.user.is_authenticated:
        try:
            profile = request.user.profile
            if request.user.is_superuser or profile.user_role == 'admin':
                return redirect('admin_dashboard')
            elif profile.user_role == 'designer':
                return redirect('designer_dashboard')
            else:
                return redirect('user_dashboard')
        except Profile.DoesNotExist:
            pass
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me') == 'on'
        
        # Try to authenticate the user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user, backend='presenta.auth_backend.PresentaBackend')
            
            # Log login activity
            log_activity(
                user=user,
                activity_type='login',
                message="User logged in."
            )
            
            # Block pending admins (defense in depth, though backend should block)
            try:
                profile = user.profile
                presenta_user = profile.presenta_user
                if profile.user_role == 'admin' and presenta_user.admin_approval_status != 'approved':
                    logout(request)
                    return render(request, 'signin.html', {
                        'login_error': 'Your admin account is pending superuser approval. Please contact the site administrator.',
                        'username': username
                    })
            except (Profile.DoesNotExist, AttributeError):
                pass
            
            # Handle "Remember me" checkbox
            if remember_me:
                # Session will last for SESSION_COOKIE_AGE (2 weeks)
                request.session.set_expiry(1209600)  # 2 weeks
            else:
                # Session expires when browser closes
                request.session.set_expiry(0)
            
            # Always redirect to dashboard based on role, ignoring any 'next' parameter
            if user.is_superuser:
                return redirect('admin_dashboard')
            
            # Get user profile and redirect based on role
            try:
                profile = user.profile
                if profile.user_role == 'designer':
                    return redirect('designer_dashboard')
                elif profile.user_role == 'admin':
                    return redirect('admin_dashboard')
                else:
                    return redirect('user_dashboard')
            except Profile.DoesNotExist:
                # If no profile exists, redirect to home
                return redirect('index')
        else:
            # Check if pending admin
            from .models import User
            try:
                p_user = User.objects.filter(email=username).first() or User.objects.filter(username=username).first()
                if p_user and p_user.user_role == 'admin' and p_user.admin_approval_status == 'pending':
                    return render(request, 'signin.html', {
                        'login_error': 'Your admin account is pending superuser approval. Please contact the site administrator.',
                        'username': username
                    })
            except:
                pass
            
            # Generic auth failure
            return render(request, 'signin.html', {
                'login_error': 'Invalid username or password.',
                'username': username
            })
    
    return render(request, 'signin.html')


@require_http_methods(["GET", "POST"])
def register(request):
    """Handle user registration."""
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user.user_role == 'admin':
                user.auth_user.is_active = False
                user.auth_user.save()
            login(request, user, backend='presenta.auth_backend.PresentaBackend')
            # Redirect to appropriate dashboard based on user role
            profile = user.profile
            if profile.user_role == 'designer':
                return redirect('designer_dashboard')
            elif profile.user_role == 'admin':
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
    else:
        form = RegistrationForm()
    return render(request, 'signin.html', {'register_form': form})


@login_required(login_url='signin')
def user_dashboard(request):
    """Dashboard for Clients - view and request designs."""
    user = request.user
    
    # Check user role and redirect to correct dashboard if needed
    try:
        profile = user.profile
        if profile.user_role == 'designer':
            return redirect('designer_dashboard')
        elif profile.user_role == 'admin':
            return redirect('admin_dashboard')
    except Profile.DoesNotExist:
        pass
    
    # Get user's design requests with related files
    design_requests = DesignRequest.objects.filter(requester=user).prefetch_related('files').order_by('-created_at')
    
    # Get user's recent activities (not cleared)
    # Include: user's own activities + activities on their design requests from designers/admins
    from django.db.models import Q
    
    user_request_ids = DesignRequest.objects.filter(requester=user).values_list('id', flat=True)
    
    activities = Activity.objects.filter(
        Q(user=user) |  # User's own activities
        Q(related_request_id__in=user_request_ids),  # Activities on user's requests
        is_cleared=False
    ).select_related('related_request', 'user').order_by('-created_at')[:10]
    
    context = {
        'profile': user.profile,
        'design_requests': design_requests,
        'activities': activities,
        'pending_requests': design_requests.filter(status='pending').count(),
        'in_progress': design_requests.filter(status='in_progress').count(),
        'for_payment': design_requests.filter(status='for_payment').count(),
        'completed': design_requests.filter(status='completed').count(),
    }
    return render(request, 'dashboard/user_dashboard.html', context)


@login_required(login_url='signin')
def designer_dashboard(request):
    """Dashboard for designers - manage design requests."""
    user = request.user
    
    # Check user role and redirect to correct dashboard if needed
    try:
        profile = user.profile
        if profile.user_role == 'admin':
            return redirect('admin_dashboard')
        elif profile.user_role != 'designer':
            return redirect('user_dashboard')
    except Profile.DoesNotExist:
        return redirect('user_dashboard')
    
    # Get assigned designs with related files
    assigned_designs = DesignRequest.objects.filter(designer=user).prefetch_related('files').order_by('-created_at')
    
    # Get available requests (not yet assigned) with related files
    available_requests = DesignRequest.objects.filter(designer=None, status='pending').prefetch_related('files').order_by('-created_at')
    
    # Get designer's recent activities (not cleared)
    # Only show activities performed BY the designer (their own actions)
    # Designers should NOT see activities performed by clients on their requests
    activities = Activity.objects.filter(
        user=user,  # Only activities performed by the designer themselves
        is_cleared=False
    ).select_related('related_request', 'user').order_by('-created_at')[:10]
    
    context = {
        'profile': user.profile,
        'assigned_designs': assigned_designs,
        'available_requests': available_requests,
        'activities': activities,
        'total_assigned': assigned_designs.exclude(status='completed').count(),
        'in_progress': assigned_designs.filter(status='in_progress').count(),
        'for_payment': assigned_designs.filter(status='for_payment').count(),
        'completed': assigned_designs.filter(status='completed').count(),
        'pending': assigned_designs.filter(status='pending').count(),
    }
    return render(request, 'dashboard/designer_dashboard.html', context)


@login_required(login_url='signin')
def admin_dashboard(request):
    """Dashboard for administrators."""
    user = request.user
    
    # Check if user is superuser or has admin role
    is_admin = user.is_superuser
    profile = None
    
    if not is_admin:
        try:
            profile = user.profile
            is_admin = profile.user_role == 'admin'
        except Profile.DoesNotExist:
            pass
    
    # Check if approved admin before allowing access
    try:
        profile_obj = user.profile
        presenta_user = profile_obj.presenta_user
        if profile_obj.user_role == 'admin' and presenta_user.admin_approval_status != 'approved':
            return render(request, 'signin.html', {
                'login_error': 'Your admin account is pending superuser approval. Please contact the site administrator.',
            })
    except (Profile.DoesNotExist, AttributeError):
        pass
    
    # Redirect non-admin users to their correct dashboard
    if not is_admin:
        try:
            user_profile = user.profile
            if user_profile.user_role == 'designer':
                return redirect('designer_dashboard')
            else:
                return redirect('user_dashboard')
        except Profile.DoesNotExist:
            return redirect('user_dashboard')
    
    # get all design requests
    all_requests = DesignRequest.objects.all().order_by('-created_at')
    
    # get all users
    all_users = User.objects.all()
    
    # get pending admin approvals
    pending_admins = User.objects.filter(user_role='admin', admin_approval_status='pending')
    
    # Get admin's recent activities (not cleared) - admins see ALL platform activities
    activities = Activity.objects.filter(
        is_cleared=False
    ).select_related('related_request', 'user').order_by('-created_at')[:20]
    
    context = {
        'profile': profile,
        'all_requests': all_requests,
        'all_users': all_users,
        'activities': activities,
        'total_users': all_users.count(),
        'total_requests': all_requests.count(),
        'pending_requests': all_requests.filter(status='pending').count(),
        'in_progress': all_requests.filter(status='in_progress').count(),
        'completed': all_requests.filter(status='completed').count(),
    }
    return render(request, 'dashboard/admin_dashboard.html', context)


# ... rest of the views unchanged ...
