import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

export const JURIDISKA_ZIVS_STATUS = 259_200_000; // 72h

const juridiska_zivs = item<UsableItem>({
  info:
    "Šai zivij pieder vairāki multimiljonu uzņēmumi\n\n" +
    `Apēdot (izmantojot) juridisko zivi tu iegūsi ` +
    `**"${statusList.juridisks}"** statusu uz \`${millisToReadableTime(JURIDISKA_ZIVS_STATUS)}\`, ` +
    `kas tevi atvieglos no iedošanas un maksāšanas nodokļa\n\n` +
    "_Tikai neapēd šīs zivs dārgo uzvalku_",
  addedInVersion: "4.0",
  nameNomVsk: "juridiskā zivs",
  nameNomDsk: "juridiskās zivis",
  nameAkuVsk: "juridisko zivi",
  nameAkuDsk: "juridiskās zivis",
  isVirsiesuDzimte: false,
  emoji: () => emoji("juridiska_zivs"),
  imgLink: "https://www.ulmanbots.lv/images/items/juridiska_zivs.png",
  categories: [ItemCategory.ZIVIS],
  value: 50,
  removedOnUse: true,
  use: async (userId, guildId) => {
    const user = await addStatus(userId, guildId, { juridisks: JURIDISKA_ZIVS_STATUS });
    if (!user) return { error: true };

    return {
      text:
        `Apēdot juridisko zivi tu ieguvi statusu: **${statusList.juridisks}**\n` +
        "Tu esi atbrīvots no maksāšanas/iedošanas nodokļa: \n" +
        `\`\`\`${millisToReadableTime(user.status.juridisks - Date.now())}\`\`\``,
    };
  },
});

export default juridiska_zivs;
