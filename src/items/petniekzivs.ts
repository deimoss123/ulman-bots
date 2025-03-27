import { statusList } from "@/commands/profils";
import addStatus from "@/db/addStatus";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
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
  removedOnUse: true,
  use: async (userId, guildId) => {
    const user = await addStatus(userId, guildId, { veiksmigs: PETNIEKZIVS_STATUS_TIME });
    if (!user) return { error: true };

    return {
      text:
        `Tu apēdi pētniekzivi un ieguvi statusu **"${statusList.veiksmigs}"**\n` +
        `Tev tagad ir palielināti procenti feniksam, ruletei un loto biļetēm: \n` +
        `\`\`\`${millisToReadableTime(user.status.veiksmigs - Date.now())}\`\`\``,
    };
  },
});

export default petniekzivs;
