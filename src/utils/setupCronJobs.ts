import cron from 'node-cron';
import setDiscounts from '../items/discounts/setDiscounts';

export default function setupCronJobs() {
  // katru dienu plkst 00:00
  cron.schedule('0 0 * * *', () => {
    setDiscounts(); // iestata jaunas atlaides
  });
}
