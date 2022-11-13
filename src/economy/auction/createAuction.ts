import axios from 'axios';
import AuctionType from '../../interfaces/AuctionType';
import { ItemAttributes } from '../../interfaces/UserProfile';
import Auction from '../../schemas/Auction';

export default async function createAuction(
  clientId: string,
  itemKey: string,
  itemAmount: number,
  attributes: ItemAttributes | null,
  startPrice: number,
  startDate: number,
  endDate: number
): Promise<AuctionType | void> {
  try {
    const secondsUntil = Math.floor((startDate - Date.now()) / 1000);

    const newAuction = new Auction({ itemKey, itemAmount, attributes, startPrice, startDate, endDate });

    await Promise.all([
      axios.post(
        `https://qstash.upstash.io/v1/publish/${process.env.WEBHOOK_URL}`,
        {
          content: `<@${clientId}> auction-start ${newAuction._id}`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
            'Upstash-Delay': `${secondsUntil}s`,
            'Content-Type': 'application/json',
          },
        }
      ),
      newAuction.save(),
    ]);

    return JSON.parse(JSON.stringify(newAuction)) as AuctionType;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
