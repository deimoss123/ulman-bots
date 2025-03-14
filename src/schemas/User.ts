import { Schema, model, InferSchemaType } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';

const RequiredStringIndex = {
  type: String,
  required: true,
  index: true,
};

const RequiredString = {
  type: String,
  required: true,
};

const NumberZero = {
  type: Number,
  default: 0,
};

const RequiredNumber = {
  type: Number,
  required: true,
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
  apliesanasReizes: Number,
  apliets: Number, // unix millis
  iestadits: Number, // unix millis

  // gāzes plīts
  actionType: String,
  boilIevarijums: {
    boilStarttime: Number,
    boilDuration: Number,
    berries: {},
    properties: {},
  },
};

const userSchema = new Schema<UserProfile>({
  userId: RequiredStringIndex,
  guildId: RequiredStringIndex,
  lati: NumberZero,
  xp: NumberZero, // pāri palikušais xp
  level: NumberZero,

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
        name: RequiredString, // mantas id (pudele, koka_makskere, ...)
        amount: RequiredNumber, // mantas daudzums
      },
    ],
    default: [],
  },

  specialItems: {
    type: [
      {
        name: RequiredString,
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
      aizsargats: RequiredNumber,
      laupitajs: RequiredNumber,
      juridisks: RequiredNumber,
      veiksmigs: RequiredNumber,
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

    usesLeft: NumberZero,

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
      latvijasPiens: NumberZero,
      latvijasRadio: NumberZero,
      martinsonaVelo: NumberZero,
      bachaKazino: NumberZero,
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

  properties: {
    type: {
      metalluznuNodosanasPunkts: {
        lastTemp: Number,
        lastUpdateTime: Number,
        currentLati: Number,
      },
    },

    default: {
      metalluznuNodosanasPunkts: {
        lastTemp: -9999,
        lastUpdateTime: -1,
        currentLati: 0,
      },
    },
  },
});

export default model('User', userSchema);
