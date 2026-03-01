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
            # Authentication failed
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
    # Include: user's own activities + activities on their design requests (from designers/admins)
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
    # Include: designer's own activities + activities on their assigned projects
    from django.db.models import Q
    
    designer_request_ids = DesignRequest.objects.filter(designer=user).values_list('id', flat=True)
    
    activities = Activity.objects.filter(
        Q(user=user) |  # Designer's own activities
        Q(related_request_id__in=designer_request_ids),  # Activities on designer's assigned projects
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


@login_required(login_url='signin')
@require_http_methods(["POST"])
def request_design(request):
    # create a new design request (Clients)
    user = request.user
    
    title = request.POST.get('title')
    design_type = request.POST.get('design_type')
    description = request.POST.get('description')
    budget = request.POST.get('budget')
    deadline = request.POST.get('deadline')
    
    if title and design_type and description:
        design_request = DesignRequest.objects.create(
            requester=user,
            title=title,
            design_type=design_type,
            description=description,
            budget=budget if budget else None,
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
            message=f"You were assigned to '{design_request.title}'.",
            related_request=design_request
        )
        
        # Log activity for requester
        if design_request.requester:
            designer_name = f"{user.first_name} {user.last_name}".strip() or user.username
            log_activity(
                user=design_request.requester,
                activity_type='assigned',
                message=f"Designer {designer_name} assigned to '{design_request.title}'.",
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
                    message=f"'{design_request.title}' is now {status_display}.",
                    related_request=design_request
                )
    
    return redirect('designer_dashboard')


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
        deadline = request.POST.get('deadline')
        
        if title and design_type and description:
            design_request.title = title
            design_request.design_type = design_type
            design_request.description = description
            design_request.budget = budget if budget else None
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
@require_http_methods(["GET", "POST"])
def edit_profile(request):
    # edit user profile with image cropping support.
    user = request.user
    
    # get the Presenta User profile
    try:
        presenta_user = user.presenta_user
    except User.DoesNotExist:
        return redirect('index')
    
    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=presenta_user)
        
        if form.is_valid():
            # save the form but don't commit yet
            profile = form.save(commit=False)
            
            # handle profile picture cropping
            cropped_image_data = request.POST.get('cropped_image_data')
            remove_picture = request.POST.get('cropped_image_data') == 'remove'
            
            if remove_picture:
                # remove the profile picture
                if profile.profile_picture:
                    profile.profile_picture.delete(save=True)
                profile.profile_picture = None
            elif cropped_image_data and not cropped_image_data.startswith('remove'):
                # decode base64 image data
                format_part, imgstr = cropped_image_data.split(';base64,')
                image_data = base64.b64decode(imgstr)
                
                # open image with PIL
                image = Image.open(BytesIO(image_data))
                
                # convert to RGB if necessary
                if image.mode in ('RGBA', 'P'):
                    image = image.convert('RGB')
                
                # save to BytesIO
                img_io = BytesIO()
                image.save(img_io, format='JPEG', quality=85)
                img_io.seek(0)
                
                # generate filename
                from django.utils import timezone
                import uuid
                filename = f"profile_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                
                # save to media directory
                from django.core.files.uploadedfile import InMemoryUploadedFile
                cropped_file = InMemoryUploadedFile(
                    img_io,
                    None,
                    filename,
                    'image/jpeg',
                    img_io.tell(),
                    None
                )
                profile.profile_picture = cropped_file
            
            profile.save()
            
            # Log profile update activity
            log_activity(
                user=user,
                activity_type='profile_updated',
                message="Profile information updated."
            )
            
            # also update Django user email if changed
            if form.cleaned_data.get('email'):
                user.email = form.cleaned_data.get('email')
                user.save()
            
            # also update Django user first_name and last_name for immediate top bar reflection
            if form.cleaned_data.get('first_name'):
                user.first_name = form.cleaned_data.get('first_name')
            if form.cleaned_data.get('last_name'):
                user.last_name = form.cleaned_data.get('last_name')
            if form.cleaned_data.get('first_name') or form.cleaned_data.get('last_name'):
                user.save()
            
            # redirect based on user role
            try:
                profile_obj = user.profile
                if profile_obj.user_role == 'designer':
                    return redirect('designer_dashboard')
                elif profile_obj.user_role == 'admin':
                    return redirect('admin_dashboard')
                else:
                    return redirect('user_dashboard')
            except Profile.DoesNotExist:
                return redirect('index')
    else:
        form = EditProfileForm(instance=presenta_user)
    
    context = {
        'form': form,
        'presenta_user': presenta_user,
    }
    return render(request, 'edit_profile.html', context)


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
            'initials': (designer.first_name[0] if designer.first_name else '') + (designer.last_name[0] if designer.last_name else '') or designer.username[0].upper()
        }
    
    return JsonResponse({
        'title': design_request.title,
        'completed_at': design_request.completed_at.strftime('%Y-%m-%d %H:%M') if design_request.completed_at else '',
        'files': files_data,
        'designer': designer_data
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
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            user_role=user_role,
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
        
        return JsonResponse({'success': True, 'message': 'User created successfully', 'user_id': user.id})
    
    # Return empty data for GET request (modal will show empty form)
    return JsonResponse({})


@login_required(login_url='signin')
def view_user(request, user_id):
    """API endpoint to get user details as JSON."""
    from django.http import JsonResponse
    
    # Check if user is admin
    is_admin = request.user.is_superuser
    if not is_admin:
        try:
            profile = request.user.profile
            is_admin = profile.user_role == 'admin'
        except (Profile.DoesNotExist, AttributeError):
            pass
    
    if not is_admin:
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
        'joined_date': user.joined_date.strftime('%Y-%m-%d') if user.joined_date else '',
        'design_requests_count': design_requests_count,
        'profile_picture': user.profile_picture.url if user.profile_picture else None,
    })


@login_required(login_url='signin')
@require_http_methods(["GET", "POST"])
def edit_user(request, user_id):
    """Edit user by admin."""
    from django.http import JsonResponse
    
    # Check if user is admin
    is_admin = request.user.is_superuser
    if not is_admin:
        try:
            profile = request.user.profile
            is_admin = profile.user_role == 'admin'
        except (Profile.DoesNotExist, AttributeError):
            pass
    
    if not is_admin:
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
    
    # Check if user is admin
    is_admin = request.user.is_superuser
    if not is_admin:
        try:
            profile = request.user.profile
            is_admin = profile.user_role == 'admin'
        except (Profile.DoesNotExist, AttributeError):
            pass
    
    if not is_admin:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Access denied'}, status=403)
        return redirect('admin_dashboard')
    
    user = get_object_or_404(User, id=user_id)
    
    # Prevent admin from deleting themselves
    if user.auth_user == request.user:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'You cannot delete your own account'}, status=400)
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
def clear_activities(request):
    """Clear all activities for the current user."""
    user = request.user
    
    # Mark all user's activities as cleared
    Activity.objects.filter(user=user, is_cleared=False).update(is_cleared=True)
    
    # Redirect back to the referring page or dashboard
    referer = request.META.get('HTTP_REFERER')
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
    from .forms import UserSettingsForm, DesignerSettingsForm, AdminSettingsForm, EditProfileForm
    from django.contrib import messages
    
    user = request.user
    presenta_user = user.presenta_user
    
    # Get or create user settings
    user_settings, created = UserSettings.objects.get_or_create(user=user)
    
    # Initialize all forms
    account_form = UserSettingsForm()
    profile_form = EditProfileForm(instance=presenta_user)
    designer_form = None
    admin_form = None
    
    # Designer forms
    if user.profile.user_role == 'designer':
        designer_form = DesignerSettingsForm(initial={
            'designer_availability': user_settings.designer_availability,
            'designer_rate': user_settings.designer_rate,
            'designer_specializations': user_settings.designer_specializations,
            'accept_project_requests': user_settings.accept_project_requests,
            'portfolio_url': user_settings.portfolio_url,
            'max_concurrent_projects': user_settings.max_concurrent_projects,
            'revision_limit': user_settings.revision_limit,
            'minimum_project_budget': user_settings.minimum_project_budget,
        })
    
    # Admin forms
    if user.is_superuser or user.profile.user_role == 'admin':
        admin_form = AdminSettingsForm(initial={
            'maintenance_mode': user_settings.maintenance_mode,
            'site_name': 'Presenta',
            'site_description': 'Professional Design Services Platform',
            'support_email': 'support@presenta.com',
        })
    
    # Handle POST requests for different sections
    if request.method == 'POST':
        # Check which form was submitted
        if 'designer_availability' in request.POST and designer_form:
            # Designer settings form
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
        elif 'maintenance_mode' in request.POST and admin_form:
            # Admin settings form
            admin_form = AdminSettingsForm(request.POST)
            if admin_form.is_valid():
                user_settings.maintenance_mode = admin_form.cleaned_data.get('maintenance_mode', False)
                user_settings.save()
                messages.success(request, 'Admin settings updated successfully.')
        else:
            # Account settings form
            account_form = UserSettingsForm(request.POST)
            if account_form.is_valid():
                user_settings.theme_preference = account_form.cleaned_data.get('theme_preference', user_settings.theme_preference)
                user_settings.timezone = account_form.cleaned_data.get('timezone', user_settings.timezone)
                user_settings.language = account_form.cleaned_data.get('language', user_settings.language)
                user_settings.currency_preference = account_form.cleaned_data.get('currency_preference', user_settings.currency_preference)
                user_settings.email_notifications_enabled = account_form.cleaned_data.get('email_notifications_enabled', False)
                user_settings.order_updates_email = account_form.cleaned_data.get('order_updates_email', False)
                user_settings.marketing_emails = account_form.cleaned_data.get('marketing_emails', False)
                user_settings.notification_frequency = account_form.cleaned_data.get('notification_frequency', user_settings.notification_frequency)
                user_settings.profile_visibility = account_form.cleaned_data.get('profile_visibility', user_settings.profile_visibility)
                user_settings.show_online_status = account_form.cleaned_data.get('show_online_status', False)
                user_settings.save()
                messages.success(request, 'Settings updated successfully.')
        
        return redirect('unified_settings')
    
    # Populate account form with current settings
    account_form = UserSettingsForm(initial={
        'theme_preference': user_settings.theme_preference,
        'timezone': user_settings.timezone,
        'language': user_settings.language,
        'currency_preference': user_settings.currency_preference,
        'email_notifications_enabled': user_settings.email_notifications_enabled,
        'order_updates_email': user_settings.order_updates_email,
        'marketing_emails': user_settings.marketing_emails,
        'notification_frequency': user_settings.notification_frequency,
        'profile_visibility': user_settings.profile_visibility,
        'show_online_status': user_settings.show_online_status,
    })
    
    context = {
        'form': account_form,
        'profile_form': profile_form,
        'designer_form': designer_form,
        'admin_form': admin_form,
        'presenta_user': presenta_user,
        'settings_section': 'unified',
        'display_name': f"{presenta_user.first_name} {presenta_user.last_name}".strip() or presenta_user.username,
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
    presenta_user = user.presenta_user
    
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
            user_settings.theme_preference = form.cleaned_data.get('theme_preference', user_settings.theme_preference)
            user_settings.timezone = form.cleaned_data.get('timezone', user_settings.timezone)
            user_settings.language = form.cleaned_data.get('language', user_settings.language)
            user_settings.currency_preference = form.cleaned_data.get('currency_preference', user_settings.currency_preference)
            user_settings.email_notifications_enabled = form.cleaned_data.get('email_notifications_enabled', False)
            user_settings.order_updates_email = form.cleaned_data.get('order_updates_email', False)
            user_settings.marketing_emails = form.cleaned_data.get('marketing_emails', False)
            user_settings.notification_frequency = form.cleaned_data.get('notification_frequency', user_settings.notification_frequency)
            user_settings.profile_visibility = form.cleaned_data.get('profile_visibility', user_settings.profile_visibility)
            user_settings.show_online_status = form.cleaned_data.get('show_online_status', False)
            user_settings.save()
            
            messages.success(request, 'Settings updated successfully.')
            return redirect('account_settings')
    else:
        # Populate form with current settings
        initial_data = {
            'theme_preference': user_settings.theme_preference,
            'timezone': user_settings.timezone,
            'language': user_settings.language,
            'currency_preference': user_settings.currency_preference,
            'email_notifications_enabled': user_settings.email_notifications_enabled,
            'order_updates_email': user_settings.order_updates_email,
            'marketing_emails': user_settings.marketing_emails,
            'notification_frequency': user_settings.notification_frequency,
            'profile_visibility': user_settings.profile_visibility,
            'show_online_status': user_settings.show_online_status,
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
    presenta_user = user.presenta_user
    
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
    presenta_user = user.presenta_user
    
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
    """Edit profile settings page with compact layout."""
    from .forms import EditProfileForm
    from django.contrib import messages
    
    user = request.user
    
    # Get the Presenta User profile
    try:
        presenta_user = user.presenta_user
    except User.DoesNotExist:
        return redirect('index')
    
    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=presenta_user)
        
        if form.is_valid():
            # save the form but don't commit yet
            profile = form.save(commit=False)
            
            # handle profile picture cropping
            cropped_image_data = request.POST.get('cropped_image_data')
            remove_picture = request.POST.get('cropped_image_data') == 'remove'
            
            if remove_picture:
                # remove the profile picture
                if profile.profile_picture:
                    profile.profile_picture.delete(save=True)
                profile.profile_picture = None
            elif cropped_image_data and not cropped_image_data.startswith('remove'):
                # decode base64 image data
                try:
                    format_part, imgstr = cropped_image_data.split(';base64,')
                    image_data = base64.b64decode(imgstr)
                    
                    # open image with PIL
                    image = Image.open(BytesIO(image_data))
                    
                    # convert to RGB if necessary
                    if image.mode in ('RGBA', 'P'):
                        image = image.convert('RGB')
                    
                    # save to BytesIO
                    img_io = BytesIO()
                    image.save(img_io, format='JPEG', quality=85)
                    img_io.seek(0)
                    
                    # generate filename
                    import uuid
                    filename = f"profile_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                    
                    # save to media directory
                    from django.core.files.uploadedfile import InMemoryUploadedFile
                    cropped_file = InMemoryUploadedFile(
                        img_io,
                        None,
                        filename,
                        'image/jpeg',
                        img_io.tell(),
                        None
                    )
                    profile.profile_picture = cropped_file
                except Exception as e:
                    print(f"Error processing image: {e}")
            
            profile.save()
            
            # Log profile update activity
            log_activity(
                user=user,
                activity_type='profile_updated',
                message="Profile information updated."
            )
            
            # also update Django user email if changed
            if form.cleaned_data.get('email'):
                user.email = form.cleaned_data.get('email')
                user.save()
            
            # also update Django user first_name and last_name for immediate top bar reflection
            if form.cleaned_data.get('first_name'):
                user.first_name = form.cleaned_data.get('first_name')
            if form.cleaned_data.get('last_name'):
                user.last_name = form.cleaned_data.get('last_name')
            if form.cleaned_data.get('first_name') or form.cleaned_data.get('last_name'):
                user.save()
            
            messages.success(request, 'Profile updated successfully.')
            return redirect('edit_profile_settings')
    else:
        form = EditProfileForm(instance=presenta_user)
    
    context = {
        'form': form,
        'presenta_user': presenta_user,
    }
    return render(request, 'settings/edit_profile_settings.html', context)
