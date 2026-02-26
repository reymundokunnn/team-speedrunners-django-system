from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

from .models import User as PresentaUser


class PresentaBackend(BaseBackend):
    # authenticate using Django User or map to custom PresentaUser."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        DjangoUser = get_user_model()
        
        # first, try the standard Django user lookup. dito muna.
        try:
            auth_user = DjangoUser.objects.filter(username=username).first()
            if auth_user and auth_user.check_password(password):
                return auth_user
        except Exception:
            pass
        
        # Try by email
        try:
            auth_user = DjangoUser.objects.filter(email=username).first()
            if auth_user and auth_user.check_password(password):
                return auth_user
        except Exception:
            pass

        # fallback lang 'to: try to find a PresentaUser by email or username
        try:
            p_user = PresentaUser.objects.filter(email=username).first() or PresentaUser.objects.filter(username=username).first()
            if p_user and p_user.check_password(password):
                # if linked to Django user, return it
                if p_user.auth_user:
                    return p_user.auth_user
                
                # Otherwise create/get Django user for session
                username_val = p_user.username or p_user.email or f'user{p_user.pk}'
                auth_user, created = DjangoUser.objects.get_or_create(
                    username=username_val,
                    defaults={'email': p_user.email or ''}
                )
                
                # Update Django user info from PresentaUser
                if p_user.first_name:
                    auth_user.first_name = p_user.first_name
                if p_user.last_name:
                    auth_user.last_name = p_user.last_name
                auth_user.save()
                
                # Link them
                p_user.auth_user = auth_user
                p_user.save()
                
                # Create Profile if it doesn't exist
                from .models import Profile
                profile, _ = Profile.objects.get_or_create(user=auth_user)
                profile.presenta_user = p_user
                profile.save()
                
                return auth_user
        except Exception as e:
            pass

        return None

    def get_user(self, user_id):
        DjangoUser = get_user_model()
        try:
            return DjangoUser.objects.get(pk=user_id)
        except DjangoUser.DoesNotExist:
            return None
