import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import setUser from '../../economy/setUser';
import { UsableItemFunc } from '../../interfaces/Item';

const piparkuka: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const userUbagotCooldown = user.timeCooldowns.findIndex(c => c.name === 'ubagot');
  const userStradatCooldown = user.timeCooldowns.findIndex(c => c.name === 'stradat');

  const timeCooldowns = user.timeCooldowns;

  if (userUbagotCooldown === -1) timeCooldowns.push({ name: 'ubagot', lastUsed: 0 });
  else timeCooldowns[userUbagotCooldown] = { name: 'ubagot', lastUsed: 0 };

  if (userStradatCooldown === -1) timeCooldowns.push({ name: 'stradat', lastUsed: 0 });
  else timeCooldowns[userStradatCooldown] = { name: 'stradat', lastUsed: 0 };

  await setUser(userId, guildId, { timeCooldowns });
  await addItems(userId, guildId, { piparkuka: -1 });

  return {
    text: 'Tu izlaidi gaidīšanas laiku līdz nākamajai strādāšanai un ubagošanai',
  };
};

export default piparkuka;
