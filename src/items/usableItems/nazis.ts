import { statusList } from '../../commands/economyCommands/profils';
import addStatus from '../../economy/addStatus';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';

export const NAZIS_STATUS_TIME = 3_600_000; // 1h

const nazis: UsableItemFunc = async (userId, guildId) => {
  const user = await addStatus(userId, guildId, { laupitajs: NAZIS_STATUS_TIME });
  if (!user) return { error: true };

  return {
    text:
      `Tu izvilki nazi un ieguvi statusu **"${statusList.laupitajs}"**\n` +
      `Tev zagšanai ir palielināta efektivitāte: \n` +
      `\`\`\`${millisToReadableTime(user.status.laupitajs - Date.now())}\`\`\``,
  };
};

export default nazis;
