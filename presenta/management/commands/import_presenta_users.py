from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from presenta.models import User as PresentaUser, Profile


class Command(BaseCommand):
    help = 'Import users from presenta.User into django.contrib.auth User and create Profile.'

    def add_arguments(self, parser):
        parser.add_argument('--plaintext', action='store_true', help='Treat presenta.password as plaintext when setting password')

    def handle(self, *args, **options):
        User = get_user_model()
        plaintext = options['plaintext']
        created = 0
        updated = 0
        with transaction.atomic():
            for p in PresentaUser.objects.all():
                # derive a username
                username = (p.email or f'user{p.pk}').split('@')[0]
                if not username:
                    username = f'user{p.pk}'

                auth_user, created_flag = User.objects.get_or_create(email=p.email, defaults={'username': username})
                if created_flag:
                    created += 1
                else:
                    updated += 1

                # Set password (assume plaintext if --plaintext passed)
                if plaintext and p.password:
                    auth_user.set_password(p.password)
                    auth_user.save()

                # populate first/last name on auth user
                try:
                    if getattr(p, 'first_name', None):
                        auth_user.first_name = p.first_name
                    if getattr(p, 'last_name', None):
                        auth_user.last_name = p.last_name
                    auth_user.save()
                except Exception:
                    pass

                # create or update profile
                profile, _ = Profile.objects.get_or_create(user=auth_user)
                profile.account_type = getattr(p, 'account_type', '')
                if getattr(p, 'profile_picture', None):
                    profile.profile_picture = p.profile_picture
                profile.presenta_id = p.id
                profile.save()

        self.stdout.write(self.style.SUCCESS(f'Imported: {created}, updated: {updated}'))
