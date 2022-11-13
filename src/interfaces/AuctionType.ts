import { ItemAttributes } from './UserProfile';

interface AuctionType {
  _id: string;

  itemKey: string;
  itemAmount: number;
  startPrice: number;

  attributes: ItemAttributes | null;

  messageId: string | null;

  startDate: number;
  endDate: number;

  currentBid: {
    userId: string;
    userTag: string;
    lati: number;
  } | null;

  bidHistory: {
    userId: string;
    userTag: string;
    lati: number;
    date: number;
  }[];
}

export default AuctionType;
