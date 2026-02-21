FROM oven/bun:1.3

WORKDIR /app

# Copy root config for workspace resolution
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/

RUN bun install

# Copy source
COPY . .

# Build the app
RUN cd apps/backend && bun run build

EXPOSE 3000

# Use production start command
CMD ["bun", "run", "--cwd", "apps/backend", "start"]
