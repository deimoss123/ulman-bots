import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import { UsableItemFunc } from '../../interfaces/Item';
import checkUserSpecialItems from '../helpers/checkUserSpecialItems';

const kruma_sekla: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const res = checkUserSpecialItems(user, 'ogu_krums');

  if (!res.valid) {
    return {
      text: `Tu nevari iestādīt **${itemString('ogu_krums', null, true)}**, jo ${res.reason}`,
    };
  }

  await addItems(userId, guildId, { kruma_sekla: -1, ogu_krums: 1 });

  return {
    text: `Tu iestradāji ogu sēklu`,
  };
};

export default kruma_sekla;
