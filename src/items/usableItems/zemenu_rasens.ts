import { statusList } from '../../commands/economyCommands/profils';
import addStatus from '../../economy/addStatus';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';

const RASENS_STATUS_TIME = 10_800_000; // 3h

const zemenu_rasens: UsableItemFunc = async (userId, guildId) => {
  const user = await addStatus(userId, guildId, { aizsargats: RASENS_STATUS_TIME });
  if (!user) return { text: 'UlmaņBota kļūda' };

  return {
    text:
      `Tu izdzēri rasenu un ieguvi statusu **"${statusList.aizsargats}"**\n` +
      `Tu tagad esi aizsargāts no apzagšanas: \n` +
      `\`\`\`${millisToReadableTime(user.status.aizsargats - Date.now())}\`\`\``,
  };
};

export default zemenu_rasens;
