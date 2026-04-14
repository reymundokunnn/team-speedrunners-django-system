from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag(takes_context=True)
def get_user_role_safe(context):
    """
    Safely get user role from profile, default to 'user'.
    Uses get_presenta_user_safe if available.
    """
    user = context.get('request', {}).user
    if not user or not user.is_authenticated:
        return 'user'
    
    try:
        profile = user.profile
        return profile.presenta_user.user_role if profile.presenta_user else 'user'
    except:
        try:
            # Try presenta_user directly
            return user.presenta_user.user_role
        except:
            return 'user'

@register.simple_tag(takes_context=True)
def is_designer_safe(context):
    role = get_user_role_safe(context)
    return role == 'designer'

@register.simple_tag(takes_context=True)
def is_admin_safe(context):
    user = context.get('request', {}).user
    role = get_user_role_safe(context)
    return user.is_superuser or role == 'admin'

