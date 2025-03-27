import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import { item, ItemCategory, ShopItem, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";
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
  removedOnUse: true,
  allowDiscount: true,
  use: async (userId, guildId) => {
    const user = await addStatus(userId, guildId, { laupitajs: NAZIS_STATUS_TIME });
    if (!user) return { error: true };

    return {
      text:
        `Tu izvilki nazi un ieguvi statusu **"${statusList.laupitajs}"**\n` +
        `Tev zagšanai ir palielināta efektivitāte: \n` +
        `\`\`\`${millisToReadableTime(user.status.laupitajs - Date.now())}\`\`\``,
    };
  },
});

export default nazis;
