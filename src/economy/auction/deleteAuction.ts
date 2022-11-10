import AuctionType from '../../interfaces/AuctionType';
import Auction from '../../schemas/Auction';

export default async function deleteAuction(id: string): Promise<AuctionType | void> {
  try {
    const res = await Auction.deleteOne({ _id: id });
    return JSON.parse(JSON.stringify(res)) as AuctionType;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
