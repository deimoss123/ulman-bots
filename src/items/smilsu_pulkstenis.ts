import syncFishing from "@/commands/zvejot/syncFishing";
import addItems from "@/db/addItems";
import { UsableItemFunc, item, UsableItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

const ZVEJA_SHIFT_TIME = 32_400_000; // 9h

const use: UsableItemFunc = async (i) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await syncFishing(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  if (!user.fishing.futureFishList) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Lai izmantotu smilšu pulksteni, tev ir jābūt aktīvai zvejai ` + 
      `(brīvai vietai copes inventārā un salabotai makšķere)`
    ));
  }

  const { ok } = await mongoTransaction((session) => [
    () => addItems(userId, guildId, { smilsu_pulkstenis: -1 }, session),
    () => syncFishing(userId, guildId, false, false, ZVEJA_SHIFT_TIME, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  // prettier-ignore
  intReply(i, mainEmbed({
    i,
    color: commandColors.izmantot,
    title: izmantotTitle("smilsu_pulkstenis"),
    description: `Zvejošanas laiks maģiski tika pārbīdīts uz priekšu par \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
  }));
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
  use,
});

export default smilsu_pulkstenis;
