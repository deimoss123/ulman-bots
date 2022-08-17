import { Schema, model } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';

const NumberDefaulZero = {
  type: Number,
  default: 0,
};

const DailyCooldownSchema = {
  timesUsed: Number,
  extraTimesUsed: Number,
};

export const dailyCooldownDefaultEach = {
  timesUsed: 0,
  extraTimesUsed: 0,
};

export const dailyCooldownDefault = {
  stradat: dailyCooldownDefaultEach,
  ubagot: dailyCooldownDefaultEach,
};

const userSchema = new Schema<UserProfile>({
  userId: {
    type: String,
    required: true,
  },
  lati: NumberDefaulZero,
  xp: NumberDefaulZero, // pāri palikušais xp
  level: NumberDefaulZero,
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

  lastDayUsed: {
    type: String,
    default: new Date().toLocaleDateString('en-GB'), // "1/1/1970"
  },
  dailyCooldowns: {
    type: {
      stradat: DailyCooldownSchema,
      ubagot: DailyCooldownSchema,
    },
    // nav ideāli bet ok
    default: dailyCooldownDefault,
  },
});

export default model('User', userSchema);
