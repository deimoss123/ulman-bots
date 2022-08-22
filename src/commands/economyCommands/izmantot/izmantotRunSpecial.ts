import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import Item from '../../../interfaces/Item';
import { SpecialItemInProfile } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';

function makeComponents(itemsInInv: SpecialItemInProfile[], itemObj: Item, selectedId?: string) {
  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('izmantot_special_select')
        .setPlaceholder('Izvēlies kuru izmantot')
        .setOptions(
          itemsInInv.map((item) => ({
            label: itemStringCustom(itemObj, item.attributes?.customName),
            // description: item._id!,
            description: displayAttributes(item, true),
            value: item._id!,
            emoji: itemObj.emoji || '❓',
            default: selectedId === item._id,
          }))
        )
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('izmantot_special_confirm')
        .setDisabled(!selectedId)
        .setLabel('Izmantot')
        .setStyle(selectedId ? ButtonStyle.Primary : ButtonStyle.Secondary)
    ),
  ];
}

export default async function izmantotRunSpecial(
  i: CommandInteraction | ButtonInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number
): Promise<any> {
  const itemObj = itemList[itemKey];
  let selectedItemId = '';

  if (itemsInInv.length > 1) {
    const msg = await i.reply(
      embedTemplate({
        i,
        color: embedColor,
        description:
          `Tavā inventārā ir ${itemString(itemObj, itemsInInv.length)}\n` +
          `No saraksta izvēlies kuru tu gribi izmantot`,
        components: makeComponents(itemsInInv, itemObj),
      })
    );
    await buttonHandler(i, 'izmantot', msg, async (componentInteraction) => {
      const { customId } = componentInteraction;
      if (customId === 'izmantot_special_select') {
        if (componentInteraction.componentType !== ComponentType.SelectMenu) return;
        selectedItemId = componentInteraction.values[0]!;
        return {
          edit: {
            components: makeComponents(itemsInInv, itemObj, selectedItemId),
          },
        };
      } else if (customId === 'izmantot_special_confirm') {
        if (componentInteraction.componentType !== ComponentType.Button) return;
        const selectedItem = itemsInInv.find((item) => item._id === selectedItemId);
        if (!selectedItem) return;
        const useRes = await itemObj.use!(i.user.id, selectedItem);
        return {
          end: true,
          edit: {
            embeds: embedTemplate({
              i,
              color: embedColor,
              fields: [
                {
                  name: `Izmantot: ${itemString(
                    itemObj,
                    null,
                    true,
                    selectedItem.attributes?.customName
                  )}`,
                  value: useRes.text,
                  inline: false,
                },
              ],
            }).embeds,
            components: [],
          },
        };
      }
    });
  }
}
