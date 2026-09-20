import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const CACHE_KEY = 'watch-store:products';
const OTP_PREFIX = 'watch-store:otp:';
const OTP_TTL_SECONDS = 2 * 60;
const fallbackStore = new Map();

let client;
let redisReady = false;

if (process.env.REDIS_URL) {
  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });

  client.on('ready', () => {
    redisReady = true;
    console.log('Redis connected.');
  });
  client.on('end', () => {
    redisReady = false;
  });
  client.on('error', (error) => {
    redisReady = false;
    console.warn('Redis unavailable; using in-memory fallback:', error.message);
  });

  client.connect().catch((error) => {
    redisReady = false;
    console.warn('Redis connection failed; continuing without Redis:', error.message);
  });
}

async function redisCall(operation) {
  if (!redisReady) return null;
  try {
    return await operation(client);
  } catch (error) {
    redisReady = false;
    console.warn('Redis operation failed; continuing without Redis:', error.message);
    return null;
  }
}

export async function getProductsCache() {
  const cached = await redisCall((redis) => redis.get(CACHE_KEY));
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {
      await redisCall((redis) => redis.del(CACHE_KEY));
    }
  }

  const fallback = fallbackStore.get(CACHE_KEY);
  try {
    return fallback ? JSON.parse(fallback) : null;
  } catch (_) {
    fallbackStore.delete(CACHE_KEY);
    return null;
  }
}

export async function setProductsCache(products) {
  const value = JSON.stringify(products);
  fallbackStore.set(CACHE_KEY, value);
  await redisCall((redis) => redis.set(CACHE_KEY, value, { EX: 300 }));
}

export async function clearProductsCache() {
  fallbackStore.delete(CACHE_KEY);
  await redisCall((redis) => redis.del(CACHE_KEY));
}

export async function setOtp(key, value) {
  const redisKey = `${OTP_PREFIX}${key}`;
  const serialized = JSON.stringify(value);
  fallbackStore.set(redisKey, serialized);
  await redisCall((redis) => redis.set(redisKey, serialized, { EX: OTP_TTL_SECONDS }));
}

export async function getOtp(key) {
  const redisKey = `${OTP_PREFIX}${key}`;
  const cached = await redisCall((redis) => redis.get(redisKey));
  const value = cached || fallbackStore.get(redisKey);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (_) {
    await deleteOtp(key);
    return null;
  }
}

export async function deleteOtp(key) {
  const redisKey = `${OTP_PREFIX}${key}`;
  fallbackStore.delete(redisKey);
  await redisCall((redis) => redis.del(redisKey));
}
