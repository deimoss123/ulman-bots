import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import addStatus from "@/db/addStatus";
import { item, ItemCategory, ShopItem, UsableItem } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

export const NAZIS_STATUS_TIME = 3_600_000; // 1h

const nazis = item<UsableItem & ShopItem>({
  info:
    "Ja jūties viltīgs un ar vēlmi zagt, tad nazis ir domāts tev.\n" +
    `Izmantojot nazi tu iegūsi **"${statusList.laupitajs}"** statusu uz ` +
    `\`${millisToReadableTime(NAZIS_STATUS_TIME)}\``,
  addedInVersion: "4.0",
  nameNomVsk: "nazis",
  nameNomDsk: "naži",
  nameAkuVsk: "nazi",
  nameAkuDsk: "nažus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("nazis"),
  imgLink: "https://www.ulmanbots.lv/images/items/nazis.png",
  categories: [ItemCategory.VEIKALS],
  value: 125,
  allowDiscount: true,
  use: async (i) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const { ok, values } = await mongoTransaction((session) => [
      () => addItems(userId, guildId, { nazis: -1 }, session),
      () => addStatus(userId, guildId, { laupitajs: NAZIS_STATUS_TIME }, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("nazis"),
      description: 
        `Tu izvilki nazi un ieguvi statusu **"${statusList.laupitajs}"**\n` +
        `Tev zagšanai ir palielināta efektivitāte: \n` +
        `\`\`\`${millisToReadableTime(values.at(-1)!.status.laupitajs - Date.now())}\`\`\``,
    }));
  },
});

export default nazis;
