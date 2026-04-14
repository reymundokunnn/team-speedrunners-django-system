from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from presenta.models import User as PresentaUser

class Command(BaseCommand):
    help = 'Set inactive users to offline status based on last activity'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without making changes')
        parser.add_argument('--hours', type=int, default=24, help='Hours of inactivity before setting offline (default: 24)')

    def handle(self, *args, **options):
        hours = options['hours']
        cutoff_time = timezone.now() - timedelta(hours=hours)

        # Get users who are not already offline and have been updated before the cutoff
        active_users = PresentaUser.objects.exclude(online_status='offline').filter(updated_at__lt=cutoff_time)

        self.stdout.write(f'Found {active_users.count()} users who have been inactive for {hours} hours')

        if options['dry_run']:
            for user in active_users:
                self.stdout.write(f"  Would set offline: {user.username or user.email} (last updated: {user.updated_at})")
        else:
            updated = active_users.update(online_status='offline')
            self.stdout.write(self.style.SUCCESS(f'Set {updated} users to offline status'))

        self.stdout.write('Done.')