# syntax=docker/dockerfile:1.7
# Multi-stage build for langfuse-mcp.
# Stage 1 compiles TypeScript; stage 2 ships only runtime artifacts.

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
ENTRYPOINT ["node", "dist/index.js"]
