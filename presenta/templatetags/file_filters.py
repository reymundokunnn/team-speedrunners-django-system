from django import template

register = template.Library()

@register.filter
def get_finished_files(files):
    """Filter to get finished files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'finished']

@register.filter
def get_reference_files(files):
    """Filter to get reference files from a queryset."""
    return [f for f in files if hasattr(f, 'file_type') and f.file_type == 'reference']
