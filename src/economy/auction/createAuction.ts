import AuctionType from '../../interfaces/AuctionType';
import { ItemAttributes } from '../../interfaces/UserProfile';
import Auction from '../../schemas/Auction';

export default async function createAuction(
  itemKey: string,
  itemAmount: number,
  attributes: ItemAttributes | null,
  startPrice: number,
  startDate: number,
  endDate: number
): Promise<AuctionType | void> {
  try {
    const newAuction = new Auction({ itemKey, itemAmount, attributes, startPrice, startDate, endDate });
    await newAuction.save();

    return JSON.parse(JSON.stringify(newAuction)) as AuctionType;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
