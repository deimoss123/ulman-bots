import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import UserProfile, { ItemAttributes } from "@/types/UserProfile";
import itemList, { ItemKey } from "@/items/itemList";
import { AttributeItem } from "@/types/Item";
import { attributeItemSort } from "@/commands/inventars/inventars";
import itemString, { itemStringCustom } from "@/utils/strings/itemString";
import { displayAttributes } from "@/utils/strings/displayAttributes";
import { DialogsOnClickCallbackReturn } from "@/utils/dialogs";
import intReply from "@/utils/intReply";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import commandColors from "@/utils/commandColors";

export function useDifferentItemSelectMenu(
  user: UserProfile,
  itemKey: ItemKey,
  currentItemId: string,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const itemObj = itemList[itemKey] as AttributeItem<ItemAttributes>;

  const row = new ActionRowBuilder<StringSelectMenuBuilder>();

  row.addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("use_different")
      .setPlaceholder(`Izmantot citu ${itemObj.nameAkuVsk}`)
      .addOptions(
        user.specialItems
          .filter((item) => item.name === itemKey && item._id !== currentItemId)
          .slice(0, 25)
          .toSorted((a, b) => {
            const valueA = itemObj.customValue ? itemObj.customValue(a.attributes) : itemObj.value;
            const valueB = itemObj.customValue ? itemObj.customValue(b.attributes) : itemObj.value;
            if (valueA === valueB) {
              return attributeItemSort(a.attributes, b.attributes, itemObj.sortBy);
            }

            return valueB - valueA;
          })
          .map((item) => ({
            label: itemStringCustom(itemObj, item.attributes?.customName),
            description: displayAttributes(item, true),
            value: item._id!,
            emoji: (itemObj.customEmoji ? itemObj.customEmoji(item.attributes) : itemObj.emoji()) || "❓",
          })),
      ),
  );

  return row;
}

export function useDifferentItemHandler(
  user: UserProfile,
  itemKey: ItemKey,
  interaction: StringSelectMenuInteraction,
): DialogsOnClickCallbackReturn {
  const itemObj = itemList[itemKey] as AttributeItem<ItemAttributes>;
  const itemId = interaction.values[0];
  const itemInInv = user.specialItems.find((item) => item._id === itemId);

  if (!itemInInv) {
    intReply(
      interaction,
      ephemeralReply(
        `Tavs inventāra saturs ir mainījies, ${itemObj.isVirsiesuDzimte ? "šis" : "šī"} ` +
          `**${itemString(itemKey)}** vairs nav tavā inventārā`,
      ),
    );
    return { edit: true };
  }

  return {
    end: true,
    after: async () => {
      const useRes = await itemObj.use(interaction.user.id, interaction.guildId!, itemKey, itemInInv);

      // @ts-expect-error
      useRes.custom(interaction, commandColors.izmantot);
    },
  };
}
