import addItems from "@/db/addItems";
import increaseInvCap from "@/db/increaseInvCap";
import { INCREASE_CAP_1 } from "@/items/mugursoma";
import { UsableItemFunc, item, UsableItem, TirgusItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";

export const INCREASE_CAP_2 = 200;
export const INV_INCREASE_AMOUNT_2 = 10;

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  if (user.itemCap < INCREASE_CAP_1) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tu nevari izmantot **${itemString("divaina_mugursoma", null, true)}**, ` +
      `jo neesi sasniedzis **${INCREASE_CAP_1}** inventāra maksimālo ietilpību, ` +
      `ko iegūst izmantojot **${itemString("mugursoma", null, false)}**`
    ));
  }

  if (user.itemCap >= INCREASE_CAP_2) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
      `${itemString("divaina_mugursoma", null, true)}: **${INCREASE_CAP_2}** vietas`
    ));
  }

  const { ok, values } = await mongoTransaction((session) => [
    () => addItems(userId, guildId, { divaina_mugursoma: -1 }, session),
    () => increaseInvCap(userId, guildId, INV_INCREASE_AMOUNT_2, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  // prettier-ignore
  return intReply(i, mainEmbed({
    i,
    color: commandColors.izmantot,
    title: izmantotTitle("divaina_mugursoma"),
    description: 
      `Inventāra maksimālā ietilpība palielināta ` + 
      `no **${user.itemCap}** uz **${values.at(-1)!.itemCap}**`,
  }));
};

const divaina_mugursoma = item<UsableItem & TirgusItem>({
  info:
    `Tu esi izmantojis parastās mugursomas un sasniedzis ${INCREASE_CAP_1} vietas inventārā\n` +
    `Ar dīvaino mugursomu tu vari palielināt inventāra iepilpību par **${INV_INCREASE_AMOUNT_2}** (līdz **${INCREASE_CAP_2}** vietām)`,
  addedInVersion: "4.0",
  nameNomVsk: "dīvainā mugursoma",
  nameNomDsk: "dīvainās mugursomas",
  nameAkuVsk: "dīvaino mugursomu",
  nameAkuDsk: "dīvainās mugursomas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("divaina_mugursoma"),
  imgLink: "https://www.ulmanbots.lv/images/items/divaina_mugursoma.gif",
  categories: [ItemCategory.TIRGUS],
  tirgusPrice: { items: { mugursoma: 3 } },
  value: 500,
  use,
});

export default divaina_mugursoma;
