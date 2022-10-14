import { Schema, model } from 'mongoose';
import StatsProfile from '../interfaces/StatsProfile';

const reqString = {
  type: String,
  required: true,
};

const NumZero = {
  type: Number,
  default: 0,
};

const statsSchema = new Schema<StatsProfile>({
  userId: reqString,
  guildId: reqString,

  spentShop: NumZero,
  soldShop: NumZero,
  taxPaid: NumZero,

  paidLati: NumZero,
  receivedLati: NumZero,

  itemsGiven: NumZero,
  itemsReceived: NumZero,

  stolenLati: NumZero,
  lostStealingLati: NumZero,
  stolenFromBanka: NumZero,

  caughtFishCount: NumZero,
  timeSpentFishing: NumZero,

  fenkaBiggestWin: NumZero,
  fenkaBiggestBet: NumZero,
  fenkaSpent: NumZero,
  fenkaWon: NumZero,
  fenkaSpinCount: NumZero,

  rulBiggestWin: NumZero,
  rulBiggestBet: NumZero,
  rulSpent: NumZero,
  rulWon: NumZero,
  rulSpinCount: NumZero,
});

export default model('Stats', statsSchema);
