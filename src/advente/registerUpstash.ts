import axios from 'axios';

async function registerUpstash() {
  const date = Date.now();

  for (let i = 3; i <= 25; i++) {
    console.log(i);
    const nextMidnight = new Date(new Date().setDate(i)).setHours(0, 0, 0, 0);
    const secondsUntil = Math.floor((nextMidnight - Date.now()) / 1000);

    await axios.post(
      `https://qstash.upstash.io/v1/publish/${process.env.DISCORD_WEBHOOK_URL}`,
      {
        content: `<@892747599143125022> advente-start ${i}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_QSTASH_TOKEN}`,
          'Upstash-Delay': `${secondsUntil}s`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

registerUpstash();
