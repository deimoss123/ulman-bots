import { statusList } from '../../commands/economyCommands/profils';
import addStatus from '../../economy/addStatus';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';
import { UserStatusName } from '../../interfaces/UserProfile';
import { JURIDISKA_ZIVS_STATUS } from './juridiska_zivs';
import { NAZIS_STATUS_TIME } from './nazis';
import { PETNIEKZIVS_STATUS_TIME } from './petniekzivs';
import { RASENS_STATUS_TIME } from './zemenu_rasens';

const divainaZivsStatuses: Record<UserStatusName, number> = {
  aizsargats: RASENS_STATUS_TIME / 2,
  laupitajs: NAZIS_STATUS_TIME / 2,
  juridisks: JURIDISKA_ZIVS_STATUS / 3,
  veiksmigs: PETNIEKZIVS_STATUS_TIME,
};

const divaina_zivs: UsableItemFunc = async (userId, guildId) => {
  const statusEntry = Object.entries(divainaZivsStatuses)[
    Math.floor(Math.random() * Object.keys(divainaZivsStatuses).length)
  ] as [UserStatusName, number];

  const statusToAdd = Object.fromEntries([statusEntry]);

  const user = await addStatus(userId, guildId, statusToAdd);
  if (!user) return { text: 'Ulmaņbota kļūda' };

  return {
    text:
      `Apēdot dīvaino zivi tu ieguvi statusu **"${statusList[statusEntry[0]]}"**, statusa ilgums:\n` +
      `\`\`\`${millisToReadableTime(user.status[statusEntry[0]] - Date.now())}\`\`\``,
  };
};

export default divaina_zivs;
