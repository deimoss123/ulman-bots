import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import addStatus from "@/db/addStatus";
import { item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
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
  use: async (i) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const { ok, values } = await mongoTransaction((session) => [
      () => addItems(userId, guildId, { zemenu_rasens: -1 }, session),
      () => addStatus(userId, guildId, { aizsargats: RASENS_STATUS_TIME }, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("zemenu_rasens"),
      description: 
        `Tu izdzēri rasenu un ieguvi statusu **"${statusList.aizsargats}"**\n` +
        `Tu tagad esi aizsargāts no apzagšanas: \n` +
        `\`\`\`${millisToReadableTime(values.at(-1)!.status.aizsargats - Date.now())}\`\`\``,
    }));
  },
});

export default zemenu_rasens;
