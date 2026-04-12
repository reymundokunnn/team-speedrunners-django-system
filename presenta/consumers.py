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
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'message':
            message_data = {
                'message': text_data_json.get('message', ''),
                'attachment': text_data_json.get('attachment'),
                'attachment_type': text_data_json.get('attachment_type', '')
            }
            
            # Save message to database
            saved_message = await self.save_message(message_data)
            
            if saved_message:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        **saved_message
                    }
                )
        
        elif message_type == 'typing':
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
    def save_message(self, data):
        """Save message to database."""
        from .models import ChatMessage
        from django.contrib.auth.models import User
        
        try:
            receiver = User.objects.get(id=self.other_user_id)
            
            chat_message = ChatMessage.objects.create(
                sender=self.user,
                receiver=receiver,
                message=data.get('message', ''),
                attachment=data.get('attachment'),
                attachment_type=data.get('attachment_type', '')
            )
            
            return {
                'id': chat_message.id,
                'created_at': chat_message.created_at.isoformat(),
                'sender_id': self.user.id,
                'sender_username': self.user.username,
                'message': chat_message.message,
                'attachment': chat_message.attachment.url if chat_message.attachment else None,
                'attachment_type': chat_message.attachment_type,
                'attachment_name': chat_message.attachment.name if chat_message.attachment else None
            }
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def mark_messages_as_read(self):
        """Mark all messages from other user as read."""
        from .models import ChatMessage, User
        
        try:
            other_user = User.objects.get(id=self.other_user_id)
            ChatMessage.mark_as_read(self.user, other_user)
        except User.DoesNotExist:
            pass
