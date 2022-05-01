import mongoose from 'mongoose'

export default async function() {
  await mongoose.connect(process.env.MONGO_PATH!)
  return mongoose
}