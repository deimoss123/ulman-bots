import syncFishing from "@/commands/zvejot/syncFishing";
import addItems from "@/db/addItems";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

const ZVEJA_SHIFT_TIME = 32_400_000; // 9h

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await syncFishing(userId, guildId);
  if (!user) return { error: true };

  if (!user.fishing.futureFishList) {
    return {
      text: `Lai izmantotu smilšu pulksteni, tev ir jābūt aktīvai zvejai (brīvai vietai copes inventārā un salabotai makšķere)`,
    };
  }

  await addItems(userId, guildId, { smilsu_pulkstenis: -1 });
  const userAfter = await syncFishing(userId, guildId, false, false, ZVEJA_SHIFT_TIME);

  if (!userAfter) return { error: true };

  return {
    text: `Zvejošanas laiks maģiski tika pārbīdīts uz priekšu par \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
  };
};

const smilsu_pulkstenis = item<UsableItem>({
  info:
    "Izmantojot smilšu pulksteni zvejošanas laiks maģiski tiks pārbīdīts uz priekšu " +
    `par \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
  addedInVersion: "4.0",
  nameNomVsk: "smilšu pulkstenis",
  nameNomDsk: "smilšu pulksteņi",
  nameAkuVsk: "smilšu pulksteni",
  nameAkuDsk: "smilšu pulksteņus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("smilsu_pulkstenis"),
  imgLink: "https://www.ulmanbots.lv/images/items/smilsu_pulkstenis.gif",
  categories: [ItemCategory.OTHER],
  value: 75,
  removedOnUse: false,
  use,
});

export default smilsu_pulkstenis;
