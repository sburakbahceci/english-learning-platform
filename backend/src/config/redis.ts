import { Redis } from '@upstash/redis';

// Redis configuration - gracefully handle missing credentials
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Test connection
  redis.ping()
    .then(() => {
      console.log('✅ Redis connected successfully');
    })
    .catch((error) => {
      console.error('❌ Redis connection failed:', error.message);
    });
} else {
  console.warn('⚠️  Redis credentials not found in .env, Redis features disabled');
}

export { redis };