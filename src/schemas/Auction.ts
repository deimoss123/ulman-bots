import { model, Schema, SchemaDefinitionProperty } from 'mongoose';
import AuctionType from '../interfaces/AuctionType';
import { ItemAttributesSchema } from './User';

const reqStr: SchemaDefinitionProperty = {
  type: String,
  required: true,
};

const reqNum: SchemaDefinitionProperty = {
  type: Number,
  required: true,
};

const bid = {
  userId: reqStr,
  userTag: reqStr,
  lati: reqNum,
  date: reqNum,
};

const auctionSchema = new Schema<AuctionType>({
  itemKey: reqStr,
  itemAmount: reqNum,
  startPrice: reqNum,

  attributes: {
    type: ItemAttributesSchema,
    default: null,
  },

  messageId: {
    type: String,
    default: null,
  },

  startDate: reqNum,
  endDate: reqNum,

  currentBid: {
    type: bid,
    default: null,
  },

  bidHistory: {
    type: [bid],
    default: [],
  },
});

export default model('Auction', auctionSchema);
