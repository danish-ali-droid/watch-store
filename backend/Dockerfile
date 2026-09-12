# dependencies install
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json .
RUN npm ci
# Build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps  /app/node_modules ./node_modules
COPY . .
RUN  npm run build 
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s  --start-period=5s --retries=3 \
 CMD wget --quiet --tries=1 --spider http://localhost:4000  || exit 1
EXPOSE 4000
CMD ["npm","start"]

