from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User as DjangoUser
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import models
from .forms import RegistrationForm, EditProfileForm
from .models import Profile, DesignRequest, User as PresentaUser, DesignRequestFile, Activity, UserSettings, SampleCategory, SampleItem, DesignerRating
from django.utils import timezone
import uuid
from PIL import Image
from io import BytesIO
import base64


def get_presenta_user_safe(django_user):
    # Safely get or create PresentaUser for a DjangoUser (handles superusers).
    from .models import Profile, User as PresentaUser
    
    # Check if already exists
    try:
        return django_user.presenta_user
    except PresentaUser.RelatedObjectDoesNotExist:
        pass
    
    # Create PresentaUser
    username = django_user.username or django_user.email
    presenta_user = PresentaUser.objects.create(
        auth_user=django_user,
        username=username,
        email=django_user.email or '',
        first_name=django_user.first_name or '',
        last_name=django_user.last_name or '',
        user_role='admin' if django_user.is_superuser else 'user',
        admin_approval_status='approved',
        online_status='online'
    )
    
    # Ensure Profile bridge exists
    profile, created = Profile.objects.get_or_create(user=django_user)
    profile.presenta_user = presenta_user
    profile.save()
    
    return presenta_user


def log_activity(user, activity_type, message, related_request=None, target_user=None):
    # Helper function to create activity logs.\"\"\"
    Activity.objects.create(
        user=user,
        activity_type=activity_type,
        message=message,
        related_request=related_request,
        target_user=target_user
    )


@login_required(login_url='signin')
def api_notifications(request):
    """API endpoint to fetch notifications dynamically."""
    try:
        from .models import Activity, User as PresentaUser
        
        # Get the presenta user object
        presenta_user = PresentaUser.objects.filter(
            email=getattr(request.user, 'email', '')
        ).first() or PresentaUser.objects.filter(
            username=getattr(request.user, 'username', '')
        ).first()
        
        if not presenta_user:
            return JsonResponse({'notifications': []})
        
        # Get user role
        user_role = getattr(presenta_user, 'user_role', 'user')
        
        # Use auth_user for Activity queries
        auth_user = getattr(presenta_user, 'auth_user', None)
        
        if not auth_user:
            return JsonResponse({'notifications': []})
        
        # Get recent activities (last 10)
        if user_role == 'designer':
            from django.db.models import Q
            activities = Activity.objects.filter(
                Q(user=auth_user, activity_type__in=['assigned', 'revision_requested']) |
                Q(activity_type='request_submitted'),
                is_cleared=False
            ).order_by('-created_at')[:10]
        else:
            activities = Activity.objects.filter(
                user=auth_user,
                activity_type__in=['designer_assigned', 'status_changed', 'completed', 'payment_received', 'payment_confirmed'],
                is_cleared=False
            ).order_by('-created_at')[:10]
        
        # Format notifications
        notifications = []
        for activity in activities:
            notification = {
                'id': activity.id,
                'message': activity.message,
                'type': activity.activity_type,
                'created_at': activity.created_at.isoformat(),
                'time_ago': _get_time_ago(activity.created_at),
            }
            notifications.append(notification)
        
        return JsonResponse({'notifications': notifications})
    except Exception as e:
        import sys
        print(f"API notifications error: {e}", file=sys.stderr)
        return JsonResponse({'notifications': []})


@login_required(login_url='signin')
def api_activities(request):
    """API endpoint to fetch recent activities dynamically."""
    try:
        from .models import Activity, DesignRequest, User as PresentaUser
        from django.db.models import Q
        
        user = request.user
        
        # Get user role
        presenta_user = PresentaUser.objects.filter(
            email=getattr(user, 'email', '')
        ).first() or PresentaUser.objects.filter(
            username=getattr(user, 'username', '')
        ).first()
        
        user_role = getattr(presenta_user, 'user_role', 'user') if presenta_user else 'user'
        
        # Get user's design request IDs
        user_request_ids = DesignRequest.objects.filter(requester=user).values_list('id', flat=True)
        
        # Get user's recent activities (not cleared)
        # Exclude 'designer_assigned' and 'assigned' since they show in notifications
        # For designers, also exclude payment-related activities (only show on user dashboard)
        if user_role == 'designer':
            activities = Activity.objects.filter(
                user=user,  # Only activities performed by the designer themselves
                is_cleared=False
            ).exclude(activity_type__in=['payment_received', 'payment_confirmed']).select_related('related_request', 'user').order_by('-created_at')[:10]
        else:
            activities = Activity.objects.filter(
                Q(user=user) |  # User's own activities
                Q(related_request_id__in=user_request_ids),  # Activities on user's requests
                is_cleared=False
            ).exclude(activity_type__in=['designer_assigned', 'assigned']).select_related('related_request', 'user').order_by('-created_at')[:10]
        
        # Format activities
        activities_list = []
        for activity in activities:
            activity_data = {
                'id': activity.id,
                'message': activity.message,
                'type': activity.activity_type,
                'created_at': activity.created_at.isoformat(),
                'time_ago': _get_time_ago(activity.created_at),
            }
            activities_list.append(activity_data)
        
        return JsonResponse({'activities': activities_list})
    except Exception as e:
        import sys
        print(f"API activities error: {e}", file=sys.stderr)
        return JsonResponse({'activities': []})


def _get_time_ago(timestamp):
    """Convert timestamp to human-readable time ago format."""
    from django.utils import timezone
    now = timezone.now()
    diff = now - timestamp
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


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
    """Samples page - displays portfolio samples organized by category"""
    from .models import SampleCategory, SampleItem
    
    # Get active categories with their active items
    categories = SampleCategory.objects.filter(
        is_active=True
    ).prefetch_related(
        models.Prefetch(
            'items',
            queryset=SampleItem.objects.filter(is_active=True),
            to_attr='active_items'
        )
    ).order_by('order', 'name')
    
    # Filter out categories with no active items
    categories_with_items = [cat for cat in categories if cat.active_items]
    
    return render(request, 'samples.html', {
        'categories': categories_with_items
    })


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
            from .models import User as PresentaUser
            try:
                p_user = PresentaUser.objects.filter(email=username).first() or PresentaUser.objects.filter(username=username).first()
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
            django_user = form.save()
            
            # Get the linked PresentaUser safely
            try:
                presenta_user = django_user.presenta_user
                if not presenta_user:
                    # Fallback lookup
                    presenta_user = PresentaUser.objects.filter(auth_user=django_user).first()
                user_role = presenta_user.user_role if presenta_user else 'user'
                print(f"[DEBUG] Registration: DjangoUser={django_user.username}, PresentaUser={presenta_user}, role={user_role}")
            except Exception as e:
                print(f"[DEBUG] Registration error: {e}")
                user_role = 'user'
            
            # Handle admin approval
            if user_role == 'admin':
                if presenta_user:
                    presenta_user.auth_user.is_active = False
                    presenta_user.auth_user.save()
            
            login(request, django_user, backend='presenta.auth_backend.PresentaBackend')
            
            # Redirect based on role
            if user_role == 'designer':
                return redirect('designer_dashboard')
            elif user_role == 'admin':
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
    # Exclude 'designer_assigned', 'assigned', 'completed', 'request_rejected' since they now show in notifications
    from django.db.models import Q
    
    user_request_ids = DesignRequest.objects.filter(requester=user).values_list('id', flat=True)
    
    activities = Activity.objects.filter(
        Q(user=user) |  # User's own activities
        Q(related_request_id__in=user_request_ids),  # Activities on user's requests
        is_cleared=False
    ).exclude(activity_type__in=['designer_assigned', 'assigned', 'completed', 'request_rejected']).select_related('related_request', 'user').order_by('-created_at')[:10]
    
    # Get user timezone, default to browser timezone or UTC
    user_tz = 'UTC'
    try:
        if hasattr(user, 'user_settings') and user.user_settings.timezone:
            user_tz = user.user_settings.timezone
        else:
            # Try to get from browser via JavaScript fallback
            user_tz = 'UTC'
    except Exception:
        user_tz = 'UTC'
    
    context = {
        'profile': user.profile,
        'design_requests': design_requests,
        'activities': activities,
        'pending_requests': design_requests.filter(status='pending').count(),
        'in_progress': design_requests.filter(status='in_progress').count(),
        'for_payment': design_requests.filter(status='for_payment').count(),
        'completed': design_requests.filter(status='completed').count(),
        'user_timezone': user_tz,
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
    # Exclude payment-related activities (only show on user dashboard)
    activities = Activity.objects.filter(
        user=user,  # Only activities performed by the designer themselves
        is_cleared=False
    ).exclude(activity_type__in=['payment_received', 'payment_confirmed']).select_related('related_request', 'user').order_by('-created_at')[:10]
    
    # Get user timezone
    user_tz = 'UTC'
    try:
        if hasattr(user, 'user_settings') and user.user_settings.timezone:
            user_tz = user.user_settings.timezone
    except Exception:
        user_tz = 'UTC'
    
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
        'user_timezone': user_tz,
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
    all_users = PresentaUser.objects.all()
    
# get pending admin approvals
    pending_admins = PresentaUser.objects.filter(user_role='admin', admin_approval_status='pending')
    
    # Get admin's recent activities (not cleared) - admins see ALL platform activities
    activities = Activity.objects.filter(
        is_cleared=False
    ).select_related('related_request', 'user').order_by('-created_at')[:20]
    
    # Get user timezone
    user_tz = 'UTC'
    try:
        if hasattr(user, 'user_settings') and user.user_settings.timezone:
            user_tz = user.user_settings.timezone
    except Exception:
        user_tz = 'UTC'
    
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
        'user_timezone': user_tz,
    }
    return render(request, 'dashboard/admin_dashboard.html', context)


@login_required(login_url='signin')
@require_http_methods(["POST"])
def request_design(request):
    # create a new design request (Clients)
    user = request.user
    
    title = request.POST.get('title')
    design_type = request.POST.get('design_type')
    description = request.POST.get('description')
    budget = request.POST.get('budget')
    currency = request.POST.get('currency', 'USD')
    deadline = request.POST.get('deadline')
    
    if title and design_type and description:
        design_request = DesignRequest.objects.create(
            requester=user,
            title=title,
            design_type=design_type,
            description=description,
            budget=budget if budget else None,
            currency=currency,
            deadline=deadline if deadline else None,
        )
        
        # handle file uploads
        files = request.FILES.getlist('reference_files')
        file_count = 0
        for file in files:
            DesignRequestFile.objects.create(
                design_request=design_request,
                file=file,
                file_type='reference'
            )
            file_count += 1
        
        # Log file upload activity if files were uploaded
        if file_count > 0:
            log_activity(
                user=user,
                activity_type='file_uploaded',
                message=f"Uploaded {file_count} reference file{'s' if file_count > 1 else ''} for '{title}'.",
                related_request=design_request
            )
        
        # Log activity for user
        design_type_display = dict(DesignRequest.DESIGN_TYPE_CHOICES).get(design_type, design_type)
        log_activity(
            user=user,
            activity_type='request_submitted',
            message=f"{design_type_display} '{title}' submitted.",
            related_request=design_request
        )
        
        return redirect('user_dashboard')
    
    return redirect('user_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def accept_design_request(request, request_id):
    # tinanggap ng designer yung request
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    if user.profile.user_role == 'designer':
        design_request.designer = user
        design_request.status = 'in_progress'
        design_request.save()
        
        # Log activity for designer
        log_activity(
            user=user,
            activity_type='assigned',
            message=f"You accepted the design request '{design_request.title}'.",
            related_request=design_request
        )
        
        # Log activity for requester (notify them that a designer has been assigned)
        if design_request.requester:
            designer_name = f"{user.first_name} {user.last_name}".strip() or user.username
            log_activity(
                user=design_request.requester,
                activity_type='designer_assigned',
                message=f"Designer <b>{designer_name}</b> accepted your design request '{design_request.title}'.",
                related_request=design_request
            )
    
    return redirect('designer_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def complete_design_request(request, request_id):
    # minarkahan ni designer yung design as completed
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    if user == design_request.designer or user.profile.user_role == 'admin':
        from django.utils import timezone
        design_request.status = 'completed'
        design_request.completed_at = timezone.now()
        design_request.save()
        
        # Log activity for designer
        if user == design_request.designer:
            log_activity(
                user=user,
                activity_type='completed',
                message=f"'{design_request.title}' marked as Completed.",
                related_request=design_request
            )
        
        # Log activity for requester
        if design_request.requester:
            log_activity(
                user=design_request.requester,
                activity_type='completed',
                message=f"'{design_request.title}' marked as Completed.",
                related_request=design_request
            )
    
    return redirect('designer_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def reject_design_request(request, request_id):
    # tinanggihan ng designer yung request (wtf?)
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    if user.profile.user_role == 'designer' or user.profile.user_role == 'admin':
        design_request.status = 'rejected'
        design_request.designer = None
        design_request.save()
        
        # Log activity for requester
        if design_request.requester:
            log_activity(
                user=design_request.requester,
                activity_type='request_rejected',
                message=f"'{design_request.title}' was rejected.",
                related_request=design_request
            )
    
    return redirect('designer_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def cancel_design_request(request, request_id):
    # designer cancelled an assigned project
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    if user == design_request.designer or user.profile.user_role == 'admin':
        design_request.status = 'cancelled'
        design_request.designer = None
        design_request.save()
        
        # Log activity for requester
        if design_request.requester:
            log_activity(
                user=design_request.requester,
                activity_type='request_cancelled',
                message=f"'{design_request.title}' was cancelled.",
                related_request=design_request
            )
    
    return redirect('designer_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def update_design_status(request, request_id):
    # update design request status and upload finished files
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # tingnan kung pag-aari ng designer yung request or admin
    if design_request.designer != user and not user.is_superuser:
        return redirect('designer_dashboard')
    
    status = request.POST.get('status')
    old_status = design_request.status
    
    if status in ['pending', 'in_progress', 'for_payment', 'completed']:
        design_request.status = status
        
        if status == 'completed':
            from django.utils import timezone
            design_request.completed_at = timezone.now()
        
        design_request.save()
        
        # Handle finished file uploads
        files = request.FILES.getlist('finished_file')
        file_count = 0
        for file in files:
            DesignRequestFile.objects.create(
                design_request=design_request,
                file=file,
                file_type='finished'
            )
            file_count += 1
        
        # Log file upload activity if files were uploaded
        if file_count > 0:
            log_activity(
                user=user,
                activity_type='file_uploaded',
                message=f"Uploaded {file_count} finished file{'s' if file_count > 1 else ''} for '{design_request.title}'.",
                related_request=design_request
            )
        
        # Log activity if status changed
        if status != old_status:
            status_display = dict(DesignRequest.STATUS_CHOICES).get(status, status)
            
            # Log for designer
            log_activity(
                user=user,
                activity_type='status_changed',
                message=f"'{design_request.title}' moved to {status_display}.",
                related_request=design_request
            )
            
            # Log for requester
            if design_request.requester:
                log_activity(
                    user=design_request.requester,
                    activity_type='status_changed',
                    message=f"'{design_request.title}' is now {status_display.lower()}.",
                    related_request=design_request
                )
    
    return redirect('designer_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def request_revision(request, request_id):
    """Client requests a revision for a completed design request."""
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # Only the requester can request a revision
    if design_request.requester != user:
        from django.http import JsonResponse
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    # Only allow revision for completed requests
    if design_request.status != 'completed':
        from django.http import JsonResponse
        return JsonResponse({'error': 'Revision can only be requested for completed designs'}, status=400)
    
    # Get revision notes from request
    revision_notes = request.POST.get('revision_notes', '').strip()
    
    # Update status back to in_progress and save revision notes
    design_request.status = 'in_progress'
    design_request.completed_at = None
    design_request.revision_notes = revision_notes
    design_request.save()
    
    # Log activity for the requester
    log_activity(
        user=user,
        activity_type='revision_requested',
        message=f"Revision requested for '{design_request.title}'.",
        related_request=design_request
    )
    
    # Log activity for the designer if assigned
    if design_request.designer:
        log_activity(
            user=design_request.designer,
            activity_type='revision_requested',
            message=f"Revision requested for '{design_request.title}' by client.",
            related_request=design_request
        )
    
    from django.http import JsonResponse
    return JsonResponse({
        'success': True,
        'message': 'Revision requested successfully. The designer will be notified.'
    })


@login_required(login_url='signin')
@require_http_methods(["POST"])
def delete_design_request(request, request_id):
    # delete a design request (only for the requester or admin)
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # only allow deletion by the requester or admin
    if design_request.requester == user or user.is_superuser or user.profile.user_role == 'admin':
        design_request.delete()
    
    return redirect('user_dashboard')


@login_required(login_url='signin')
@require_http_methods(["GET", "POST"])
def edit_design_request(request, request_id):
    # edit a design request (only for the requester or admin).
    user = request.user
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # only allow editing by the requester or admin
    if design_request.requester != user and not user.is_superuser and user.profile.user_role != 'admin':
        return redirect('user_dashboard')
    
    if request.method == 'POST':
        title = request.POST.get('title')
        design_type = request.POST.get('design_type')
        description = request.POST.get('description')
        budget = request.POST.get('budget')
        currency = request.POST.get('currency', 'USD')
        deadline = request.POST.get('deadline')
        
        if title and design_type and description:
            design_request.title = title
            design_request.design_type = design_type
            design_request.description = description
            design_request.budget = budget if budget else None
            design_request.currency = currency
            design_request.deadline = deadline if deadline else None
            design_request.save()
            
            # Handle new file uploads
            files = request.FILES.getlist('reference_files')
            for file in files:
                DesignRequestFile.objects.create(
                    design_request=design_request,
                    file=file
                )
        
        return redirect('user_dashboard')
    
    # for GET request, render edit form
    return redirect('user_dashboard')


@login_required(login_url='signin')
@login_required
def edit_profile(request):
    """Redirect to unified settings page for profile editing."""
    return redirect('unified_settings')


@login_required
def get_completion_details(request, request_id):
    # API endpoint to get completion details for a design request.
    from django.http import JsonResponse
    
    design_request = get_object_or_404(DesignRequest, id=request_id, requester=request.user)
    finished_files = design_request.get_finished_files()
    
    files_data = []
    for f in finished_files:
        files_data.append({
            'id': f.id,
            'filename': f.file.name.split('/')[-1],
            'url': f.file.url,
            'uploaded_at': f.uploaded_at.strftime('%Y-%m-%d %H:%M')
        })
    
    # Get designer info
    designer_data = None
    if design_request.designer:
        designer = design_request.designer
        # Get the custom User model (presenta_user) which has profile_picture
        presenta_user = getattr(designer, 'presenta_user', None)
        designer_data = {
            'name': f"{designer.first_name} {designer.last_name}".strip() or designer.username,
            'profile_picture': presenta_user.profile_picture.url if presenta_user and presenta_user.profile_picture else None,
            'initials': (designer.first_name[0] if designer.first_name else '') + (designer.last_name[0] if designer.last_name else '') or designer.username[0].upper(),
            'username': designer.username
        }
    
    return JsonResponse({
        'title': design_request.title,
        'completed_at': design_request.completed_at.strftime('%Y-%m-%d %H:%M') if design_request.completed_at else '',
        'files': files_data,
        'designer': designer_data
    })


@login_required
def save_designer_rating(request, request_id):
    # API endpoint to save a designer rating.
    from django.http import JsonResponse
    import json
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    design_request = get_object_or_404(DesignRequest, id=request_id, requester=request.user)
    
    if not design_request.designer:
        return JsonResponse({'error': 'No designer assigned to this request'}, status=400)
    
    try:
        data = json.loads(request.body)
        rating_value = data.get('rating')
        
        if rating_value is None:
            return JsonResponse({'error': 'Rating is required'}, status=400)
        
        rating_value = int(rating_value)
        if rating_value < 1 or rating_value > 5:
            return JsonResponse({'error': 'Rating must be between 1 and 5'}, status=400)
        
        # Create or update the rating
        rating, created = DesignerRating.objects.update_or_create(
            designer=design_request.designer,
            rater=request.user,
            design_request=design_request,
            defaults={'rating': rating_value}
        )
        
        # Get updated average rating
        avg_rating = DesignerRating.get_average_rating(design_request.designer)
        rating_count = DesignerRating.get_rating_count(design_request.designer)
        
        return JsonResponse({
            'success': True,
            'rating': rating.rating,
            'created': created,
            'average_rating': round(avg_rating, 1),
            'rating_count': rating_count
        })
    except (ValueError, KeyError) as e:
        return JsonResponse({'error': 'Invalid data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_designer_rating(request, request_id):
    # API endpoint to get the user's rating for a design request.
    from django.http import JsonResponse
    
    design_request = get_object_or_404(DesignRequest, id=request_id, requester=request.user)
    
    if not design_request.designer:
        return JsonResponse({'error': 'No designer assigned to this request'}, status=400)
    
    # Get user's rating for this request
    try:
        user_rating = DesignerRating.objects.get(
            designer=design_request.designer,
            rater=request.user,
            design_request=design_request
        )
        user_rating_value = user_rating.rating
    except DesignerRating.DoesNotExist:
        user_rating_value = None
    
    # Get average rating
    avg_rating = DesignerRating.get_average_rating(design_request.designer)
    rating_count = DesignerRating.get_rating_count(design_request.designer)
    
    return JsonResponse({
        'user_rating': user_rating_value,
        'average_rating': round(avg_rating, 1),
        'rating_count': rating_count
    })


@login_required
def get_reference_files(request, request_id):
    # API endpoint to get reference files for a design request (for designers).
    from django.http import JsonResponse
    
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # verify the designer has access to this request
    # allow access if:
    # 1. designer is assigned to the request
    # 2. user is superuser
    # 3. request is available (designer is None) and user is a designer
    has_access = (
        design_request.designer == request.user or 
        request.user.is_superuser or
        (design_request.designer is None and request.user.profile.user_role == 'designer')
    )
    
    if not has_access:
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    reference_files = design_request.get_reference_files()
    
    files_data = []
    for f in reference_files:
        files_data.append({
            'id': f.id,
            'filename': f.file.name.split('/')[-1],
            'url': f.file.url,
            'uploaded_at': f.uploaded_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return JsonResponse({
        'title': design_request.title,
        'description': design_request.description,
        'files': files_data
    })


@login_required
def get_finished_files(request, request_id):
    # API endpoint to get finished files for a design request.
    from django.http import JsonResponse
    
    design_request = get_object_or_404(DesignRequest, id=request_id)
    
    # verify access - designer who owns it, requester, or admin
    has_access = (
        design_request.designer == request.user or 
        design_request.requester == request.user or
        request.user.is_superuser or
        request.user.profile.user_role == 'admin'
    )
    
    if not has_access:
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    finished_files = design_request.get_finished_files()
    
    files_data = []
    for f in finished_files:
        files_data.append({
            'id': f.id,
            'filename': f.file.name.split('/')[-1],
            'url': f.file.url,
            'uploaded_at': f.uploaded_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return JsonResponse({
        'title': design_request.title,
        'files': files_data
    })


# Helper function for admin checks
def is_admin_user(request):
    """Check if the current user is an admin."""
    is_admin = request.user.is_superuser
    if not is_admin:
        try:
            is_admin = request.user.profile.user_role == 'admin'
        except (Profile.DoesNotExist, AttributeError):
            pass
    return is_admin


# Admin User Management Views
@login_required(login_url='signin')
def create_user(request):
    """Create a new user by admin."""
    from django.http import JsonResponse
    from .models import User
    
    if not is_admin_user(request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Access denied'}, status=403)
        return redirect('admin_dashboard')
    
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        user_role = request.POST.get('user_role', 'user')
        gender = request.POST.get('gender') or None
        phone_number = request.POST.get('phone_number') or None
        company = request.POST.get('company') or None
        location = request.POST.get('location') or None
        
        # Validation
        if not username or not email or not password:
            return JsonResponse({'error': 'Username, email, and password are required'}, status=400)
        
        if not first_name or not last_name:
            return JsonResponse({'error': 'First name and last name are required'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Create the user
        # Auto-approve if superuser is creating the account, otherwise keep pending for admins
        is_superuser_creating = request.user.is_superuser
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            user_role=user_role,
            admin_approval_status='pending' if user_role == 'admin' and not is_superuser_creating else 'approved',
            gender=gender,
            phone_number=phone_number,
            company=company,
            location=location,
        )
        user.set_password(password)
        user.save()
        
        # Also create Django User for authentication
        django_user = DjangoUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=False if user_role == 'admin' and not is_superuser_creating else True
        )
        
        # Link them together
        user.auth_user = django_user
        user.save()
        
        # Create profile linking both
        profile, _ = Profile.objects.get_or_create(user=django_user)
        profile.presenta_user = user
        profile.save()
        
        # Log user creation activity
        log_activity(
            user=request.user,
            activity_type='user_created',
            message=f"Created new user: {first_name} {last_name} ({username}) with role {user_role}.",
            target_user=django_user
        )
        
        # Return user data for dynamic table update
        return JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_role': user.user_role,
                'user_role_display': user.get_user_role_display(),
                'phone_number': user.phone_number or '',
                'company': user.company or '',
                'location': user.location or '',
                'joined_date': user.created_at.strftime('%b %d, %Y') if hasattr(user, 'created_at') and user.created_at else '',
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'admin_approval_status': user.admin_approval_status,
                'is_superuser': user.auth_user.is_superuser if user.auth_user else False,
            }
        })
    
    # Return empty data for GET request (modal will show empty form)
    return JsonResponse({})


@login_required(login_url='signin')
def view_user(request, user_id):
    """API endpoint to get user details as JSON."""
    from django.http import JsonResponse
    from .models import User
    
    if not is_admin_user(request):
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    # Get the user
    user = get_object_or_404(User, id=user_id)
    
    # Get design request count for this user
    design_requests_count = 0
    if user.auth_user:
        design_requests_count = DesignRequest.objects.filter(requester=user.auth_user).count()
    
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_role': user.user_role,
        'user_role_display': user.get_user_role_display(),
        'gender': user.gender or '',
        'phone_number': user.phone_number or '',
        'date_of_birth': user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else '',
        'company': user.company or '',
        'location': user.location or '',
        'bio': user.bio or '',
        'joined_date': user.created_at.strftime('%Y-%m-%d') if hasattr(user, 'created_at') and user.created_at else '',
        'design_requests_count': design_requests_count,
        'profile_picture': user.profile_picture.url if user.profile_picture else None,
    })


@login_required(login_url='signin')
@require_http_methods(["GET", "POST"])
def edit_user(request, user_id):
    """Edit user by admin."""
    from django.http import JsonResponse
    from .models import User
    
    if not is_admin_user(request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Access denied'}, status=403)
        return redirect('admin_dashboard')
    
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        # Handle AJAX POST request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Update user fields
            user.first_name = request.POST.get('first_name', user.first_name or '')
            user.last_name = request.POST.get('last_name', user.last_name or '')
            user.email = request.POST.get('email', user.email or '')
            user.user_role = request.POST.get('user_role', user.user_role or 'user')
            user.gender = request.POST.get('gender') or None
            user.phone_number = request.POST.get('phone_number') or None
            user.company = request.POST.get('company') or None
            user.location = request.POST.get('location') or None
            user.bio = request.POST.get('bio') or None
            
            date_of_birth = request.POST.get('date_of_birth')
            if date_of_birth:
                from datetime import datetime
                try:
                    user.date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            user.save()
            
            # Also update Django auth user if linked
            if user.auth_user:
                user.auth_user.first_name = user.first_name
                user.auth_user.last_name = user.last_name
                user.auth_user.email = user.email
                user.auth_user.save()
            
            # Log user update activity
            log_activity(
                user=request.user,
                activity_type='user_updated',
                message=f"Updated user: {user.first_name} {user.last_name} ({user.username}).",
                target_user=user.auth_user
            )
            
            return JsonResponse({'success': True, 'message': 'User updated successfully'})
        
        # Regular POST - redirect back to dashboard
        return redirect('admin_dashboard')
    
    # GET request - return user data as JSON for modal
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'user_role': user.user_role,
            'gender': user.gender or '',
            'phone_number': user.phone_number or '',
            'date_of_birth': user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else '',
            'company': user.company or '',
            'location': user.location or '',
            'bio': user.bio or '',
        })
    
    # Regular GET - just redirect to dashboard
    return redirect('admin_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def delete_user(request, user_id):
    """Delete user by admin."""
    from django.http import JsonResponse
    from .models import User, Profile
    
    if not is_admin_user(request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
        return redirect('admin_dashboard')
    
    user = get_object_or_404(User, id=user_id)
    
# Prevent admin from deleting themselves - universal check (username/email primary)
    current_presenta = None
    try:
        current_presenta = get_presenta_user_safe(request.user)
    except:
        pass
    
    is_self = (user.id == current_presenta.id if current_presenta else False) or \
              (user.username == current_presenta.username if current_presenta else False) or \
              (user.email.lower() == current_presenta.email.lower() if current_presenta else False) or \
              (user.auth_user == request.user if user.auth_user else False)
    
    if is_self:
        error_msg = "You cannot delete yourself. That would leave the system supervised by nobody, which sounds like a terrible reality show."
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': error_msg})
        return redirect('admin_dashboard')
    
    # Store username for success message
    username = user.username
    target_user = user.auth_user
    
    # Log user deletion activity before deleting
    log_activity(
        user=request.user,
        activity_type='user_deleted',
        message=f"Deleted user: {user.first_name} {user.last_name} ({username}).",
        target_user=target_user
    )
    
    # Delete the linked Django user if exists
    if user.auth_user:
        # Also delete the profile if exists
        try:
            profile = user.auth_user.profile
            profile.delete()
        except (Profile.DoesNotExist, AttributeError):
            pass
        user.auth_user.delete()
    
    # Delete the custom user
    user.delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': f'User {username} deleted successfully'})
    
    return redirect('admin_dashboard')


@login_required(login_url='signin')
@require_http_methods(["POST"])
def approve_admin(request, user_id):
    # Approve pending admin account (superuser only).
    if not request.user.is_superuser:
        from django.http import JsonResponse
        return JsonResponse({'error': 'Superuser access only'}, status=403)
    
    user = get_object_or_404(PresentaUser, id=user_id)
    if user.user_role != 'admin':
        from django.http import JsonResponse
        return JsonResponse({'error': 'Not an admin account'}, status=400)
    
    user.admin_approval_status = 'approved'
    user.save()
    
    if user.auth_user:
        user.auth_user.is_staff = True
        user.auth_user.save()
    
    log_activity(
        user=request.user,
        activity_type='user_updated',
        message=f'Approved admin account: {user.username}',
        target_user=user.auth_user
    )
    
    from django.http import JsonResponse
    return JsonResponse({'success': True, 'message': f'Admin {user.username} approved successfully'})


@login_required(login_url='signin')
@require_http_methods(["POST"])
def reject_admin(request, user_id):
    # Reject and delete pending admin account (superuser only).
    if not request.user.is_superuser:
        from django.http import JsonResponse
        return JsonResponse({'error': 'Superuser access only'}, status=403)
    
    user = get_object_or_404(PresentaUser, id=user_id)
    if user.user_role != 'admin':
        from django.http import JsonResponse
        return JsonResponse({'error': 'Not an admin account'}, status=400)
    
    # Store username for log message before deletion
    username = user.username
    auth_user = user.auth_user
    
    # Delete the Presenta User
    user.delete()
    
    # Also delete the Django auth user if it exists
    if auth_user:
        auth_user.delete()
    
    log_activity(
        user=request.user,
        activity_type='user_deleted',
        message=f'Rejected and deleted pending admin account: {username}',
        target_user=None
    )
    
    from django.http import JsonResponse
    return JsonResponse({'success': True, 'message': f'Admin {username} has been deleted'})


@login_required(login_url='signin')
@require_http_methods(["POST"])
def clear_activities(request):
    """Clear all activities for the current user."""
    from django.db.models import Q
    user = request.user
    
    # Check if user is admin
    is_admin = user.is_superuser
    if not is_admin:
        try:
            is_admin = user.profile.user_role == 'admin'
        except Profile.DoesNotExist:
            pass
    
    if is_admin:
        # Admins see ALL platform activities, so clear all
        Activity.objects.filter(is_cleared=False).update(is_cleared=True)
    else:
        # Get IDs of requests related to this user
        # For clients: requests they submitted
        # For designers: requests assigned to them
        user_request_ids = DesignRequest.objects.filter(
            Q(requester=user) | Q(designer=user)
        ).values_list('id', flat=True)
        
        # Mark all activities as cleared:
        # 1. User's own activities
        # 2. Activities on user's requests (submitted requests or assigned projects)
        Activity.objects.filter(
            Q(user=user) | 
            Q(related_request_id__in=user_request_ids),
            is_cleared=False
        ).update(is_cleared=True)
    
    # Redirect back to the referring page or dashboard
    referer = request.META.get('HTTP_REFERER')
    
    # Check if it's an AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        from django.http import JsonResponse
        return JsonResponse({'success': True})
    
    if referer:
        return redirect(referer)
    
    # Default redirect based on role
    try:
        profile = user.profile
        if profile.user_role == 'designer':
            return redirect('designer_dashboard')
        elif profile.user_role == 'admin':
            return redirect('admin_dashboard')
        else:
            return redirect('user_dashboard')
    except Profile.DoesNotExist:
        return redirect('index')


@require_http_methods(["POST"])
def password_reset_lookup(request):
    """AJAX endpoint to lookup user by email or username."""
    from django.http import JsonResponse
    
    identifier = request.POST.get('identifier', '').strip()
    
    if not identifier:
        return JsonResponse({'found': False, 'error': 'Please enter an email or username.'})
    
    # Try to find user by email or username in both Django User and Presenta User
    user = None
    presenta_user = None
    
    # First check Django User model
    try:
        user = DjangoUser.objects.filter(email__iexact=identifier).first()
        if not user:
            user = DjangoUser.objects.filter(username__iexact=identifier).first()
    except Exception:
        pass
    
    # If not found in Django User, check Presenta User
    if not user:
        try:
            presenta_user = User.objects.filter(email__iexact=identifier).first()
            if not presenta_user:
                presenta_user = User.objects.filter(username__iexact=identifier).first()
            
            # If found in Presenta User, get or create linked Django User
            if presenta_user:
                if presenta_user.auth_user:
                    user = presenta_user.auth_user
                else:
                    # Create Django user if not linked
                    username = presenta_user.username or presenta_user.email
                    user, created = DjangoUser.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': presenta_user.email,
                            'first_name': presenta_user.first_name or '',
                            'last_name': presenta_user.last_name or '',
                        }
                    )
                    if created:
                        user.set_unusable_password()
                        user.save()
                    # Link them
                    presenta_user.auth_user = user
                    presenta_user.save()
        except Exception:
            pass
    
    if user:
        return JsonResponse({
            'found': True,
            'user_id': user.id,
            'email': user.email,
            'username': user.username
        })
    
    return JsonResponse({'found': False, 'error': 'No account found with that email or username.'})


@require_http_methods(["GET", "POST"])
def password_reset_form(request, user_id):
    """Display and process the password reset form."""
    from django.http import JsonResponse
    
    # Get the user
    user = get_object_or_404(DjangoUser, id=user_id)
    
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        new_password = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        # Validation
        if not new_password or not confirm_password:
            return JsonResponse({'success': False, 'error': 'Both password fields are required.'})
        
        if new_password != confirm_password:
            return JsonResponse({'success': False, 'error': 'Passwords do not match.'})
        
        if len(new_password) < 8:
            return JsonResponse({'success': False, 'error': 'Password must be at least 8 characters long.'})
        
        # Update Django User password
        user.set_password(new_password)
        user.save()
        
        # Update Presenta User password if linked
        try:
            presenta_user = user.presenta_user
            presenta_user.set_password(new_password)
            presenta_user.save()
        except (User.DoesNotExist, AttributeError):
            pass
        
        # Log password change activity
        log_activity(
            user=user,
            activity_type='password_changed',
            message="Password was changed."
        )
        
        return JsonResponse({'success': True, 'message': 'Password has been reset successfully.'})
    
    # For GET requests, return user info for the form
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'user_id': user.id,
            'email': user.email,
            'username': user.username
        })
    
    # Regular GET - redirect to signin page
    return redirect('signin')


@require_http_methods(["POST"])
def password_reset_confirm(request, user_id):
    """Process password reset confirmation (alternative endpoint)."""
    from django.http import JsonResponse
    
    user = get_object_or_404(DjangoUser, id=user_id)
    
    new_password = request.POST.get('new_password', '')
    confirm_password = request.POST.get('confirm_password', '')
    
    # Validation
    if not new_password or not confirm_password:
        return JsonResponse({'success': False, 'error': 'Both password fields are required.'})
    
    if new_password != confirm_password:
        return JsonResponse({'success': False, 'error': 'Passwords do not match.'})
    
    if len(new_password) < 8:
        return JsonResponse({'success': False, 'error': 'Password must be at least 8 characters long.'})
    
    # Update Django User password
    user.set_password(new_password)
    user.save()
    
    # Update Presenta User password if linked
    try:
        presenta_user = user.presenta_user
        presenta_user.set_password(new_password)
        presenta_user.save()
    except (User.DoesNotExist, AttributeError):
        pass
    
    # Log password change activity
    log_activity(
        user=user,
        activity_type='password_changed',
        message="Password was changed."
    )
    
    return JsonResponse({'success': True, 'message': 'Password has been reset successfully.'})

# ========================
# SETTINGS VIEWS
# ========================

@login_required
def settings_page(request):
    """Redirect to unified settings page."""
    return redirect('unified_settings')


@login_required
def unified_settings(request):
    """Unified settings page with all settings sections in one page."""
    from .forms import UserSettingsForm, DesignerSettingsForm, AdminSettingsForm, EditProfileForm, ProfileSettingsForm
    from django.contrib import messages
    import json
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Get or create user settings
    user_settings, created = UserSettings.objects.get_or_create(user=user)
    
    # Initialize all forms
    account_form = UserSettingsForm()
    profile_form = EditProfileForm(instance=presenta_user)
    profile_settings_form = ProfileSettingsForm()
    designer_form = None
    admin_form = None
    
    # Parse social media links from JSON
    social_media = user_settings.social_media_links or {}
    
    # Profile Settings form initialization
    profile_settings_form = ProfileSettingsForm(initial={
        'social_media_links': json.dumps(social_media) if social_media else '{}',
        'availability_hours': user_settings.availability_hours,
        'custom_hours': user_settings.custom_hours,
        'preferred_contact_method': user_settings.preferred_contact_method,
        'emergency_contact_name': user_settings.emergency_contact_name,
        'emergency_contact_phone': user_settings.emergency_contact_phone,
    })
    
    # Designer forms
    if user.profile.user_role == 'designer':
        designer_form = DesignerSettingsForm(initial={
            'designer_availability': user_settings.designer_availability,
            'availability_hours': user_settings.availability_hours,
            'custom_hours': user_settings.custom_hours,
            'timezone': user_settings.timezone,
            'designer_rate': user_settings.designer_rate,
            'turnaround_time_days': user_settings.turnaround_time_days,
            'extra_revision_price': user_settings.extra_revision_price,
            'rush_job_multiplier': user_settings.rush_job_multiplier,
            'minimum_project_budget': user_settings.minimum_project_budget,
            'designer_specializations': user_settings.designer_specializations,
            'industry_expertise': user_settings.industry_expertise,
            'software_tools': user_settings.software_tools,
            'accept_project_requests': user_settings.accept_project_requests,
            'max_concurrent_projects': user_settings.max_concurrent_projects,
            'revision_limit': user_settings.revision_limit,
            'portfolio_url': user_settings.portfolio_url,
            'portfolio_public': user_settings.portfolio_public,
            'show_testimonials': user_settings.show_testimonials,
            'communication_preference': user_settings.communication_preference,
            'payout_method': user_settings.payout_method,
            'payout_frequency': user_settings.payout_frequency,
        })
    
    # Admin forms
    if user.is_superuser or user.profile.user_role == 'admin':
        admin_form = AdminSettingsForm(initial={
            'user_approval_required': user_settings.user_approval_required,
            'maintenance_mode': user_settings.maintenance_mode,
            'platform_commission_percent': user_settings.platform_commission_percent,
            'site_name': 'Presenta',
            'site_description': 'Professional Design Services Platform',
            'support_email': 'support@presenta.com',
            'email_template_welcome': user_settings.email_template_welcome,
            'email_template_notification': user_settings.email_template_notification,
            'announcement_banner': user_settings.announcement_banner,
            'announcement_banner_visible': user_settings.announcement_banner_visible,
            'announcement_banner_type': user_settings.announcement_banner_type,
            'announcement_banner_bg_color': user_settings.announcement_banner_bg_color,
            'announcement_banner_text_color': user_settings.announcement_banner_text_color,
            'moderation_keywords': user_settings.moderation_keywords,
            'backup_schedule': user_settings.backup_schedule,
            'api_rate_limit': user_settings.api_rate_limit,
            'form_submission_limit': user_settings.form_submission_limit,
            'grant_analytics_to_roles': user_settings.grant_analytics_to_roles,
            'dispute_resolution_days': user_settings.dispute_resolution_days,
            'auto_refund_enabled': user_settings.auto_refund_enabled,
            'seasonal_active': user_settings.seasonal_active,
            'seasonal_name': user_settings.seasonal_name,
            'seasonal_start_date': user_settings.seasonal_start_date,
            'seasonal_end_date': user_settings.seasonal_end_date,
            'seasonal_fee_multiplier': user_settings.seasonal_fee_multiplier,
        })
    
    # Handle POST requests for different sections
    if request.method == 'POST':
        # Check which form was submitted using the hidden form_type field
        form_type = request.POST.get('form_type', '')
        
        if form_type == 'profile-settings':
            # Profile settings form
            profile_settings_form = ProfileSettingsForm(request.POST)
            if profile_settings_form.is_valid():
                # Update social media links from JSON
                social_media_json = profile_settings_form.cleaned_data.get('social_media_links', '{}')
                try:
                    user_settings.social_media_links = json.loads(social_media_json)
                except json.JSONDecodeError:
                    user_settings.social_media_links = {}
                user_settings.availability_hours = profile_settings_form.cleaned_data.get('availability_hours', user_settings.availability_hours)
                user_settings.custom_hours = profile_settings_form.cleaned_data.get('custom_hours', user_settings.custom_hours)
                user_settings.preferred_contact_method = profile_settings_form.cleaned_data.get('preferred_contact_method', user_settings.preferred_contact_method)
                user_settings.emergency_contact_name = profile_settings_form.cleaned_data.get('emergency_contact_name', user_settings.emergency_contact_name)
                user_settings.emergency_contact_phone = profile_settings_form.cleaned_data.get('emergency_contact_phone', user_settings.emergency_contact_phone)
                user_settings.save()
                messages.success(request, 'Profile settings updated successfully.')
            else:
                messages.error(request, 'Error updating profile settings. Please check the form.')
        elif form_type == 'designer':
            # Designer settings form
            designer_form = DesignerSettingsForm(request.POST)
            if designer_form.is_valid():
                user_settings.designer_availability = designer_form.cleaned_data.get('designer_availability', user_settings.designer_availability)
                user_settings.availability_hours = designer_form.cleaned_data.get('availability_hours', user_settings.availability_hours)
                user_settings.custom_hours = designer_form.cleaned_data.get('custom_hours', user_settings.custom_hours)
                user_settings.timezone = designer_form.cleaned_data.get('timezone', user_settings.timezone)
                user_settings.designer_rate = designer_form.cleaned_data.get('designer_rate') or user_settings.designer_rate
                user_settings.turnaround_time_days = designer_form.cleaned_data.get('turnaround_time_days') or user_settings.turnaround_time_days
                user_settings.extra_revision_price = designer_form.cleaned_data.get('extra_revision_price') or user_settings.extra_revision_price
                user_settings.rush_job_multiplier = designer_form.cleaned_data.get('rush_job_multiplier') or user_settings.rush_job_multiplier
                user_settings.minimum_project_budget = designer_form.cleaned_data.get('minimum_project_budget') or user_settings.minimum_project_budget
                user_settings.designer_specializations = designer_form.cleaned_data.get('designer_specializations', user_settings.designer_specializations)
                user_settings.industry_expertise = designer_form.cleaned_data.get('industry_expertise', user_settings.industry_expertise)
                user_settings.software_tools = designer_form.cleaned_data.get('software_tools', user_settings.software_tools)
                user_settings.accept_project_requests = designer_form.cleaned_data.get('accept_project_requests', False)
                user_settings.max_concurrent_projects = designer_form.cleaned_data.get('max_concurrent_projects') or user_settings.max_concurrent_projects
                user_settings.revision_limit = designer_form.cleaned_data.get('revision_limit') or user_settings.revision_limit
                user_settings.portfolio_url = designer_form.cleaned_data.get('portfolio_url') or user_settings.portfolio_url
                user_settings.portfolio_public = designer_form.cleaned_data.get('portfolio_public', False)
                user_settings.show_testimonials = designer_form.cleaned_data.get('show_testimonials', False)
                user_settings.communication_preference = designer_form.cleaned_data.get('communication_preference', user_settings.communication_preference)
                user_settings.payout_method = designer_form.cleaned_data.get('payout_method', user_settings.payout_method)
                user_settings.payout_frequency = designer_form.cleaned_data.get('payout_frequency', user_settings.payout_frequency)
                user_settings.save()
                messages.success(request, 'Designer settings updated successfully.')
            else:
                messages.error(request, 'Error updating designer settings. Please check the form.')
        elif form_type == 'admin':
            # Admin settings form
            admin_form = AdminSettingsForm(request.POST)
            if admin_form.is_valid():
                user_settings.user_approval_required = admin_form.cleaned_data.get('user_approval_required', False)
                user_settings.maintenance_mode = admin_form.cleaned_data.get('maintenance_mode', False)
                user_settings.platform_commission_percent = admin_form.cleaned_data.get('platform_commission_percent') or user_settings.platform_commission_percent
                user_settings.email_template_welcome = admin_form.cleaned_data.get('email_template_welcome', user_settings.email_template_welcome)
                user_settings.email_template_notification = admin_form.cleaned_data.get('email_template_notification', user_settings.email_template_notification)
                user_settings.announcement_banner = admin_form.cleaned_data.get('announcement_banner', user_settings.announcement_banner)
                user_settings.announcement_banner_visible = admin_form.cleaned_data.get('announcement_banner_visible', False)
                user_settings.announcement_banner_type = admin_form.cleaned_data.get('announcement_banner_type', user_settings.announcement_banner_type)
                user_settings.announcement_banner_bg_color = admin_form.cleaned_data.get('announcement_banner_bg_color', user_settings.announcement_banner_bg_color)
                user_settings.announcement_banner_text_color = admin_form.cleaned_data.get('announcement_banner_text_color', user_settings.announcement_banner_text_color)
                user_settings.moderation_keywords = admin_form.cleaned_data.get('moderation_keywords', user_settings.moderation_keywords)
                user_settings.backup_schedule = admin_form.cleaned_data.get('backup_schedule', user_settings.backup_schedule)
                user_settings.api_rate_limit = admin_form.cleaned_data.get('api_rate_limit') or user_settings.api_rate_limit
                user_settings.form_submission_limit = admin_form.cleaned_data.get('form_submission_limit') or user_settings.form_submission_limit
                user_settings.grant_analytics_to_roles = admin_form.cleaned_data.get('grant_analytics_to_roles', user_settings.grant_analytics_to_roles)
                user_settings.dispute_resolution_days = admin_form.cleaned_data.get('dispute_resolution_days') or user_settings.dispute_resolution_days
                user_settings.auto_refund_enabled = admin_form.cleaned_data.get('auto_refund_enabled', False)
                user_settings.seasonal_active = admin_form.cleaned_data.get('seasonal_active', False)
                user_settings.seasonal_name = admin_form.cleaned_data.get('seasonal_name', user_settings.seasonal_name)
                user_settings.seasonal_start_date = admin_form.cleaned_data.get('seasonal_start_date') or user_settings.seasonal_start_date
                user_settings.seasonal_end_date = admin_form.cleaned_data.get('seasonal_end_date') or user_settings.seasonal_end_date
                user_settings.seasonal_fee_multiplier = admin_form.cleaned_data.get('seasonal_fee_multiplier') or user_settings.seasonal_fee_multiplier
                user_settings.save()
                messages.success(request, 'Admin settings updated successfully.')
            else:
                messages.error(request, 'Error updating admin settings. Please check the form.')
        elif form_type == 'edit-profile':
            # Edit Profile form
            profile_form = EditProfileForm(request.POST, instance=presenta_user)
            if profile_form.is_valid():
                profile = profile_form.save(commit=False)
                
                # Handle profile picture cropping
                cropped_image_data = request.POST.get('cropped_image_data')
                remove_picture = request.POST.get('cropped_image_data') == 'remove'
                
                if remove_picture:
                    if profile.profile_picture:
                        profile.profile_picture.delete(save=True)
                    profile.profile_picture = None
                elif cropped_image_data and not cropped_image_data.startswith('remove'):
                    try:
                        format_part, imgstr = cropped_image_data.split(';base64,')
                        image_data = base64.b64decode(imgstr)
                        image = Image.open(BytesIO(image_data))
                        if image.mode in ('RGBA', 'P'):
                            image = image.convert('RGB')
                        img_io = BytesIO()
                        image.save(img_io, format='JPEG', quality=85)
                        img_io.seek(0)
                        import uuid
                        filename = f"profile_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                        from django.core.files.uploadedfile import InMemoryUploadedFile
                        cropped_file = InMemoryUploadedFile(
                            img_io, None, filename, 'image/jpeg', img_io.tell(), None
                        )
                        profile.profile_picture = cropped_file
                    except Exception as e:
                        print(f"Error processing image: {e}")
                
                # Handle cover photo cropping
                cover_cropped_image_data = request.POST.get('cover_cropped_image_data')
                remove_cover = request.POST.get('cover_cropped_image_data') == 'remove'
                
                if remove_cover:
                    if presenta_user.cover_photo:
                        presenta_user.cover_photo.delete(save=True)
                    presenta_user.cover_photo = None
                elif cover_cropped_image_data and not cover_cropped_image_data.startswith('remove'):
                    try:
                        format_part, imgstr = cover_cropped_image_data.split(';base64,')
                        image_data = base64.b64decode(imgstr)
                        image = Image.open(BytesIO(image_data))
                        if image.mode in ('RGBA', 'P'):
                            image = image.convert('RGB')
                        img_io = BytesIO()
                        image.save(img_io, format='JPEG', quality=85)
                        img_io.seek(0)
                        import uuid
                        filename = f"cover_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                        from django.core.files.uploadedfile import InMemoryUploadedFile
                        cropped_file = InMemoryUploadedFile(
                            img_io, None, filename, 'image/jpeg', img_io.tell(), None
                        )
                        presenta_user.cover_photo = cropped_file
                    except Exception as e:
                        print(f"Error processing cover image: {e}")
                
                profile.save()
                
                # Also update Django user first_name, last_name, and username
                if profile.first_name:
                    user.first_name = profile.first_name
                if profile.last_name:
                    user.last_name = profile.last_name
                if profile.username:
                    user.username = profile.username
                if profile.first_name or profile.last_name or profile.username:
                    user.save()
                
                messages.success(request, 'Profile updated successfully.')
            else:
                messages.error(request, 'Error updating profile. Please check the form.')
        else:
            # Account settings form (default)
            # First handle profile update if it has first_name, last_name, or username
            if 'first_name' in request.POST or 'last_name' in request.POST or 'username' in request.POST:
                profile_form = EditProfileForm(request.POST, instance=presenta_user)
                if profile_form.is_valid():
                    profile = profile_form.save(commit=False)
                    
                    # Handle profile picture cropping
                    cropped_image_data = request.POST.get('cropped_image_data')
                    remove_picture = request.POST.get('cropped_image_data') == 'remove'
                    
                    if remove_picture:
                        if profile.profile_picture:
                            profile.profile_picture.delete(save=True)
                        profile.profile_picture = None
                    elif cropped_image_data and not cropped_image_data.startswith('remove'):
                        try:
                            format_part, imgstr = cropped_image_data.split(';base64,')
                            image_data = base64.b64decode(imgstr)
                            image = Image.open(BytesIO(image_data))
                            if image.mode in ('RGBA', 'P'):
                                image = image.convert('RGB')
                            img_io = BytesIO()
                            image.save(img_io, format='JPEG', quality=85)
                            img_io.seek(0)
                            import uuid
                            filename = f"profile_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                            from django.core.files.uploadedfile import InMemoryUploadedFile
                            cropped_file = InMemoryUploadedFile(
                                img_io, None, filename, 'image/jpeg', img_io.tell(), None
                            )
                            profile.profile_picture = cropped_file
                        except Exception as e:
                            print(f"Error processing image: {e}")
                        
                        # Handle cover photo cropping
                        cover_cropped_image_data = request.POST.get('cover_cropped_image_data')
                        remove_cover = request.POST.get('cover_cropped_image_data') == 'remove'
                        
                        if remove_cover:
                            if presenta_user.cover_photo:
                                presenta_user.cover_photo.delete(save=True)
                            presenta_user.cover_photo = None
                        elif cover_cropped_image_data and not cover_cropped_image_data.startswith('remove'):
                            try:
                                format_part, imgstr = cover_cropped_image_data.split(';base64,')
                                image_data = base64.b64decode(imgstr)
                                image = Image.open(BytesIO(image_data))
                                if image.mode in ('RGBA', 'P'):
                                    image = image.convert('RGB')
                                img_io = BytesIO()
                                image.save(img_io, format='JPEG', quality=85)
                                img_io.seek(0)
                                import uuid
                                filename = f"cover_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                                from django.core.files.uploadedfile import InMemoryUploadedFile
                                cropped_file = InMemoryUploadedFile(
                                    img_io, None, filename, 'image/jpeg', img_io.tell(), None
                                )
                                presenta_user.cover_photo = cropped_file
                            except Exception as e:
                                print(f"Error processing cover image: {e}")
                        
                        profile.save()
                        
                        # Also update Django user first_name, last_name, and username
                    if profile.first_name:
                        user.first_name = profile.first_name
                    if profile.last_name:
                        user.last_name = profile.last_name
                    if profile.username:
                        user.username = profile.username
                    if profile.first_name or profile.last_name or profile.username:
                        user.save()
            
            # Handle account settings
            account_form = UserSettingsForm(request.POST)
            if account_form.is_valid():
                user_settings.timezone = account_form.cleaned_data.get('timezone', user_settings.timezone)
                user_settings.language = account_form.cleaned_data.get('language', user_settings.language)
                user_settings.greeting_name_preference = account_form.cleaned_data.get('greeting_name_preference', user_settings.greeting_name_preference)
                user_settings.show_time_date = account_form.cleaned_data.get('show_time_date', False)
                user_settings.currency_preference = account_form.cleaned_data.get('currency_preference', user_settings.currency_preference)
                user_settings.email_notifications_enabled = account_form.cleaned_data.get('email_notifications_enabled', False)
                user_settings.order_updates_email = account_form.cleaned_data.get('order_updates_email', False)
                user_settings.marketing_emails = account_form.cleaned_data.get('marketing_emails', False)
                user_settings.notification_frequency = account_form.cleaned_data.get('notification_frequency', user_settings.notification_frequency)
                user_settings.profile_visibility = account_form.cleaned_data.get('profile_visibility', user_settings.profile_visibility)
                user_settings.show_user_status = account_form.cleaned_data.get('show_user_status', False)
                user_settings.save()
                messages.success(request, 'Settings updated successfully.')
            else:
                # If account form has errors, show them
                for field, errors in account_form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
        
        return redirect('unified_settings')
    
    # Populate account form with current settings
    account_form = UserSettingsForm(initial={
        'timezone': user_settings.timezone,
        'language': user_settings.language,
        'greeting_name_preference': user_settings.greeting_name_preference,
        'show_time_date': user_settings.show_time_date,
        'currency_preference': user_settings.currency_preference,
        'email_notifications_enabled': user_settings.email_notifications_enabled,
        'order_updates_email': user_settings.order_updates_email,
        'marketing_emails': user_settings.marketing_emails,
        'notification_frequency': user_settings.notification_frequency,
        'profile_visibility': user_settings.profile_visibility,
        'show_user_status': user_settings.show_user_status,
    })
    
    # Get sample categories for admin
    sample_categories = []
    if user.is_superuser or user.profile.user_role == 'admin':
        sample_categories = SampleCategory.objects.prefetch_related('items').order_by('order', 'name')
    
    context = {
        'form': account_form,
        'profile_form': profile_form,
        'profile_settings_form': profile_settings_form,
        'designer_form': designer_form,
        'admin_form': admin_form,
        'presenta_user': presenta_user,
        'settings_section': 'unified',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username,
        'sample_categories': sample_categories,
    }
    return render(request, 'settings/unified_settings.html', context)


@login_required
def settings_page_old(request):
    """Redirect to appropriate settings page based on user role."""
    try:
        profile = request.user.profile
        if request.user.is_superuser or profile.user_role == 'admin':
            return redirect('admin_settings')
        elif profile.user_role == 'designer':
            return redirect('designer_settings')
        else:
            return redirect('account_settings')
    except Profile.DoesNotExist:
        return redirect('account_settings')


@login_required
def account_settings(request):
    """Account and notification settings for all users."""
    from .forms import UserSettingsForm
    from django.contrib import messages
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Get or create user settings
    user_settings, created = UserSettings.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        form = UserSettingsForm(request.POST)
        if form.is_valid():
            # Handle password change
            current_password = form.cleaned_data.get('current_password')
            new_password = form.cleaned_data.get('new_password')
            confirm_password = form.cleaned_data.get('confirm_password')
            
            if new_password:
                if not presenta_user.check_password(current_password):
                    form.add_error('current_password', 'Current password is incorrect.')
                elif new_password != confirm_password:
                    form.add_error('confirm_password', 'Passwords do not match.')
                elif len(new_password) < 8:
                    form.add_error('new_password', 'Password must be at least 8 characters.')
                else:
                    # Update both Presenta User and Django User passwords
                    presenta_user.set_password(new_password)
                    presenta_user.save()
                    user.set_password(new_password)
                    user.save()
                    
                    # Log the password change
                    log_activity(
                        user=user,
                        activity_type='password_changed',
                        message="Password was changed from settings."
                    )
                    
                    messages.success(request, 'Password changed successfully.')
                    return redirect('account_settings')
            
            # Update user settings
            user_settings.timezone = form.cleaned_data.get('timezone', user_settings.timezone)
            user_settings.language = form.cleaned_data.get('language', user_settings.language)
            user_settings.greeting_name_preference = form.cleaned_data.get('greeting_name_preference', user_settings.greeting_name_preference)
            user_settings.show_time_date = form.cleaned_data.get('show_time_date', False)
            user_settings.currency_preference = form.cleaned_data.get('currency_preference', user_settings.currency_preference)
            user_settings.email_notifications_enabled = form.cleaned_data.get('email_notifications_enabled', False)
            user_settings.order_updates_email = form.cleaned_data.get('order_updates_email', False)
            user_settings.marketing_emails = form.cleaned_data.get('marketing_emails', False)
            user_settings.notification_frequency = form.cleaned_data.get('notification_frequency', user_settings.notification_frequency)
            user_settings.profile_visibility = form.cleaned_data.get('profile_visibility', user_settings.profile_visibility)
            user_settings.show_user_status = form.cleaned_data.get('show_user_status', False)
            user_settings.save()
            
            messages.success(request, 'Settings updated successfully.')
            return redirect('account_settings')
    else:
        # Populate form with current settings
        initial_data = {
            'timezone': user_settings.timezone,
            'language': user_settings.language,
            'greeting_name_preference': user_settings.greeting_name_preference,
            'show_time_date': user_settings.show_time_date,
            'currency_preference': user_settings.currency_preference,
            'email_notifications_enabled': user_settings.email_notifications_enabled,
            'order_updates_email': user_settings.order_updates_email,
            'marketing_emails': user_settings.marketing_emails,
            'notification_frequency': user_settings.notification_frequency,
            'profile_visibility': user_settings.profile_visibility,
            'show_user_status': user_settings.show_user_status,
        }
        form = UserSettingsForm(initial=initial_data)
    
    context = {
        'form': form,
        'settings_section': 'account',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username,
    }
    return render(request, 'settings/account_settings.html', context)


@login_required
def designer_settings(request):
    """Settings page for designers."""
    from .forms import DesignerSettingsForm
    from django.contrib import messages
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Check if user is a designer
    if user.profile.user_role != 'designer':
        messages.error(request, 'You do not have permission to access designer settings.')
        return redirect('account_settings')
    
    # Get or create user settings
    user_settings, created = UserSettings.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        designer_form = DesignerSettingsForm(request.POST)
        
        if designer_form.is_valid():
            user_settings.designer_availability = designer_form.cleaned_data.get('designer_availability', user_settings.designer_availability)
            user_settings.designer_rate = designer_form.cleaned_data.get('designer_rate') or user_settings.designer_rate
            user_settings.designer_specializations = designer_form.cleaned_data.get('designer_specializations', user_settings.designer_specializations)
            user_settings.accept_project_requests = designer_form.cleaned_data.get('accept_project_requests', False)
            user_settings.portfolio_url = designer_form.cleaned_data.get('portfolio_url') or user_settings.portfolio_url
            user_settings.max_concurrent_projects = designer_form.cleaned_data.get('max_concurrent_projects') or user_settings.max_concurrent_projects
            user_settings.revision_limit = designer_form.cleaned_data.get('revision_limit') or user_settings.revision_limit
            user_settings.minimum_project_budget = designer_form.cleaned_data.get('minimum_project_budget') or user_settings.minimum_project_budget
            user_settings.save()
            
            messages.success(request, 'Designer settings updated successfully.')
            return redirect('designer_settings')
    else:
        # Populate form with current settings
        initial_data = {
            'designer_availability': user_settings.designer_availability,
            'designer_rate': user_settings.designer_rate,
            'designer_specializations': user_settings.designer_specializations,
            'accept_project_requests': user_settings.accept_project_requests,
            'portfolio_url': user_settings.portfolio_url,
            'max_concurrent_projects': user_settings.max_concurrent_projects,
            'revision_limit': user_settings.revision_limit,
            'minimum_project_budget': user_settings.minimum_project_budget,
        }
        designer_form = DesignerSettingsForm(initial=initial_data)
    
    context = {
        'designer_form': designer_form,
        'settings_section': 'designer',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username,
    }
    return render(request, 'settings/designer_settings.html', context)


@login_required
def admin_settings(request):
    """Settings page for administrators."""
    from .forms import AdminSettingsForm
    from django.contrib import messages
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Check if user is an admin
    if not (user.is_superuser or user.profile.user_role == 'admin'):
        messages.error(request, 'You do not have permission to access admin settings.')
        return redirect('account_settings')
    
    # Get or create user settings
    user_settings, created = UserSettings.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        admin_form = AdminSettingsForm(request.POST)
        
        if admin_form.is_valid():
            user_settings.maintenance_mode = admin_form.cleaned_data.get('maintenance_mode', False)
            user_settings.save()
            
            messages.success(request, 'Admin settings updated successfully.')
            return redirect('admin_settings')
    else:
        initial_data = {
            'maintenance_mode': user_settings.maintenance_mode,
            'site_name': 'Presenta',
            'site_description': 'Professional Design Services Platform',
            'support_email': 'support@presenta.com',
        }
        admin_form = AdminSettingsForm(initial=initial_data)
    
    context = {
        'admin_form': admin_form,
        'settings_section': 'admin',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username,
    }
    return render(request, 'settings/admin_settings.html', context)


@login_required
@require_http_methods(["POST"])
def change_password_ajax(request):
    """AJAX endpoint to change password from settings page."""
    from django.http import JsonResponse
    from django.contrib import messages
    
    user = request.user
    presenta_user = user.presenta_user
    
    current_password = request.POST.get('current_password', '')
    new_password = request.POST.get('new_password', '')
    confirm_password = request.POST.get('confirm_password', '')
    
    errors = {}
    
    # Validation
    if not current_password:
        errors['current_password'] = 'Current password is required'
    
    if not new_password:
        errors['new_password'] = 'New password is required'
    elif len(new_password) < 8:
        errors['new_password'] = 'Password must be at least 8 characters'
    
    if not confirm_password:
        errors['confirm_password'] = 'Please confirm your password'
    elif new_password != confirm_password:
        errors['confirm_password'] = 'Passwords do not match'
    
    # Check current password
    if current_password and not presenta_user.check_password(current_password):
        errors['current_password'] = 'Current password is incorrect'
    
    if errors:
        return JsonResponse({
            'success': False,
            'error': 'Please fix the errors below',
            'errors': errors
        })
    
    # Update password
    try:
        presenta_user.set_password(new_password)
        presenta_user.save()
        
        # Also update Django User password
        user.set_password(new_password)
        user.save()
        
        # Log the password change
        log_activity(
            user=user,
            activity_type='password_changed',
            message="Password was changed from settings."
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Password changed successfully!'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'An error occurred while changing password. Please try again.'
        })


@login_required
def edit_profile_settings(request):
    """Redirect to unified settings page with edit profile section active."""
    return redirect('unified_settings')


@login_required
@require_http_methods(["GET", "POST"])
def profile_view(request, username=None):
    """View user profile (self or others)."""
    from django.http import Http404, JsonResponse
    from django.db.models import Q, Count
    from .models import Block, Report, User as PresentaUser

    if not request.user.is_authenticated:
        return redirect('signin')

    # Get target user
    if username is None:
        # Self profile
        target_presenta = get_presenta_user_safe(request.user)
        is_self = True
    else:
        target_presenta = get_object_or_404(PresentaUser, username__iexact=username)
        is_self = (target_presenta.auth_user == request.user)

    target_django = target_presenta.auth_user
    viewer_is_admin = is_admin_user(request)

    # Check if viewer blocked target
    is_blocked = Block.objects.filter(
        blocker=request.user, 
        blocked_user=target_django
    ).exists()

    # Privacy check - simplified
    try:
        target_settings, _ = UserSettings.objects.get_or_create(user=target_django)
        is_private = (target_settings.profile_visibility == 'private' and not is_self)
    except:
        is_private = False

    if is_blocked or (is_private and not viewer_is_admin):
        # Show limited/blocked view or 404
        if is_blocked:
            context = {'message': 'You have blocked this user.', 'is_blocked': True}
        else:
            raise Http404("Profile not found or private.")
        return render(request, 'profile.html', context)

    # Stats
    stats = {}
    if target_django:
        stats['requests'] = DesignRequest.objects.filter(
            Q(requester=target_django) | Q(designer=target_django)
        ).aggregate(total=Count('id'))['total'] or 0
        stats['completed'] = DesignRequest.objects.filter(
            Q(requester=target_django) | Q(designer=target_django),
            status='completed'
        ).count()
        
        # Add average rating for designers
        if target_presenta.user_role == 'designer':
            from .models import DesignerRating
            avg_rating = DesignerRating.get_average_rating(target_django)
            rating_count = DesignerRating.get_rating_count(target_django)
            stats['average_rating'] = round(avg_rating, 1)
            stats['rating_count'] = rating_count

    # Recent activities (public)
    activities = Activity.objects.filter(
        user=target_django,
        is_cleared=False
    ).select_related('related_request').order_by('-created_at')[:5]

    # Recent works based on user role
    recent_works = []
    if target_presenta.user_role == 'client':
        # For clients: show recent design requests they made
        recent_works = DesignRequest.objects.filter(
            requester=target_django
        ).select_related('designer').order_by('-created_at')[:6]
    elif target_presenta.user_role == 'designer':
        # For designers: show recent design requests they worked on
        recent_works = DesignRequest.objects.filter(
            designer=target_django
        ).select_related('requester').order_by('-created_at')[:6]

    context = {
        'target': target_presenta,
        'target_django': target_django,
        'is_self': is_self,
        'is_blocked': is_blocked,
        'viewer_is_admin': viewer_is_admin,
        'stats': stats,
        'activities': activities,
        'recent_works': recent_works,
        'can_ban': viewer_is_admin,
        'can_delete': viewer_is_admin,
    }
    return render(request, 'profile.html', context)


def block_user(request):
    """Block a user (POST)."""
    if request.method == 'POST' and request.user.is_authenticated:
        user_id = request.POST.get('user_id')
        if user_id:
            target_django = get_object_or_404(DjangoUser, id=user_id)
            if target_django != request.user:  # Can't block self
                Block.objects.get_or_create(
                    blocker=request.user,
                    blocked_user=target_django
                )
                log_activity(
                    user=request.user,
                    activity_type='user_updated',
                    message=f"Blocked user {target_django.username}",
                    target_user=target_django
                )
                from django.http import JsonResponse
                return JsonResponse({'success': True, 'message': 'User blocked'})
    from django.http import JsonResponse
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


def report_user(request):
    """Report a user (POST)."""
    if request.method == 'POST' and request.user.is_authenticated:
        user_id = request.POST.get('user_id')
        reason = request.POST.get('reason', '').strip()
        if user_id and reason:
            target_django = get_object_or_404(DjangoUser, id=user_id)
            if target_django != request.user:
                Report.objects.create(
                    reporter=request.user,
                    target_user=target_django,
                    reason=reason[:500]
                )
                log_activity(
                    user=request.user,
                    activity_type='user_updated',
                    message=f'Reported user {target_django.username}',
                    target_user=target_django
                )
                from django.http import JsonResponse
                return JsonResponse({'success': True, 'message': 'Report submitted'})
    from django.http import JsonResponse
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


def ban_user(request):
    """Ban user (admin POST)."""
    if request.method == 'POST' and is_admin_user(request):
        user_id = request.POST.get('user_id')
        if user_id:
            target_presenta = get_object_or_404(PresentaUser, id=user_id)
            target_presenta.is_banned = True
            target_presenta.user_role = 'banned'
            target_presenta.save()
            log_activity(
                user=request.user,
                activity_type='user_updated',
                message=f'Banned user {target_presenta.username}',
                target_user=target_presenta.auth_user
            )
            from django.http import JsonResponse
            return JsonResponse({'success': True, 'message': 'User banned'})
    from django.http import JsonResponse
    return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)


def update_user_status(request):
    """Update the user's online status via AJAX."""
    from django.http import JsonResponse
    
    try:
        import json
        data = json.loads(request.body)
        status = data.get('status')
        
        # Validate status
        valid_statuses = ['online', 'idle', 'do_not_disturb']
        if status not in valid_statuses:
            return JsonResponse({
                'success': False,
                'error': 'Invalid status'
            }, status=400)
        
        # Update the user's status
        user = request.user.presenta_user
        user.online_status = status
        user.save()
        
        # Log activity
        log_activity(
            user=request.user,
            activity_type='status_changed',
            message=f"Status changed to {status}"
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Status updated successfully',
            'status': status
        })
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid request format'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# ============ Sample Management Views ============

@login_required
def manage_samples(request):
    """Main page for managing samples - categories and items"""
    from django.contrib import messages
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    categories = SampleCategory.objects.prefetch_related('items').order_by('order', 'name')
    
    context = {
        'categories': categories,
        'settings_section': 'samples',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username if presenta_user else user.username,
    }
    return render(request, 'settings/manage_samples.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def add_sample_category(request):
    """Add a new sample category"""
    from django.contrib import messages
    from django.shortcuts import redirect
    
    user = request.user
    presenta_user = get_presenta_user_safe(user)
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        slug = request.POST.get('slug', '').strip()
        description = request.POST.get('description', '').strip()
        icon = request.POST.get('icon', '').strip()
        order = int(request.POST.get('order', 0))
        
        if not name:
            messages.error(request, 'Category name is required.')
            return redirect('manage_samples')
        
        if not slug:
            # Auto-generate slug from name
            from django.utils.text import slugify
            slug = slugify(name)
        
        # Check for duplicate slug
        if SampleCategory.objects.filter(slug=slug).exists():
            messages.error(request, 'A category with this slug already exists.')
            return redirect('manage_samples')
        
        category = SampleCategory.objects.create(
            name=name,
            slug=slug,
            description=description,
            icon=icon,
            order=order
        )
        
        messages.success(request, f'Category "{category.name}" created successfully.')
        return redirect('manage_samples')
    
    return redirect('manage_samples')


@login_required
@require_http_methods(["GET", "POST"])
def edit_sample_category(request, category_id):
    """Edit an existing sample category"""
    from django.contrib import messages
    from django.shortcuts import redirect, get_object_or_404
    
    user = request.user
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    category = get_object_or_404(SampleCategory, id=category_id)
    
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        slug = request.POST.get('slug', '').strip()
        description = request.POST.get('description', '').strip()
        icon = request.POST.get('icon', '').strip()
        order = int(request.POST.get('order', 0))
        is_active = request.POST.get('is_active') == 'on'
        
        if not name:
            messages.error(request, 'Category name is required.')
            return redirect('manage_samples')
        
        # Check for duplicate slug (excluding current category)
        if SampleCategory.objects.filter(slug=slug).exclude(id=category_id).exists():
            messages.error(request, 'A category with this slug already exists.')
            return redirect('manage_samples')
        
        category.name = name
        category.slug = slug
        category.description = description
        category.icon = icon
        category.order = order
        category.is_active = is_active
        category.save()
        
        messages.success(request, f'Category "{category.name}" updated successfully.')
        return redirect('manage_samples')
    
    return redirect('manage_samples')


@login_required
@require_http_methods(["POST"])
def delete_sample_category(request, category_id):
    """Delete a sample category and all its items"""
    from django.contrib import messages
    from django.shortcuts import redirect, get_object_or_404
    
    user = request.user
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    category = get_object_or_404(SampleCategory, id=category_id)
    
    # Delete all items in this category first
    category.items.all().delete()
    category_name = category.name
    category.delete()
    
    messages.success(request, f'Category "{category_name}" and all its items have been deleted.')
    return redirect('manage_samples')


@login_required
@require_http_methods(["GET", "POST"])
def add_sample_item(request):
    """Add a new sample item"""
    from django.contrib import messages
    from django.shortcuts import redirect, get_object_or_404
    
    user = request.user
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    if request.method == 'POST':
        category_id = request.POST.get('category')
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        image = request.FILES.get('image')
        client_name = request.POST.get('client_name', '').strip()
        project_date = request.POST.get('project_date')
        tags = request.POST.get('tags', '').strip()
        link = request.POST.get('link', '').strip()
        order = int(request.POST.get('order', 0))
        is_active = request.POST.get('is_active') == 'on'
        
        if not category_id:
            messages.error(request, 'Please select a category.')
            return redirect('manage_samples')
        
        if not title:
            messages.error(request, 'Sample title is required.')
            return redirect('manage_samples')
        
        if not image:
            messages.error(request, 'Sample image is required.')
            return redirect('manage_samples')
        
        category = get_object_or_404(SampleCategory, id=category_id)
        
        # Parse project date
        from django.utils.dateparse import parse_date
        parsed_date = None
        if project_date:
            parsed_date = parse_date(project_date)
        
        item = SampleItem.objects.create(
            category=category,
            title=title,
            description=description,
            image=image,
            client_name=client_name,
            project_date=parsed_date,
            tags=tags,
            link=link,
            order=order,
            is_active=is_active
        )
        
        messages.success(request, f'Sample "{item.title}" created successfully.')
        return redirect('manage_samples')
    
    return redirect('manage_samples')


@login_required
@require_http_methods(["GET", "POST"])
def edit_sample_item(request, item_id):
    """Edit an existing sample item"""
    from django.contrib import messages
    from django.shortcuts import redirect, get_object_or_404
    
    user = request.user
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    item = get_object_or_404(SampleItem, id=item_id)
    
    if request.method == 'POST':
        category_id = request.POST.get('category')
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        image = request.FILES.get('image')
        client_name = request.POST.get('client_name', '').strip()
        project_date = request.POST.get('project_date')
        tags = request.POST.get('tags', '').strip()
        link = request.POST.get('link', '').strip()
        order = int(request.POST.get('order', 0))
        is_active = request.POST.get('is_active') == 'on'
        
        if not category_id:
            messages.error(request, 'Please select a category.')
            return redirect('manage_samples')
        
        if not title:
            messages.error(request, 'Sample title is required.')
            return redirect('manage_samples')
        
        category = get_object_or_404(SampleCategory, id=category_id)
        
        # Parse project date
        from django.utils.dateparse import parse_date
        parsed_date = None
        if project_date:
            parsed_date = parse_date(project_date)
        
        item.category = category
        item.title = title
        item.description = description
        if image:
            item.image = image
        item.client_name = client_name
        item.project_date = parsed_date
        item.tags = tags
        item.link = link
        item.order = order
        item.is_active = is_active
        item.save()
        
        messages.success(request, f'Sample "{item.title}" updated successfully.')
        return redirect('manage_samples')
    
    return redirect('manage_samples')


@login_required
@require_http_methods(["POST"])
def delete_sample_item(request, item_id):
    """Delete a sample item"""
    from django.contrib import messages
    from django.shortcuts import redirect, get_object_or_404
    
    user = request.user
    
    # Check if user is an admin
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        messages.error(request, 'You do not have permission to manage samples.')
        return redirect('account_settings')
    
    item = get_object_or_404(SampleItem, id=item_id)
    item_title = item.title
    item.delete()
    
    messages.success(request, f'Sample "{item_title}" has been deleted.')
    return redirect('manage_samples')


# =====================================================
# API Endpoints for Sample Management (AJAX Modal)
# =====================================================

@login_required
def api_sample_categories(request):
    """API endpoint to get all sample categories with their items (JSON)"""
    from django.http import JsonResponse
    from django.views.decorators.http import require_http_methods
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    categories = SampleCategory.objects.prefetch_related('items').order_by('order', 'name')
    
    data = {
        'categories': [
            {
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'description': cat.description,
                'icon': cat.icon,
                'order': cat.order,
                'is_active': cat.is_active,
                'items': [
                    {
                        'id': item.id,
                        'category_id': cat.id,
                        'title': item.title,
                        'description': item.description,
                        'image_url': item.image.url if item.image else None,
                        'client_name': item.client_name,
                        'project_date': item.project_date.isoformat() if item.project_date else None,
                        'tags': item.tags,
                        'link': item.link,
                        'order': item.order,
                        'is_active': item.is_active,
                    }
                    for item in cat.items.all()
                ]
            }
            for cat in categories
        ]
    }
    
    return JsonResponse(data)


@login_required
@require_http_methods(["GET", "POST", "DELETE"])
def api_sample_category_detail(request, category_id):
    """API endpoint to get, create, or delete a sample category"""
    from django.http import JsonResponse
    from django.contrib import messages
    from django.shortcuts import get_object_or_404
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if request.method == 'GET':
        # Get category detail
        category = get_object_or_404(SampleCategory, id=category_id)
        data = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'icon': category.icon,
            'order': category.order,
            'is_active': category.is_active,
        }
        return JsonResponse(data)
    
    elif request.method == 'POST':
        # Update category
        import json
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        category = get_object_or_404(SampleCategory, id=category_id)
        category.name = data.get('name', category.name)
        category.description = data.get('description', category.description)
        category.icon = data.get('icon', category.icon)
        category.order = data.get('order', category.order)
        category.is_active = data.get('is_active', category.is_active)
        
        # Handle slug
        if 'slug' in data and data['slug'] != category.slug:
            from django.utils.text import slugify
            category.slug = data['slug']
        else:
            from django.utils.text import slugify
            category.slug = slugify(category.name)
        
        category.save()
        return JsonResponse({'success': True, 'message': 'Category updated successfully'})
    
    elif request.method == 'DELETE':
        # Delete category
        category = get_object_or_404(SampleCategory, id=category_id)
        category_name = category.name
        category.delete()
        return JsonResponse({'success': True, 'message': f'Category "{category_name}" deleted successfully'})


@login_required
@require_http_methods(["GET", "POST", "DELETE"])
def api_sample_item_detail(request, item_id):
    """API endpoint to get, create, or delete a sample item"""
    from django.http import JsonResponse
    from django.contrib import messages
    from django.shortcuts import get_object_or_404
    import json
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if request.method == 'GET':
        # Get item detail
        item = get_object_or_404(SampleItem, id=item_id)
        data = {
            'id': item.id,
            'category_id': item.category.id,
            'title': item.title,
            'description': item.description,
            'image_url': item.image.url if item.image else None,
            'client_name': item.client_name,
            'project_date': item.project_date.isoformat() if item.project_date else None,
            'tags': item.tags,
            'link': item.link,
            'order': item.order,
            'is_active': item.is_active,
        }
        return JsonResponse(data)
    
    elif request.method == 'POST':
        # Update item
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        item = get_object_or_404(SampleItem, id=item_id)
        
        if 'category_id' in data:
            item.category = get_object_or_404(SampleCategory, id=data['category_id'])
        
        item.title = data.get('title', item.title)
        item.description = data.get('description', item.description)
        item.client_name = data.get('client_name', item.client_name or '')
        item.tags = data.get('tags', item.tags or '')
        item.link = data.get('link', item.link or '')
        item.order = data.get('order', item.order)
        item.is_active = data.get('is_active', item.is_active)
        
        if 'project_date' in data and data['project_date']:
            from datetime import datetime
            try:
                item.project_date = datetime.strptime(data['project_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Handle image upload from file
        if 'image' in request.FILES:
            item.image = request.FILES['image']
        # Handle base64 image data
        elif 'image_data' in data and data['image_data']:
            try:
                # Extract base64 data
                image_data = data['image_data']
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                # Decode base64
                image_bytes = base64.b64decode(image_data)
                
                # Create a unique filename
                filename = f"sample_{uuid.uuid4().hex}.jpg"
                
                # Delete old image if exists
                if item.image:
                    item.image.delete()
                
                # Save to ImageField
                item.image.save(filename, ContentFile(image_bytes))
            except Exception as e:
                return JsonResponse({'error': f'Failed to process image: {str(e)}'}, status=400)
        
        item.save()
        return JsonResponse({'success': True, 'message': 'Item updated successfully'})
    
    elif request.method == 'DELETE':
        # Delete item
        item = get_object_or_404(SampleItem, id=item_id)
        item_title = item.title
        item.delete()
        return JsonResponse({'success': True, 'message': f'Item "{item_title}" deleted successfully'})


@login_required
@require_http_methods(["POST"])
def api_sample_items_reorder(request):
    """API endpoint to reorder sample items"""
    from django.http import JsonResponse
    import json
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    items = data.get('items', [])
    if not items:
        return JsonResponse({'error': 'No items provided'}, status=400)
    
    try:
        for item_data in items:
            item_id = item_data.get('id')
            order = item_data.get('order', 0)
            
            if item_id:
                SampleItem.objects.filter(id=item_id).update(order=order)
        
        return JsonResponse({'success': True, 'message': 'Order updated successfully'})
    except Exception as e:
        return JsonResponse({'error': f'Failed to update order: {str(e)}'}, status=500)


from django.core.files.base import ContentFile
import base64
import uuid

@login_required
@require_http_methods(["POST"])
def api_sample_item_create(request):
    """API endpoint to create a new sample item"""
    from django.http import JsonResponse
    from django.shortcuts import get_object_or_404
    import json
    from datetime import datetime
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Validate required fields
    if not data.get('title'):
        return JsonResponse({'error': 'Title is required'}, status=400)
    
    if not data.get('category_id'):
        return JsonResponse({'error': 'Category is required'}, status=400)
    
    category = get_object_or_404(SampleCategory, id=data['category_id'])
    
    item = SampleItem(
        category=category,
        title=data['title'],
        description=data.get('description', ''),
        client_name=data.get('client_name', ''),
        tags=data.get('tags', ''),
        link=data.get('link', ''),
        order=data.get('order', 0),
        is_active=data.get('is_active', True),
    )
    
    if 'project_date' in data and data['project_date']:
        try:
            item.project_date = datetime.strptime(data['project_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Handle image upload from file
    if 'image' in request.FILES:
        item.image = request.FILES['image']
    # Handle base64 image data
    elif 'image_data' in data and data['image_data']:
        try:
            # Extract base64 data
            image_data = data['image_data']
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            
            # Create a unique filename
            filename = f"sample_{uuid.uuid4().hex}.jpg"
            
            # Save to ImageField
            item.image.save(filename, ContentFile(image_bytes))
        except Exception as e:
            return JsonResponse({'error': f'Failed to process image: {str(e)}'}, status=400)
    
    item.save()
    
    return JsonResponse({
        'success': True, 
        'message': 'Item created successfully',
        'item': {
            'id': item.id,
            'title': item.title,
            'category_id': item.category.id,
        }
    })


@login_required
@require_http_methods(["POST"])
def api_sample_category_create(request):
    """API endpoint to create a new sample category"""
    from django.http import JsonResponse
    from django.utils.text import slugify
    import json
    
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.user_role == 'admin')):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Validate required fields
    if not data.get('name'):
        return JsonResponse({'error': 'Name is required'}, status=400)
    
    # Generate slug
    slug = data.get('slug') or slugify(data['name'])
    
    # Check for duplicate slug
    if SampleCategory.objects.filter(slug=slug).exists():
        return JsonResponse({'error': 'A category with this slug already exists'}, status=400)
    
    category = SampleCategory(
        name=data['name'],
        slug=slug,
        description=data.get('description', ''),
        icon=data.get('icon', ''),
        order=data.get('order', 0),
        is_active=data.get('is_active', True),
    )
    
    category.save()
    
    return JsonResponse({
        'success': True, 
        'message': 'Category created successfully',
        'category': {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
        }
    })


@login_required
@require_http_methods(["POST"])
def api_upload_cover_photo(request):
    """API endpoint to upload cover photo via AJAX."""
    import json
    from django.core.files.uploadedfile import InMemoryUploadedFile
    
    try:
        data = json.loads(request.body)
        cover_cropped_image_data = data.get('cover_cropped_image_data')
        
        if not cover_cropped_image_data:
            return JsonResponse({'success': False, 'error': 'No cover photo data provided'}, status=400)
        
        # Get the presenta user
        user = request.user
        presenta_user = get_presenta_user_safe(user)
        
        # Process the base64 image data
        try:
            format_part, imgstr = cover_cropped_image_data.split(';base64,')
            image_data = base64.b64decode(imgstr)
            image = Image.open(BytesIO(image_data))
            # Keep original format and mode to preserve quality
            img_io = BytesIO()
            # Save as JPEG with high quality to balance quality and file size
            image.save(img_io, format='JPEG', quality=98)
            img_io.seek(0)
            
            filename = f"cover_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
            cropped_file = InMemoryUploadedFile(
                img_io, None, filename, 'image/jpeg', img_io.tell(), None
            )
            presenta_user.cover_photo = cropped_file
            presenta_user.save()
            
            return JsonResponse({'success': True, 'message': 'Cover photo uploaded successfully'})
        except Exception as e:
            print(f"Error processing cover image: {e}")
            return JsonResponse({'success': False, 'error': 'Error processing image'}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        print(f"Error uploading cover photo: {e}")
        return JsonResponse({'success': False, 'error': 'An error occurred'}, status=500)


@login_required
@require_http_methods(["POST"])
def api_clear_cover_photo(request):
    """API endpoint to clear cover photo via AJAX."""
    try:
        # Get the presenta user
        user = request.user
        presenta_user = get_presenta_user_safe(user)
        
        # Clear the cover photo
        if presenta_user.cover_photo:
            presenta_user.cover_photo.delete(save=True)
        presenta_user.cover_photo = None
        presenta_user.save()
        
        return JsonResponse({'success': True, 'message': 'Cover photo cleared successfully'})
    except Exception as e:
        print(f"Error clearing cover photo: {e}")
        return JsonResponse({'success': False, 'error': 'An error occurred'}, status=500)


@login_required
@require_http_methods(["GET"])
def api_chat_conversations(request):
    """API endpoint to get all chat conversations for the current user."""
    try:
        user = request.user
        
        # Get all conversations where the user is either sender or receiver
        from .models import ChatMessage
        from django.db.models import Q, Max, Subquery, OuterRef
        
        # Get unique conversations with the latest message
        conversations = ChatMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).values('sender', 'receiver').annotate(
            last_message_time=Max('created_at')
        ).order_by('-last_message_time')
        
        # Build conversation list with user details
        conversation_list = []
        seen_users = set()
        
        for conv in conversations:
            other_user_id = conv['receiver'] if conv['sender'] == user.id else conv['sender']
            
            if other_user_id in seen_users:
                continue
            seen_users.add(other_user_id)
            
            try:
                from django.contrib.auth.models import User
                other_user = User.objects.get(id=other_user_id)
                
                # Get the latest message
                latest_message = ChatMessage.objects.filter(
                    (Q(sender=user) & Q(receiver=other_user)) |
                    (Q(sender=other_user) & Q(receiver=user))
                ).order_by('-created_at').first()
                
                # Get unread count
                unread_count = ChatMessage.objects.filter(
                    sender=other_user,
                    receiver=user,
                    is_read=False
                ).count()
                
                conversation_list.append({
                    'user': {
                        'id': other_user.id,
                        'username': other_user.username,
                        'first_name': other_user.first_name,
                        'last_name': other_user.last_name,
                    },
                    'last_message': latest_message.message if latest_message else '',
                    'last_message_time': latest_message.created_at.isoformat() if latest_message else '',
                    'unread_count': unread_count,
                })
            except User.DoesNotExist:
                continue
        
        return JsonResponse({'conversations': conversation_list})
    except Exception as e:
        print(f"Error getting chat conversations: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)


@login_required
@require_http_methods(["GET"])
def api_chat_messages(request, user_id):
    """API endpoint to get chat messages with a specific user."""
    try:
        from django.contrib.auth.models import User
        from .models import ChatMessage
        
        current_user = request.user
        
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # Get messages between the two users
        messages = ChatMessage.objects.filter(
            (Q(sender=current_user) & Q(receiver=other_user)) |
            (Q(sender=other_user) & Q(receiver=current_user))
        ).order_by('created_at')
        
        # Mark messages as read
        ChatMessage.objects.filter(
            sender=other_user,
            receiver=current_user,
            is_read=False
        ).update(is_read=True)
        
        # Serialize messages
        message_list = []
        for msg in messages:
            message_list.append({
                'id': msg.id,
                'sender_id': msg.sender.id,
                'sender_username': msg.sender.username,
                'message': msg.message,
                'is_read': msg.is_read,
                'created_at': msg.created_at.isoformat(),
            })
        
        return JsonResponse({
            'messages': message_list,
            'user': {
                'id': other_user.id,
                'username': other_user.username,
                'first_name': other_user.first_name,
                'last_name': other_user.last_name,
            }
        })
    except Exception as e:
        print(f"Error getting chat messages: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)


@login_required
@require_http_methods(["POST"])
def api_chat_send(request, user_id):
    """API endpoint to send a chat message to a specific user."""
    try:
        from django.contrib.auth.models import User
        from .models import ChatMessage
        import json
        
        current_user = request.user
        
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # Parse request body
        try:
            data = json.loads(request.body)
            message_text = data.get('message', '').strip()
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        if not message_text:
            return JsonResponse({'error': 'Message cannot be empty'}, status=400)
        
        # Create the message
        message = ChatMessage.objects.create(
            sender=current_user,
            receiver=other_user,
            message=message_text
        )
        
        return JsonResponse({
            'success': True,
            'message': {
                'id': message.id,
                'sender_id': message.sender.id,
                'sender_username': message.sender.username,
                'message': message.message,
                'is_read': message.is_read,
                'created_at': message.created_at.isoformat(),
            }
        })
    except Exception as e:
        print(f"Error sending chat message: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)


@login_required
@require_http_methods(["GET"])
def api_chat_unread_count(request):
    """API endpoint to get the total unread message count for the current user."""
    try:
        from .models import ChatMessage
        
        unread_count = ChatMessage.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        
        return JsonResponse({'unread_count': unread_count})
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)
