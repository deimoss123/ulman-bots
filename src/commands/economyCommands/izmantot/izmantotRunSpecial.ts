import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import Item, { AttributeItem, NotSellableItem } from '../../../interfaces/Item';
import UsableItemReturn from '../../../interfaces/UsableItemReturn';
import { SpecialItemInProfile } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import { attributeItemSort } from '../inventars';

function makeComponents(itemsInInv: SpecialItemInProfile[], itemObj: AttributeItem, selectedId?: string) {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('izmantot_special_confirm')
      .setDisabled(!selectedId)
      .setLabel('Izmantot')
      .setStyle(selectedId ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  if (itemObj.useMany) {
    const usableItems = itemsInInv.filter(({ attributes }) => itemObj.useMany!.filter(attributes));

    if (usableItems.length) {
      buttonRow.addComponents(
        new ButtonBuilder()
          .setCustomId('izmantot_special_many')
          .setLabel(`Izmantot visus (${usableItems.length}/${itemsInInv.length})`)
          .setStyle(ButtonStyle.Primary)
      );
    }
  }

  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('izmantot_special_select')
        .setPlaceholder('Izvēlies kuru izmantot')
        .setOptions(
          itemsInInv
            .slice(0, 25)
            .sort((a, b) => {
              const valueA = itemObj.customValue ? itemObj.customValue(a.attributes) : itemObj.value;
              const valueB = itemObj.customValue ? itemObj.customValue(b.attributes) : itemObj.value;
              if (valueA === valueB) {
                return attributeItemSort(a.attributes, b.attributes, itemObj.sortBy);
              }

              return valueB - valueA;
            })
            .map(item => ({
              label: itemStringCustom(itemObj, item.attributes?.customName),
              description: displayAttributes(item, true),
              value: item._id!,
              emoji: (itemObj.customEmoji ? itemObj.customEmoji(item.attributes) : itemObj.emoji) || '❓',
              default: selectedId === item._id,
            }))
        )
    ),
    buttonRow,
  ];
}

function makeEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemObj: Item,
  selectedItem: SpecialItemInProfile,
  useRes: Extract<UsableItemReturn, { text: string }>,
  embedColor: number
) {
  return embedTemplate({
    i,
    color: embedColor,
    title: `Izmantot: ${itemString(itemObj, null, true, selectedItem.attributes)}`,
    description: useRes.text,
    fields: useRes.fields || [],
  });
}

export default async function izmantotRunSpecial(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem | NotSellableItem;
  let selectedItemId = '';

  if (itemsInInv.length === 1) {
    const selectedItem = itemsInInv[0];
    const useRes = await itemObj.use(userId, guildId, itemKey, selectedItem);
    if ('error' in useRes) return intReply(i, errorEmbed);
    if ('custom' in useRes) return useRes.custom(i, embedColor);
    return intReply(i, makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
  }

  const msg = await intReply(
    i,
    embedTemplate({
      i,
      color: embedColor,
      description:
        `Tavā inventārā ir **${itemString(itemObj, itemsInInv.length)}**\n` +
        `No saraksta izvēlies kuru tu gribi izmantot`,
      components: makeComponents(itemsInInv, itemObj),
    })
  );

  if (!msg) return;

  buttonHandler(
    i,
    'izmantot',
    msg,
    async int => {
      const { customId } = int;

      if (customId === 'izmantot_special_select') {
        if (int.componentType !== ComponentType.StringSelect) return;
        selectedItemId = int.values[0]!;
        return {
          edit: {
            components: makeComponents(itemsInInv, itemObj, selectedItemId),
          },
        };
      }

      if (int.componentType !== ComponentType.Button) return;

      if (customId === 'izmantot_special_confirm') {
        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const selectedItem = user.specialItems.find(item => item._id === selectedItemId);
        if (!selectedItem) {
          return {
            after: () => {
              intReply(int, ephemeralReply('Tavs inventāra saturs ir mainījies, šī manta nav tavā inventārā'));
            },
          };
        }

        const useRes = await itemObj.use(userId, guildId, itemKey, selectedItem);

        return {
          end: true,
          after: () => {
            if ('error' in useRes) return intReply(int, errorEmbed);
            if ('custom' in useRes) return useRes.custom(int, embedColor);

            intReply(int, makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
          },
        };
      }

      if (customId === 'izmantot_special_many') {
        if (!itemObj.useMany) return;

        return {
          end: true,
          after: () => itemObj.useMany!.runFunc(int),
        };
      }
    },
    60000
  );
}
