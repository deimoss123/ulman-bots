import { model, Schema } from 'mongoose';
import { AkcijaChartTimes } from '../commands/economyCommands/akcijas/akcijasList';
import AkcijaType from '../interfaces/AkcijaType';

const reqStr = {
  type: String,
  required: true,
};

const reqNum = {
  type: Number,
  required: true,
};

const akcijaSchema = new Schema<AkcijaType & { imgUrls: Record<AkcijaChartTimes, string> }>({
  akcijaId: reqStr,
  time: reqNum,
  price: reqNum,
  imgUrls: {
    '2h': String,
    '8h': String,
    '24h': String,
    '7d': String,
  },
});

export default model('Akcija', akcijaSchema);
