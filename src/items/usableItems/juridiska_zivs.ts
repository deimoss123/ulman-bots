import { statusList } from '../../commands/economyCommands/profils';
import addStatus from '../../economy/addStatus';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';

export const JURIDISKA_ZIVS_STATUS = 259_200_000; //72h

const juridiska_zivs: UsableItemFunc = async (userId, guildId) => {
  const user = await addStatus(userId, guildId, { juridisks: JURIDISKA_ZIVS_STATUS });
  if (!user) return { text: 'Ulmaņbota kļūda' };

  return {
    text:
      `Apēdot juridisko zivi tu ieguvi statusu: **${statusList.juridisks}**\n` +
      'Tu esi atbrīvots no maksāšanas/iedošanas nodokļa: \n' +
      `\`\`\`${millisToReadableTime(user.status.juridisks - Date.now())}\`\`\``,
  };
};

export default juridiska_zivs;
