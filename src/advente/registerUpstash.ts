import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function registerUpstash() {
  const date = Date.now();

  for (let i = 2; i <= 2; i++) {
    console.log(i);
    const nextMidnight = new Date(new Date().setDate(i)).setHours(0, 0, 0, 0);
    const secondsUntil = Math.floor((nextMidnight - Date.now()) / 1000);

    await axios.post(
      `https://qstash.upstash.io/v1/publish/${process.env.WEBHOOK_URL}`,
      {
        content: `<@892747599143125022> advente-start ${i}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
          'Upstash-Delay': `${secondsUntil}s`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

registerUpstash();
