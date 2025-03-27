import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import { item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

export const RASENS_STATUS_TIME = 10_800_000; // 3h

const zemenu_rasens = item<UsableItem & ShopItem>({
  info:
    "Ja tev riebjas nolādētie zagļi kas visu laiku no tevis zog, izdzer zemeņu Rasēnu\n" +
    "Izdzerot (izmantojot) rasenu tu iegūsi " +
    `**"${statusList.aizsargats}"** statusu uz \`${millisToReadableTime(RASENS_STATUS_TIME)}\``,
  addedInVersion: "4.0",
  nameNomVsk: "zemeņu Rasēns",
  nameNomDsk: "zemeņu Rasēni",
  nameAkuVsk: "zemeņu Rasēnu",
  nameAkuDsk: "zemeņu Rasēnus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("zemenu_rasens"),
  imgLink: "https://www.ulmanbots.lv/images/items/zemenu_rasens.png",
  categories: [ItemCategory.VEIKALS],
  value: 75,
  allowDiscount: true,
  removedOnUse: true,
  use: async (userId, guildId) => {
    const user = await addStatus(userId, guildId, { aizsargats: RASENS_STATUS_TIME });
    if (!user) return { error: true };

    return {
      text:
        `Tu izdzēri rasenu un ieguvi statusu **"${statusList.aizsargats}"**\n` +
        `Tu tagad esi aizsargāts no apzagšanas: \n` +
        `\`\`\`${millisToReadableTime(user.status.aizsargats - Date.now())}\`\`\``,
    };
  },
});

export default zemenu_rasens;
