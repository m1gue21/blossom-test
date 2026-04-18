import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('Redis connection failed after 3 retries. Cache will be disabled.');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.warn('⚠️  Redis connection error:', err.message);
});

export default redisClient;
