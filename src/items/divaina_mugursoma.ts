import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import increaseInvCap from "@/db/increaseInvCap";
import { INCREASE_CAP_1 } from "@/items/mugursoma";
import { UsableItemFunc, item, UsableItem, TirgusItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemList from "@/utils/itemList";
import itemString from "@/utils/strings/itemString";

export const INCREASE_CAP_2 = 200;
export const INV_NCREASE_AMOUNT_2 = 10;

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  if (user.itemCap < INCREASE_CAP_1) {
    return {
      text:
        `Tu nevari izmantot ${itemString(itemList.divaina_mugursoma, null, true)}, ` +
        `jo neesi sasniedzis **${INCREASE_CAP_1}** inventāra maksimālo ietilpību, ` +
        `ko iegūst izmantojot ${itemString(itemList.mugursoma, null, false)}`,
    };
  }

  if (user.itemCap >= INCREASE_CAP_2) {
    return {
      text:
        `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
        `${itemString(itemList.divaina_mugursoma, null, true)}: **${INCREASE_CAP_2}** vietas\n`,
    };
  }

  await addItems(userId, guildId, { divaina_mugursoma: -1 });
  await increaseInvCap(userId, guildId, INV_NCREASE_AMOUNT_2);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${user.itemCap + INV_NCREASE_AMOUNT_2}**`,
  };
};

const divaina_mugursoma = item<UsableItem & TirgusItem>({
  info:
    `Tu esi izmantojis parastās mugursomas un sasniedzis ${INCREASE_CAP_1} vietas inventārā\n` +
    `Ar dīvaino mugursomu tu vari palielināt inventāra iepilpību par **${INV_NCREASE_AMOUNT_2}** (līdz **${INCREASE_CAP_2}** vietām)`,
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
  removedOnUse: false,
  use,
});

export default divaina_mugursoma;
