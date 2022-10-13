import { statusList } from '../../commands/economyCommands/profils';
import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import setUser from '../../economy/setUser';
import { UsableItemFunc } from '../../interfaces/Item';
import { UserStatus } from '../../interfaces/UserProfile';

const piena_spainis: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { text: 'UlmaņBota kļūda' };

  const { status } = user;
  if (!Object.values(status).find(s => s >= Date.now())) {
    return {
      text: 'Tev nav neviena statusa ko noņemt',
    };
  }

  const newStatus: any = {};
  for (const key of Object.keys(statusList)) {
    newStatus[key] = 0;
  }

  await Promise.all([
    setUser(userId, guildId, { status: newStatus as UserStatus }),
    addItems(userId, guildId, { piena_spainis: -1 }),
  ]);

  return {
    text: 'Tev tika noņemti visi statusi',
  };
};

export default piena_spainis;
