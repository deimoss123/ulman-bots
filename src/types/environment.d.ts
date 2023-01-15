declare namespace NodeJS {
  interface ProcessEnv {
    // tokens lai ielogotos discordā
    BOT_TOKEN: string;

    // testēšanas serveris
    DEV_SERVER_ID: string;

    // mongo url
    MONGO_PATH: string;

    // īpašnieka ID
    DEV_ID: string;

    // ulmaņbota API
    ULMANBOTS_API_URL: string;

    // adventes kanāla ID
    ADVENTE_CHANNEL: string;

    // upstash lietas ehh
    UPSTASH_QSTASH_TOKEN: string;
    UPSTASH_REDIS_URL: string;
    UPSTASH_REDIS_TOKEN: string;

    // webhooks ko izmanto API un upstash lai sūtītu ulmaņbotam "komandas"
    DISCORD_WEBHOOK_URL: string;

    // kanāls nepabeigtajai akciju sistēmai
    AUCTION_CHANNEL: string;

    // api kanāls testēšanas serverī, kur bots saņem "komandas"
    API_CHANNEL: string;
  }
}
