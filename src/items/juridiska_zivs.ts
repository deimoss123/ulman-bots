import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import addStatus from "@/db/addStatus";
import { item, ItemCategory, UsableItem } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
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
  use: async (i) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const { ok, values } = await mongoTransaction((session) => [
      () => addItems(userId, guildId, { juridiska_zivs: -1 }, session),
      () => addStatus(userId, guildId, { juridisks: JURIDISKA_ZIVS_STATUS }, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("juridiska_zivs"),
      description: 
        `Apēdot juridisko zivi tu ieguvi statusu: **${statusList.juridisks}**\n` +
        "Tu esi atbrīvots no maksāšanas/iedošanas nodokļa: \n" +
        `\`\`\`${millisToReadableTime(values.at(-1)!.status.juridisks - Date.now())}\`\`\``,
    }));
  },
});

export default juridiska_zivs;
