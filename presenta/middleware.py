from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware to update user's last activity timestamp on authenticated requests.
    This helps track when users were last active for online status management.
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                # Update the presenta user's updated_at field
                presenta_user = request.user.presenta_user
                presenta_user.updated_at = timezone.now()
                presenta_user.save(update_fields=['updated_at'])
            except AttributeError:
                # User might not have presenta_user profile yet
                pass
        return None