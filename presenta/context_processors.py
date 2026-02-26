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
