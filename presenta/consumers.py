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
            await self.close()
            return
        
        # Get the other user ID from URL
        self.other_user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.design_request_id = self.scope['url_route']['kwargs'].get('request_id')
        
        # Create a unique room name for this conversation
        if self.other_user_id:
            # Sort user IDs to ensure same room name regardless of who connects
            user_ids = sorted([str(self.user.id), str(self.other_user_id)])
            self.room_group_name = f'chat_{user_ids[0]}_{user_ids[1]}'
        else:
            # General chat room
            self.room_group_name = f'chat_user_{self.user.id}'
        
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
            message = text_data_json.get('message', '')
            
            if not message.strip():
                return
            
            # Save message to database
            saved_message = await self.save_message(message)
            
            if saved_message:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender_id': self.user.id,
                        'sender_username': self.user.username,
                        'timestamp': saved_message['created_at'],
                        'message_id': saved_message['id']
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
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id']
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
    def save_message(self, message):
        """Save message to database."""
        from .models import ChatMessage, User
        
        try:
            receiver = User.objects.get(id=self.other_user_id)
            
            chat_message = ChatMessage.objects.create(
                sender=self.user,
                receiver=receiver,
                design_request_id=self.design_request_id if self.design_request_id else None,
                message=message
            )
            
            return {
                'id': chat_message.id,
                'created_at': chat_message.created_at.isoformat()
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
