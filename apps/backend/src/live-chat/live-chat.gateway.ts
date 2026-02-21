import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { sessionMiddleware } from '../common/middleware/session.middleware';
import { UserDto } from '../users/dto/user.dto';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';

export interface AuthenticatedRequest extends Request {
  user?: UserDto;
}

function getSocketUser(socket: Socket): UserDto | null {
  const req = socket.request as unknown as AuthenticatedRequest;
  return req.user ?? null;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class LiveChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) { }

  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    server.use((socket, next) => {
      sessionMiddleware(socket.request as any, {} as any, async () => {
        const userId = (socket.request as any).session?.passport?.user;
        if (!userId) return next(new Error('Unauthorized'));

        const user = await this.usersService.findById(userId);
        (socket.request as any).user = user;
        next();
      });
    });
  }

  handleConnection(socket: Socket) {
    const user = getSocketUser(socket);
    if (!user) {
      socket.disconnect();
      return;
    }
    socket.join(user.user_id);
    console.log(`User ${user.user_id} connected and joined global room`);
  }

  handleDisconnect(socket: Socket) {
    const _user = getSocketUser(socket);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('other_user_id') otherUserId: string,
  ) {
    const user = getSocketUser(socket);
    if (!user) return;

    try {
      const roomId = this.chatService.getRoomId(user.user_id, otherUserId);
      socket.join(roomId);
      socket.emit('join_room', { room_id: roomId });
    } catch (err: any) {
      socket.emit('ws_error', { action: 'join_room', error: err.message });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('other_user_id') otherUserId: string,
  ) {
    const user = getSocketUser(socket);
    if (!user) return;

    try {
      const roomId = this.chatService.getRoomId(user.user_id, otherUserId);
      socket.leave(roomId);
      socket.emit('leave_room', { room_id: roomId });
    } catch (err: any) {
      socket.emit('ws_error', { action: 'leave_room', error: err.message });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody('other_user_id') otherUserId: string,
    @MessageBody('message') message: string,
    @MessageBody('message_type') messageType: 'text' | 'image',
  ) {
    const user = getSocketUser(socket);
    if (!user) return;

    try {
      const roomId = this.chatService.getRoomId(user.user_id, otherUserId);
      const msg = await this.chatService.sendMessage(
        user.user_id,
        otherUserId,
        message,
        messageType,
      );
      this.server.to(roomId).emit('new_message', msg);
      this.server.to(otherUserId).emit('new_message', msg); // For global in-app notifications
    } catch (err: any) {
      socket.emit('ws_error', { action: 'send_message', error: err.message });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody('other_user_id') otherUserId: string,
    @MessageBody('message_id') messageId: string,
  ) {
    const user = getSocketUser(socket);
    if (!user) return;

    try {
      await this.chatService.deleteMessage(user.user_id, messageId);
      const roomId = this.chatService.getRoomId(user.user_id, otherUserId);
      this.server.to(roomId).emit('delete_message', { message_id: messageId });
    } catch (err: any) {
      socket.emit('ws_error', {
        action: 'delete_message',
        message_id: messageId,
        error: err.message,
      });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody('other_user_id') otherUserId: string,
  ) {
    const user = getSocketUser(socket);
    if (!user) return;

    try {
      await this.chatService.markAsRead(user.user_id, otherUserId);
      const roomId = this.chatService.getRoomId(user.user_id, otherUserId);
      this.server.to(roomId).emit('messages_read', {
        reader_id: user.user_id,
        sender_id: otherUserId,
      });
    } catch (err: any) {
      socket.emit('ws_error', { action: 'mark_as_read', error: err.message });
    }
  }
}
