from django import template
from django.utils.timesince import timesince

register = template.Library()

@register.filter
def get_finished_files(files):
    """Filter to get finished files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'finished']

@register.filter
def get_reference_files(files):
    """Filter to get reference files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'reference']

@register.filter
def friendly_timesince(value):
    """
    Converts a timesince string to a friendly format.
    Replaces '0 minutes' with 'Just now'.
    Returns the complete string with 'ago' suffix (except for 'Just now').
    """
    time_str = timesince(value).strip()
    # Replace non-breaking spaces with regular spaces
    time_str = time_str.replace('\xa0', ' ')
    
    # Check for "0 minutes" specifically (exact match)
    if time_str == '0 minutes':
        return 'Just now'
    
    return time_str + ' ago'
