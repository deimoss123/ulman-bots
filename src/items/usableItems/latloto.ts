import loto from '../../casino/loto';
import laimestiLatloto from '../../casino/laimesti/laimestiLatloto';
import { UsableItemFunc } from '../../interfaces/Item';

const latloto: UsableItemFunc = async (userId, guildId) =>  {
  return await loto(userId, guildId, laimestiLatloto);
}

export default latloto