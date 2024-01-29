import { Schema, model } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';

const ReqStringIndex = {
  type: String,
  required: true,
  index: true,
};

const NumZero = {
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
  pabalsts: dailyCooldownDefaultEach,
};

export const ItemAttributesSchema = {
  timesUsed: Number,
  customName: String,
  durability: Number,
  lastUsed: Number, // unix millis
  foundItemKey: String,
  latiCollected: Number,
  holdsFishCount: Number,
  createdAt: Number, // unix millis
  fedUntil: Number, // unix millis
  isCooked: Boolean,
  hat: String,
  piespraudeNum: Number,
  cookingItem: String,
  cookingStartedTime: Number, // unix millis

  // ogu krums
  berryType: String,
  growthTime: Number, // unix millis
  maxBerries: Number,
  apliets: Number, // unix millis
  iestadits: Number, // unix millis
};

const userSchema = new Schema<UserProfile>({
  userId: ReqStringIndex,
  guildId: ReqStringIndex,
  lati: NumZero,
  xp: NumZero, // pāri palikušais xp
  level: NumZero,
  jobPosition: {
    type: String,
    default: null,
  },

  adventeClaimedDate: {
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
        attributes: ItemAttributesSchema,
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
      pabalsts: DailyCooldownSchema,
    },
    // nav ideāli bet ok
    default: dailyCooldownDefault,
  },

  status: {
    type: {
      aizsargats: Number,
      laupitajs: Number,
      juridisks: Number,
      veiksmigs: Number,
    },
    default: {
      aizsargats: 0,
      laupitajs: 0,
      juridisks: 0,
      veiksmigs: 0,
    },
  },
  fishing: {
    maxCapacity: {
      type: Number,
      default: 6,
    },
    selectedRod: {
      type: String,
      default: null,
    },
    usesLeft: NumZero,
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

  tirgus: {
    lastDayUsed: {
      type: String,
      default: new Date().toLocaleDateString('en-GB'), // "1/1/1970"
    },
    itemsBought: {
      type: [String],
      default: [],
    },
  },

  stocks: {
    owned: {
      latvijasPiens: NumZero,
      latvijasRadio: NumZero,
      martinsonaVelo: NumZero,
      bachaKazino: NumZero,
    },
    transactions: {
      type: [
        {
          akcijaId: String,
          timestamp: Number,
          type: Number,
          amount: Number,
          price: Number,
        },
      ],
      default: [],
    },
  },
});

export default model('User', userSchema);
