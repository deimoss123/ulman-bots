import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  lati: {
    type: Number,
    default: 0,
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