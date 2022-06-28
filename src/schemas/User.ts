import mongoose from 'mongoose';

const numberDefaulZero = {
  type: Number,
  default: 0,
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  lati: numberDefaulZero,
  xp: numberDefaulZero,
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

export default mongoose.model('User', userSchema);
