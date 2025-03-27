import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { UsableItemFunc } from "@/types/Item";

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
