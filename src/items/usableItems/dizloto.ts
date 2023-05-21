import loto from './loto';
import { UsableItemFunc } from '../../interfaces/Item';

const dizloto: UsableItemFunc = (userId, guildId) => loto(userId, guildId, laimestiDizloto);

export default dizloto;
