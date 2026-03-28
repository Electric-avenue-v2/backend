ARG NODE_VERSION=20
ARG PNPM_VERSION=10.30.1

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8000

CMD ["node", "dist/main.js"]