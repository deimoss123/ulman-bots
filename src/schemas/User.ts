import { Schema, model } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';

const numberDefaulZero = {
  type: Number,
  default: 0,
};

const userSchema = new Schema<UserProfile>({
  userId: {
    type: String,
    required: true,
  },
  lati: numberDefaulZero,
  xp: numberDefaulZero, // pāri palikušais xp
  level: numberDefaulZero,
  jobPosition: {
    type: String,
    default: null,
  },
  itemCap: {
    type: Number,
    default: 50,
  },
  items: {
    type: [
      {
        name: String, // mantas id (pudele, koka_makskere, ...)
        amount: Number, // mantas daudzums
      },
    ],
    default: [],
  },
  timeCooldowns: {
    type: [
      {
        name: String, // komandas nosaukums
        lastUsed: Number, // milisekundēs
      },
    ],
    default: [],
  },
  dailyCooldowns: {
    type: [
      {
        name: String, // komandas nosaukums (stradat, ubagot, ...),
        timesUsed: Number, // cik reizes izmantota
        dateWhenUsed: Date, // diena (datums) kad izmantota pēdējo reizi
      },
    ],
    default: [],
  },
});

export default model('User', userSchema);
