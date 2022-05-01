import mongoose from 'mongoose'

const reqString = {
  type: String,
  required: true
}

const reqNum = {
  type: Number,
  required: true
}

const profileSchema = new mongoose.Schema({
  _id: reqString,
  guildId: reqString,
  userId: reqString,
  lati: reqNum
})

export default mongoose.model('profiles', profileSchema)