import { Schema, model } from 'mongoose';

const numberDefaulZero = {
  type: Number,
  default: 0,
};

const userSchema = new Schema({
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
        name: String,
        amount: Number,
      },
    ],
    default: [],
  },
});

export default model('User', userSchema);
