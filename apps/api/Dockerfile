FROM oven/bun:1.2-alpine AS base
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/math/package.json ./packages/math/
COPY packages/policy/package.json ./packages/policy/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY packages ./packages
COPY apps/api ./apps/api

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "--cwd", "apps/api", "start"]
