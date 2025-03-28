import { RepliableInteraction } from "discord.js";
import findUser from "@/db/findUser";
import errorEmbed from "@/utils/embeds/errorEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import itemString from "@/utils/strings/itemString";
import itemList, { ItemKey } from "@/utils/itemList";
import izmantotRunSpecial from "@/commands/izmantot/izmantotRunSpecial";
import intReply from "@/utils/intReply";

export default async function izmantotRun(i: RepliableInteraction, itemToUseKey: ItemKey): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  const { items, specialItems } = user;

  const itemToUse = itemList[itemToUseKey];

  // drošības pārbaude
  if (!("use" in itemToUse)) {
    return intReply(
      i,
      ephemeralReply(
        `**${itemString(itemToUse)}** nav ` + (itemToUse.isVirsiesuDzimte ? "izmantojams" : "izmantojama"),
      ),
    );
  }

  // izmantot atribūtu mantu
  if ("defaultAttributes" in itemToUse) {
    const specialItemsInInv = specialItems.filter(({ name }) => name === itemToUseKey);
    if (!specialItemsInInv.length) {
      return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
    }

    return izmantotRunSpecial(i, itemToUseKey, specialItemsInInv, user);
  }

  // pārbauda vai ir inventārā
  const itemInInv = items.find(({ name }) => name === itemToUseKey);
  if (!itemInInv) {
    return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
  }

  // izmantot parasto mantu
  itemToUse.use(i, user, itemToUseKey);
}
