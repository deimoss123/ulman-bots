import { statusList } from '../../commands/economyCommands/profils';
import addStatus from '../../economy/addStatus';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';

export const PETNIEKZIVS_STATUS_TIME = 900_000; // 15 min

const petniekzivs: UsableItemFunc = async (userId, guildId) => {
  const user = await addStatus(userId, guildId, { veiksmigs: PETNIEKZIVS_STATUS_TIME });
  if (!user) return { error: true };

  return {
    text:
      `Tu apēdi pētniekzivi un ieguvi statusu **"${statusList.veiksmigs}"**\n` +
      `Tev tagad ir palielināti procenti feniksam, ruletei un loto biļetēm: \n` +
      `\`\`\`${millisToReadableTime(user.status.veiksmigs - Date.now())}\`\`\``,
  };
};

export default petniekzivs;
