import loto from '../../casino/loto';
import laimestiLatloto from '../../casino/laimesti/laimestiLatloto';
import { UsableItemFunc } from '../../interfaces/Item';

const latloto: UsableItemFunc = (userId, guildId) => loto(userId, guildId, laimestiLatloto);

export default latloto;
