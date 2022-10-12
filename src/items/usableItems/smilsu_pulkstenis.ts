import syncFishing from '../../commands/economyCommands/zvejot/syncFishing';
import addItems from '../../economy/addItems';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';

export const ZVEJA_SHIFT_TIME = 21_600_000; // 6h

const smilsu_pulkstenis: UsableItemFunc = async (userId, guildId) => {
  const user = await syncFishing(userId, guildId);
  if (!user) {
    return { text: 'UlmaņBota kļūda' };
  }

  if (!user.fishing.futureFishList) {
    return {
      text: `Lai izmantotu smilšu pulksteni, tev ir jābūt aktīvai zvejai (brīvai vietai copes inventārā un salabotai makšķere)`,
    };
  }

  const [userAfter] = await Promise.all([
    syncFishing(userId, guildId, false, false, ZVEJA_SHIFT_TIME),
    addItems(userId, guildId, { smilsu_pulkstenis: -1 }),
  ]);
  if (!userAfter) {
    return { text: 'UlmaņBota kļūda' };
  }

  return {
    text: `Zvejošanas laiks maģiski tika pārbīdīts uz priekšu pa \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
  };
};

export default smilsu_pulkstenis;
