import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { UsableItemFunc } from "@/interfaces/Item";
import { UserStatusName } from "@/interfaces/UserProfile";
import { JURIDISKA_ZIVS_STATUS } from "@/items/usableItems/juridiska_zivs";
import { NAZIS_STATUS_TIME } from "@/items/usableItems/nazis";
import { PETNIEKZIVS_STATUS_TIME } from "@/items/usableItems/petniekzivs";
import { RASENS_STATUS_TIME } from "@/items/usableItems/zemenu_rasens";

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
  if (!user) return { error: true };

  return {
    text:
      `Apēdot dīvaino zivi tu ieguvi statusu **"${statusList[statusEntry[0]]}"**, statusa ilgums:\n` +
      `\`\`\`${millisToReadableTime(user.status[statusEntry[0]] - Date.now())}\`\`\``,
  };
};

export default divaina_zivs;
