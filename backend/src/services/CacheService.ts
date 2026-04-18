import redisClient from '../config/redis';

const CACHE_TTL = 3600; // 1 hour in seconds

class CacheService {
  private isAvailable = false;

  async connect(): Promise<void> {
    try {
      await redisClient.connect();
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) return null;
    try {
      const cached = await redisClient.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = CACHE_TTL): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
    } catch {
      // Silently fail on cache write errors
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await redisClient.del(key);
    } catch {
      // Silently fail
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Silently fail
    }
  }

  buildKey(...parts: (string | number | undefined | null)[]): string {
    return parts
      .map((p) => (p === undefined || p === null ? '_' : String(p)))
      .join(':');
  }
}

export default new CacheService();
