import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import addStatus from "@/db/addStatus";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";

export const PETNIEKZIVS_STATUS_TIME = 900_000; // 15 min

const petniekzivs = item<UsableItem>({
  info:
    "__**Šodien paveiksies!**__\n\n" +
    `Apēdot (izmantojot) šo zivi tu saņemsi statusu **"${statusList.veiksmigs}"** ` +
    `uz \`${millisToReadableTime(PETNIEKZIVS_STATUS_TIME)}\`, ` +
    `kas palielina feniksa, ruletes un loto biļešu procentus`,
  addedInVersion: "4.1",
  nameNomVsk: "pētniekzivs",
  nameNomDsk: "pētniekzivis",
  nameAkuVsk: "pētniekzivi",
  nameAkuDsk: "pētniekzivis",
  isVirsiesuDzimte: false,
  emoji: () => emoji("petniekzivs"),
  imgLink: "https://www.ulmanbots.lv/images/items/petniekzivs.png",
  categories: [ItemCategory.ZIVIS],
  value: 40,
  use: async (i) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const { ok, values } = await mongoTransaction((session) => [
      () => addItems(userId, guildId, { petniekzivs: -1 }, session),
      () => addStatus(userId, guildId, { veiksmigs: PETNIEKZIVS_STATUS_TIME }, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("petniekzivs"),
      description: 
        `Tu apēdi pētniekzivi un ieguvi statusu **"${statusList.veiksmigs}"**\n` +
        `Tev tagad ir palielināti procenti feniksam, ruletei un loto biļetēm: \n` +
        `\`\`\`${millisToReadableTime(values.at(-1)!.status.veiksmigs - Date.now())}\`\`\``,
    }));
  },
});

export default petniekzivs;
