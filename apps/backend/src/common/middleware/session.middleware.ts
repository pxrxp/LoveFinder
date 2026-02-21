import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);

export const sessionMiddleware: ReturnType<typeof session> = session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'nestjs-auth:',
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 * 24 * 10,
    secure: process.env.NODE_ENV === 'production',
  },
});
