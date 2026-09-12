# install the dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json .
RUN npm  ci
# Build
FROM node:22-alpine AS builder
COPY --from=deps  /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build
# production nginx server
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner
COPY --from=builder /app/dist/ /usr/share/nginx/html/
HEALTHCHECK  --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider  http://localhost:8080/ || exit 1 
EXPOSE 80
CMD [ "nginx","-g","daemon off;" ]
