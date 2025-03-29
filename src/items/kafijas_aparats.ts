import addItems from "@/db/addItems";
import editItemAttribute from "@/db/editItemAttribute";
import editMultipleItemAttributes from "@/db/editMultipleItemAttributes";
import findUser from "@/db/findUser";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import { UseManyType, item, AttributeItem, TirgusItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemList from "@/utils/itemList";
import itemString from "@/utils/strings/itemString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import wrapString from "@/utils/strings/wrapString";

// 24 stundas
export const KAFIJAS_APARATS_COOLDOWN = 86_400_000;

const useMany: UseManyType = {
  filter: ({ lastUsed }) => lastUsed! + KAFIJAS_APARATS_COOLDOWN < Date.now(),
  async runFunc(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const usableItems = user.specialItems.filter(
      ({ name, attributes }) => name === "kafijas_aparats" && this.filter(attributes),
    );

    if (!usableItems.length) {
      return intReply(i, ephemeralReply(`Tev nav neviens izmantojams **${itemString("kafijas_aparats")}**`));
    }

    const coffeeCount = usableItems.length;

    const freeSlots = countFreeInvSlots(user);
    if (freeSlots < coffeeCount) {
      return intReply(
        i,
        ephemeralReply(
          `Lai saņemtu kafijas tev vajag vismaz **${coffeeCount}** brīvas vietas inventārā\n` +
            `Tev ir **${freeSlots}** brīvas vietas`,
        ),
      );
    }

    const res = await editMultipleItemAttributes(
      userId,
      guildId,
      usableItems.map(({ _id, attributes }) => ({
        itemId: _id!,
        newAttributes: { ...attributes, lastUsed: Date.now() },
      })),
    );
    const userAfter = await addItems(userId, guildId, { kafija: coffeeCount });

    if (!res || !userAfter) return intReply(i, errorEmbed);

    intReply(
      i,
      mainEmbed({
        i,
        color: commandColors.izmantot,
        title: `Izmantot ${itemString("kafijas_aparats", usableItems.length, true)}`,
        fields: [
          {
            name: "Tu uztaisīji",
            value: itemString("kafija", coffeeCount, true),
            inline: true,
          },
          {
            name: "Tev tagad ir",
            value: itemString("kafija", userAfter.items.find(({ name }) => name === "kafija")?.amount || 0),
            inline: true,
          },
        ],
      }),
    );
  },
};

// TODO: sakārtot smukāk
const use: UsableAttributeItemFunc = async (i, user, _, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  console.log("viens");

  const lastUsed = specialItem.attributes.lastUsed!;
  if (Date.now() - lastUsed < KAFIJAS_APARATS_COOLDOWN) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tu nevari uztaisīt ${itemString(itemList.kafija, null, true)}, jo tā tiek gatavota\n` +
      `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - Date.now() + lastUsed)}\``,
    ))
  }

  console.log("divi");
  if (!countFreeInvSlots(user)) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Lai uztaisītu **${itemString(itemList.kafija, null, true)}** ` +
      `tev ir nepieciešama vismaz **1** brīva vieta inventārā`,
    ))
  }

  console.log("trīs");
  const { ok, values } = await mongoTransaction((session) => [
    () => editItemAttribute(userId, guildId, specialItem._id!, { lastUsed: Date.now() }, session),
    () => addItems(userId, guildId, { kafija: 1 }, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  const itemCount = values[1].items.find((item) => item.name === "kafija")?.amount || 1;

  return intReply(
    i,
    mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("kafijas_aparats"),
      description: `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - 1)}\``,
      fields: [
        {
          name: "Tu uztaisīji",
          value: `${itemString(itemList.kafija, 1, true)}`,
          inline: true,
        },
        {
          name: "Tev tagad ir",
          value: `${itemString(itemList.kafija, itemCount)}`,
          inline: true,
        },
      ],
    }),
  );
};

type Attributes = {
  lastUsed: number;
};

const kafijas_aparats = item<AttributeItem<Attributes> & TirgusItem>({
  info:
    `Kafijas aparāts ik \`24h\` uztaisīs kafiju, kuru var iegūt kafijas aparātu izmantojot\n\n` +
    "_Nevienam vēljoprojām nav zināms kā šis kafijas aparāts ir spējīgs bezgalīgi taisīt kafiju bez pupiņām, vai ūdens, vai ... elektrības_",
  addedInVersion: "4.0",
  nameNomVsk: "kafijas aparāts",
  nameNomDsk: "kafijas aparāti",
  nameAkuVsk: "kafijas aparātu",
  nameAkuDsk: "kafijas aparātus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("kafijas_aparats"),
  imgLink: "https://www.ulmanbots.lv/images/items/kafijas_aparats.png",
  categories: [ItemCategory.TIRGUS],
  value: 200,
  tirgusPrice: { items: { kafija: 15, metalluznis: 3 } },
  defaultAttributes: () => ({
    lastUsed: 0,
  }),
  displayAttributes: ({ lastUsed }, inline, currTime) => {
    if (currTime - lastUsed >= KAFIJAS_APARATS_COOLDOWN) {
      return wrapString("Kafija gatava!", "**", !inline);
    }

    const timeStr = millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - currTime + lastUsed);
    return `Gatavo: ${wrapString(timeStr, "`", !inline)}`;
  },
  sortBy: (attrA, attrB) => attrA.lastUsed - attrB.lastUsed,
  use,
  useMany,
});

export default kafijas_aparats;
