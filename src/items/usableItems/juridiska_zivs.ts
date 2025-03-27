import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { UsableItemFunc } from "@/interfaces/Item";

export const JURIDISKA_ZIVS_STATUS = 259_200_000; //72h

const juridiska_zivs: UsableItemFunc = async (userId, guildId) => {
  const user = await addStatus(userId, guildId, { juridisks: JURIDISKA_ZIVS_STATUS });
  if (!user) return { error: true };

  return {
    text:
      `Apēdot juridisko zivi tu ieguvi statusu: **${statusList.juridisks}**\n` +
      "Tu esi atbrīvots no maksāšanas/iedošanas nodokļa: \n" +
      `\`\`\`${millisToReadableTime(user.status.juridisks - Date.now())}\`\`\``,
  };
};

export default juridiska_zivs;
