# FYP

## Backend services

MariaDB is the durable database for products, users, and orders. Redis is an optional application tier used for the product catalog cache and short-lived OTP records. The backend continues to operate against MariaDB if Redis is not configured or unavailable.

Start Redis locally with:

```bash
docker compose up -d redis
```

Set `REDIS_URL=redis://127.0.0.1:6379` in `backend/.env`, then start the backend with `npm run backend:start`. Product changes invalidate the catalog cache, and OTP records expire from Redis after two minutes.
