import { ActivityType, Client, PresenceUpdateStatus } from 'discord.js';
import cron from 'node-cron';
import setDiscounts from '../items/discounts/setDiscounts';
import setBotPresence from './setBotPresence';

export default function setupCronJobs(client: Client) {
  // katru dienu plkst 00:00
  cron.schedule('0 0 * * *', () => {
    setDiscounts();
  });

  // katru stundu
  cron.schedule('0 * * * *', () => {
    setBotPresence(client);
  });
}
