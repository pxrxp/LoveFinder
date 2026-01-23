import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { LiveChatService } from './live-chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class LiveChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly liveChatService: LiveChatService) { }

  @WebSocketServer()
  server!: Server;

  handleConnection(socket: Socket) {
    console.log(socket.id, ' connected');
  }

  handleDisconnect(socket: Socket) {
    console.log(socket.id, ' disconnected');
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody("user_id") userId: string,
    @MessageBody("room_id") roomId: string
  ) {
    socket.join(roomId);
    socket.emit('join_room', userId);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('user_id') userId: string,
    @MessageBody("room_id") roomId: string
  ) {
    socket.leave(roomId);
    socket.emit('leave_room', userId);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody('room_id') roomId: string,
    @MessageBody('message') message: string,
  ) {
    this.server.to(roomId).emit('new_message', {
      sender: socket.id,
      message,
    });
  }
}
