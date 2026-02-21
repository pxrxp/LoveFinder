/**
 * Entry point for the backend server.
 * 
 * This file sets up the NestJS app and plugs in the essential middleware:
 * - Redis: Used to store user sessions so they persist even if the server restarts.
 * - Helmet: Adds standard security headers to protect against common web vulnerabilities.
 * - Passport: Handles our login sessions and integrates with the Redis store.
 * - ValidationPipe: Ensures that data coming from the mobile app matches our expected formats (DTOs).
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { createClient } from 'redis';
import session from 'express-session';
import passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  redisClient.connect().catch(console.error);

  const { RedisStore } = require('connect-redis');
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'nestjs-auth:',
  });

  // Security Headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000 * 24 * 10,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
