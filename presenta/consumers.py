import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat between users and designers."""
    
    async def connect(self):
        self.user = self.scope['user']
        
        # Check if user is authenticated
        if not self.user.is_authenticated:
            await self.close(code=403)
            return
        
        # Get the other user ID from URL
        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        
        # Verify other user exists
        try:
            self.other_user = await self.get_other_user()
        except:
            await self.close(code=404)
            return
        
        # Check if user is blocked
        is_blocked = await self.is_user_blocked()
        if is_blocked:
            await self.close(code=403)
            return
        
        # Create a unique room name for this conversation
        # Sort user IDs to ensure same room name regardless of who connects
        user_ids = sorted([str(self.user.id), str(self.other_user_id)])
        self.room_group_name = f'chat_{user_ids[0]}_{user_ids[1]}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Mark messages as read when user connects
        if self.other_user_id:
            await self.mark_messages_as_read()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            return
        
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'typing':
            # Send typing indicator to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_typing': text_data_json.get('is_typing', False)
                }
            )
    
    async def chat_message(self, event):
        """Send message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'id': event['id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['created_at'],
            'attachment': event.get('attachment'),
            'attachment_type': event.get('attachment_type'),
            'attachment_name': event.get('attachment_name')
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket."""
        # Don't send typing indicator to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))
    
    @database_sync_to_async
    def get_other_user(self):
        from django.contrib.auth.models import User
        return User.objects.get(id=self.other_user_id)
    
    @database_sync_to_async
    def is_user_blocked(self):
        from .models import Block
        return Block.objects.filter(
            blocker_id=self.other_user_id,
            blocked_user=self.user
        ).exists()
    
    @database_sync_to_async
    def mark_messages_as_read(self):
        """Mark all messages from other user as read."""
        from .models import ChatMessage, User
        
        try:
            other_user = User.objects.get(id=self.other_user_id)
            ChatMessage.mark_as_read(self.user, other_user)
        except User.DoesNotExist:
            pass
