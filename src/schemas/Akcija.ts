import { model, Schema } from 'mongoose';
import AkcijaType from '../interfaces/AkcijaType';

const reqStr = {
  type: String,
  required: true,
};

const reqNum = {
  type: Number,
  required: true,
};

const akcijaSchema = new Schema<AkcijaType>({
  akcijaId: reqStr,
  time: reqNum,
  price: reqNum,
});

export default model('Akcija', akcijaSchema);
