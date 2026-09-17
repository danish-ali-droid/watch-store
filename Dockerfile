
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci


FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production

ENV NODE_OPTIONS="--max-old-size=4096"
RUN npm run build


FROM nginxinc/nginx-unprivileged:alpine-slim AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist ./

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1 

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]