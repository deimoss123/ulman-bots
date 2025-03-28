import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import addStatus from "@/db/addStatus";
import { JURIDISKA_ZIVS_STATUS } from "@/items/juridiska_zivs";
import { NAZIS_STATUS_TIME } from "@/items/nazis";
import { PETNIEKZIVS_STATUS_TIME } from "@/items/petniekzivs";
import { RASENS_STATUS_TIME } from "@/items/zemenu_rasens";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import { UserStatusName } from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

const divainaZivsStatuses: Record<UserStatusName, number> = {
  aizsargats: RASENS_STATUS_TIME / 2,
  laupitajs: NAZIS_STATUS_TIME / 2,
  juridisks: JURIDISKA_ZIVS_STATUS / 3,
  veiksmigs: PETNIEKZIVS_STATUS_TIME,
};

const divaina_zivs = item<UsableItem>({
  info: "Šī zivs garšo nedaudz _dīvaini_, apēd (izmanto) to lai iegūtu vienu nejauši izvēlētu statusu",
  addedInVersion: "4.0",
  nameNomVsk: "dīvainā zivs",
  nameNomDsk: "dīvainās zivis",
  nameAkuVsk: "dīvaino zivi",
  nameAkuDsk: "dīvainās zivis",
  isVirsiesuDzimte: false,
  emoji: () => emoji("divaina_zivs"),
  imgLink: "https://www.ulmanbots.lv/images/items/divaina_zivs.gif",
  categories: [ItemCategory.ZIVIS],
  value: 60,
  use: async (i) => {
    const statusEntry = Object.entries(divainaZivsStatuses)[
      Math.floor(Math.random() * Object.keys(divainaZivsStatuses).length)
    ] as [UserStatusName, number];

    const statusToAdd = Object.fromEntries([statusEntry]);

    const userId = i.user.id;
    const guildId = i.guildId!;

    const { ok, values } = await mongoTransaction((session) => [
      () => addItems(userId, guildId, { divaina_zivs: -1 }, session),
      () => addStatus(userId, guildId, statusToAdd, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("divaina_zivs"),
      description: 
        `Apēdot dīvaino zivi tu ieguvi statusu **"${statusList[statusEntry[0]]}"**, statusa ilgums:\n` +
        `\`\`\`${millisToReadableTime(values.at(-1)!.status[statusEntry[0]] - Date.now())}\`\`\``,
    }));
  },
});

export default divaina_zivs;
