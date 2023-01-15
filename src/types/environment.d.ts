declare namespace NodeJS {
  interface ProcessEnv {
    BOT_TOKEN: string;
    DEV_SERVER_ID: string;
    MONGO_PATH: string;
    DEV_ID: string;
    API_URL: string;

    ADVENTE_CHANNEL: string;

    UPSTASH_TOKEN: string;
    UPSTASH_REDIS_URL: string;
    UPSTASH_REDIS_TOKEN: string;

    WEBHOOK_URL: string;

    AUCTION_CHANNEL: string;

    API_CHANNEL: string;
  }
}
