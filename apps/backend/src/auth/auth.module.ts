import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from '../auth/session.serializer';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController]
})
export class AuthModule {}
