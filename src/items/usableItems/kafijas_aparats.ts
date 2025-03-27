import addItems from "@/db/addItems";
import editItemAttribute from "@/db/editItemAttribute";
import editMultipleItemAttributes from "@/db/editMultipleItemAttributes";
import findUser from "@/db/findUser";
import commandColors from "@/utils/commandColors";
import embedTemplate from "@/utils/embeds/embedTemplate";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import itemString from "@/utils/strings/itemString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { UsableItemFunc, UseManyType } from "@/types/Item";
import intReply from "@/utils/intReply";
import countFreeInvSlots from "@/items/helpers/countFreeInvSlots";
import itemList from "@/items/itemList";

// 24 stundas
export const KAFIJAS_APARATS_COOLDOWN = 86_400_000;

export const kafijasAparatsUseMany: UseManyType = {
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
      embedTemplate({
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

const kafijas_aparats: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const lastUsed = specialItem!.attributes.lastUsed!;
  if (Date.now() - lastUsed < KAFIJAS_APARATS_COOLDOWN) {
    return {
      text:
        `Tu nevari uztaisīt ${itemString(itemList.kafija, null, true)}, jo tā tiek gatavota\n` +
        `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - Date.now() + lastUsed)}\``,
    };
  }
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  if (!countFreeInvSlots(user)) {
    return {
      text:
        `Lai uztaisītu **${itemString(itemList.kafija, null, true)}** ` +
        `tev ir nepieciešama vismaz **1** brīva vieta inventārā`,
    };
  }
  await editItemAttribute(userId, guildId, specialItem!._id!, { lastUsed: Date.now() });
  const userAfter = await addItems(userId, guildId, { kafija: 1 });
  if (!userAfter) return { error: true };

  const itemCount = userAfter.items.find((item) => item.name === "kafija")?.amount || 1;

  return {
    text: `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - 1)}\``,
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
  };
};

export default kafijas_aparats;
