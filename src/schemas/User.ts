import mongoose from 'mongoose';

const reqString = {
  type: String,
  required: true,
};

const userSchema = new mongoose.Schema({
  guildId: reqString,
  userId: reqString,
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