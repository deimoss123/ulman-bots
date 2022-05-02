import mongoose, { Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const reqNum = {
  type: Number,
  required: true,
}

const userSchema = new mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  lati: reqNum,
})

export default mongoose.model('User', userSchema)