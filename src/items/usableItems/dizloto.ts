import laimestiDizloto from '../../casino/laimesti/laimestiDizloto';
import loto from '../../casino/loto';
import { UsableItemFunc } from '../../interfaces/Item';

const dizloto: UsableItemFunc = async (userId, guildId) => {
  return await loto(userId, guildId, laimestiDizloto);
};

export default dizloto;
