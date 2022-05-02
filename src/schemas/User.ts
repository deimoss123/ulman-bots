import mongoose from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const userSchema = new mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  lati: {
    type: Number,
    default: 0,
  },
})

export default mongoose.model('User', userSchema)