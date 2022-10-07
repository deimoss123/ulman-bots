import { Client } from 'discord.js';
import cron from 'node-cron';
import setDiscounts from '../items/discounts/setDiscounts';
import setTirgus from '../items/tirgus/setTirgus';
import setBotPresence from './setBotPresence';

export default function setupCronJobs(client: Client) {
  // katru dienu plkst 20:00
  cron.schedule('0 20 * * *', () => {
    setDiscounts();
    setTirgus();
  });

  // katru stundu
  cron.schedule('0 * * * *', () => {
    setBotPresence(client);
  });
}
