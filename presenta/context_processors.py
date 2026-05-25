from django.conf import settings

def user_profile(request):
    """Provide profile picture URL and display name for authenticated users.

    Tries to find a `presenta.User` by email and expose `profile_picture_url` and
    `display_name` to templates. Returns an empty dict for anonymous users.
    """
    if not request.user.is_authenticated:
        return {}

    display_name = getattr(request.user, 'get_full_name', None)
    try:
        display_name = request.user.get_full_name() or request.user.username
    except Exception:
        display_name = getattr(request.user, 'username', '')

    profile_picture_url = None
    try:
        from .models import User as PresentaUser
        
        # Primary: check presenta.User model for profile picture
        p = PresentaUser.objects.filter(email=getattr(request.user, 'email', '')).first() or PresentaUser.objects.filter(username=getattr(request.user, 'username', '')).first()
        if p and getattr(p, 'profile_picture', None):
            try:
                profile_picture_url = p.profile_picture.url
            except Exception:
                profile_picture_url = None
        
        # Fallback: check legacy Profile model if needed
        if not profile_picture_url:
            try:
                from .models import Profile
                profile = getattr(request.user, 'profile', None)
                if not profile:
                    # try to find Profile by email if not attached
                    profile = Profile.objects.filter(user__email=getattr(request.user, 'email', '')).first()
                if profile and getattr(profile, 'profile_picture', None):
                    try:
                        profile_picture_url = profile.profile_picture.url
                    except Exception:
                        profile_picture_url = None
            except Exception:
                pass
    except Exception:
        profile_picture_url = None

    return {
        'profile_picture_url': profile_picture_url,
        'display_name': display_name,
    }


def announcement_banner(request):
    """Provide announcement banner data to all templates.
    
    Retrieves the announcement settings from any UserSettings instance that has
    announcement text set (typically admin's settings) and exposes
    the banner content, visibility, type, and colors to templates.
    """
    from .models import UserSettings
    
    try:
        # Get any UserSettings with announcement text
        user_settings = UserSettings.objects.filter(
            announcement_banner__isnull=False
        ).exclude(
            announcement_banner=''
        ).first()
        
        if user_settings and user_settings.announcement_banner:
            # Get banner type (default to 'info')
            banner_type = 'info'
            try:
                if hasattr(user_settings, 'announcement_banner_type'):
                    banner_type = user_settings.announcement_banner_type or 'info'
            except:
                pass
            
            # Get custom background color or use default based on type
            bg_color = ''
            try:
                if hasattr(user_settings, 'announcement_banner_bg_color'):
                    bg_color = user_settings.announcement_banner_bg_color or ''
            except:
                pass
            
            if not bg_color:
                type_colors = {
                    'info': '#3498db',      # Blue
                    'warning': '#e67e22',   # Orange
                    'success': '#27ae60',   # Green
                    'error': '#e74c3c',     # Red
                }
                bg_color = type_colors.get(banner_type, '#3498db')
            
            # Get text color
            text_color = '#ffffff'
            try:
                if hasattr(user_settings, 'announcement_banner_text_color'):
                    text_color = user_settings.announcement_banner_text_color or '#ffffff'
            except:
                pass
            
            # Check visibility - respect the actual checkbox setting
            is_visible = False
            try:
                if hasattr(user_settings, 'announcement_banner_visible'):
                    is_visible = user_settings.announcement_banner_visible
            except:
                pass
            
            if not is_visible:
                return {'announcement_banner': None}
            
            return {
                'announcement_banner': {
                    'message': user_settings.announcement_banner,
                    'visible': is_visible,
                    'type': banner_type,
                    'bg_color': bg_color,
                    'text_color': text_color,
                }
            }
    except Exception as e:
        import sys
        print(f"Announcement banner error: {e}", file=sys.stderr)
    
    return {'announcement_banner': None}


def user_notifications(request):
    """Provide recent notifications/activities for authenticated users.
    
    Returns a list of recent activities relevant to the current user.
    For users: shows designer assignments, status updates, completions
    For designers: shows new requests and assignments
    """
    if not request.user.is_authenticated:
        return {'notifications': []}
    
    try:
        from .models import Activity, User as PresentaUser
        
        # Get the presenta user object
        presenta_user = PresentaUser.objects.filter(
            email=getattr(request.user, 'email', '')
        ).first() or PresentaUser.objects.filter(
            username=getattr(request.user, 'username', '')
        ).first()
        
        if not presenta_user:
            return {'notifications': []}
        
        # Get user role
        user_role = getattr(presenta_user, 'user_role', 'user')
        
        # Get recent activities (last 10)
        # Use auth_user for Activity queries since Activity.user expects Django auth User
        auth_user = getattr(presenta_user, 'auth_user', None)
        
        if not auth_user:
            return {'notifications': []}
        
        if user_role == 'designer':
            # For designers: show new requests and assignments
            # Include activities where designer is the user OR new request submissions
            from django.db.models import Q
            
            activities = Activity.objects.filter(
                Q(user=auth_user, activity_type__in=['assigned', 'revision_requested']) |
                Q(activity_type='request_submitted'),  # New requests available for designers
                is_cleared=False
            ).order_by('-created_at')[:10]
        else:
            # For users: show designer assignments, status changes, completions, rejections
            activities = Activity.objects.filter(
                user=auth_user,
                activity_type__in=['designer_assigned', 'status_changed', 'completed', 'payment_received', 'payment_confirmed', 'request_rejected'],
                is_cleared=False
            ).order_by('-created_at')[:10]
        
        # Format notifications
        notifications = []
        for activity in activities:
            notification = {
                'id': activity.id,
                'message': activity.message,
                'type': activity.activity_type,
                'created_at': activity.created_at,
                'time_ago': _get_time_ago(activity.created_at),
            }
            notifications.append(notification)
        
        return {'notifications': notifications}
    except Exception as e:
        import sys
        print(f"User notifications error: {e}", file=sys.stderr)
        return {'notifications': []}


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


def user_currency(request):
    """Provide the authenticated user's currency preference (or USD default)."""
    if not getattr(request, 'user', None) or not request.user.is_authenticated:
        return {'user_currency': 'USD'}
    try:
        settings = getattr(request.user, 'user_settings', None)
        if settings is None:
            # Force load or create fallback
            from .models import UserSettings
            settings = UserSettings.objects.filter(user=request.user).first()
        pref = getattr(settings, 'currency_preference', None) if settings else None
        return {'user_currency': pref or 'USD'}
    except Exception:
        return {'user_currency': 'USD'}
