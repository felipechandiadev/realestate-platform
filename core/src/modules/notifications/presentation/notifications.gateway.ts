import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { JweService } from '../../auth/infrastructure/jwe/jwe.service';
import { resolveAuthAudience } from '../../auth/application/auth-audience.util';

type AuthenticatedSocket = Socket & {
  data: Socket['data'] & { userId?: string };
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: [
      process.env.PORTAL_URL || 'http://localhost:8001',
      process.env.BACKOFFICE_URL || 'http://localhost:8002',
      'https://bravoshottpropiedades.cl',
      'https://www.bravoshottpropiedades.cl',
      'https://admin.bravoshottpropiedades.cl',
    ],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(private readonly jweService: JweService) {}

  async handleConnection(@ConnectedSocket() socket: AuthenticatedSocket): Promise<void> {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string' || token.length === 0) {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = await this.jweService.decrypt(token);
      const userId = typeof payload?.sub === 'string' ? payload.sub : undefined;
      const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;
      if (!userId || (exp && exp * 1000 <= Date.now())) {
        socket.disconnect(true);
        return;
      }

      const audience = resolveAuthAudience(payload);
      if (audience !== 'staff' && audience !== 'community') {
        socket.disconnect(true);
        return;
      }

      socket.data.userId = userId;
      await socket.join(this.roomName(userId));
    } catch {
      socket.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket): void {
    if (socket.data.userId) {
      this.logger.debug(`Notification socket disconnected for user ${socket.data.userId}`);
    }
  }

  emitNewNotification(userId: string, notificationId: string): void {
    if (!this.server) return;
    this.server.to(this.roomName(userId)).emit('notification:new', {
      notificationId,
      createdAt: new Date().toISOString(),
    });
  }

  private roomName(userId: string): string {
    return `user:${userId}`;
  }
}