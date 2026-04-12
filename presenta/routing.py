from django.urls import re_path
from . import consumers
from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<user_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
