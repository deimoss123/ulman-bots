import { Schema, model } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';

const ReqStringIndex = {
  type: String,
  required: true,
  index: true,
};

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
  userId: ReqStringIndex,
  guildId: ReqStringIndex,
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
  specialItems: {
    type: [
      {
        name: String,
        attributes: {
          timesUsed: Number,
          customName: String,
          durability: Number,
          lastUsed: Number, // unix millis
          foundItemKey: String,
        },
      },
    ],
    default: [],
  },

  payTax: {
    type: Number,
    default: 0.1,
  },
  giveTax: {
    type: Number,
    default: 0.15,
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

  status: {
    type: {
      aizsargats: Number,
      laupitajs: Number,
      juridisks: Number,
    },
    default: {
      aizsargats: 0,
      laupitajs: 0,
      juridisks: 0,
    },
  },
  fishing: {
    maxCapacity: {
      type: Number,
      default: 10,
    },
    selectedRod: {
      type: String,
      default: null,
    },
    usesLeft: NumberDefaulZero,
    lastCaughtFish: {
      type: {
        time: Number,
        itemKey: String,
      },
      default: null,
    },
    futureFishList: {
      type: [
        {
          time: Number,
          itemKey: String,
        },
      ],
      default: null,
    },
    caughtFishes: {
      type: {},
      default: null,
    },
  },
});

export default model('User', userSchema);
