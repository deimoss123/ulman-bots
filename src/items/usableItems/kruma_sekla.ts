import { UsableItemFunc } from '../../interfaces/Item';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import itemList, { ItemKey } from '../itemList';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import addItems from '../../economy/addItems';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';

// burtiski iedos ogu krumu
// es zinu... super sarezgita manta

const krumu_sekla: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };
  const userAfter = await addItems(userId, guildId, { ogu_krums: 1 });
  if (!userAfter) return { error: true };
  return {
    text: 'Tu iestādīji vienu ogu krūmu.',
  };
};

export default krumu_sekla;
