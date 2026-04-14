from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from presenta.models import User as PresentaUser, Profile

class Command(BaseCommand):
    help = 'Ensure all Django users have corresponding PresentaUser and Profile instances. Fixes superusers missing profiles.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be created without making changes')
        parser.add_argument('--superuser-only', action='store_true', help='Only process superusers')

    def handle(self, *args, **options):
        User = get_user_model()
        
        if options['superuser_only']:
            users = User.objects.filter(is_superuser=True)
            self.stdout.write(self.style.WARNING(f'Processing only {users.count()} superuser(s)'))
        else:
            users = User.objects.all()
            self.stdout.write(self.style.WARNING(f'Processing {users.count()} total user(s)'))
        
        created_presenta = 0
        created_profiles = 0
        already_complete = 0
        
        with transaction.atomic():
            for django_user in users:
                # Test if PresentaUser exists safely
                has_presenta = hasattr(django_user, 'presenta_user') and django_user.presenta_user is not None
                
                # Test if Profile exists safely
                has_profile = hasattr(django_user, 'profile') and django_user.profile is not None
                
                if has_presenta and has_profile:
                    already_complete += 1
                    continue
                
                if options['dry_run']:
                    self.stdout.write(f"  Would fix: {django_user.username} (email: {django_user.email}) - missing: {'PresentaUser' if not has_presenta else ''} {'Profile' if not has_profile else ''}")
                    continue
                
                # Actually create manually (since get_presenta_user_safe is view function)
                if not has_presenta:
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
                    created_presenta += 1
                    self.stdout.write(f"  Created PresentaUser(id={presenta_user.id}) for {django_user.username}")
                
                if not has_profile:
                    profile = Profile.objects.create(user=django_user)
                    if has_presenta:
                        profile.presenta_user = django_user.presenta_user
                        profile.save()
                    created_profiles += 1
                    self.stdout.write(f"  Created Profile for {django_user.username}")
        
        self.stdout.write(self.style.SUCCESS(
            f'Completed:\n'
            f'  Already complete: {already_complete}\n'
            f'  PresentaUser created: {created_presenta}\n'
            f'  Profiles created: {created_profiles}'
        ))

