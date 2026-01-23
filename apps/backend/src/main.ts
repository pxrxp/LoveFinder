import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { createClient } from 'redis';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  redisClient.connect().catch(console.error);

  const { RedisStore } = require("connect-redis");
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'nestjs-auth:'
  });

  app.setGlobalPrefix('api/v1');

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000*24*10,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
