"""
WSGI config for main_site project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
from django.core.management import execute_from_command_line

# Global flag to track if migration has been run in this container instance
_has_migrated = False

def migrate_if_needed():
    """Run database migrations on first request per container instance."""
    global _has_migrated
    if not _has_migrated:
        try:
            # Run migrations without input prompts
            execute_from_command_line(['manage.py', 'migrate', '--noinput'])
            _has_migrated = True
            print("Database migrations completed successfully")
        except Exception as e:
            # Log the error but don't break the application
            print(f"Migration error: {e}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main_site.settings')

# Get the WSGI application
application = get_wsgi_application()

# Wrap the application to run migrations on first request
def wsgi_application(environ, start_response):
    migrate_if_needed()
    return application(environ, start_response)

app = wsgi_application
application = application  # Keep for Vercel compatibility