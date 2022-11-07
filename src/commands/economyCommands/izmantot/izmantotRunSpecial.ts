import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  CommandInteraction,
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

function makeComponents(itemsInInv: SpecialItemInProfile[], itemObj: AttributeItem, selectedId?: string) {
  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('izmantot_special_select')
        .setPlaceholder('Izvēlies kuru izmantot')
        .setOptions(
          itemsInInv
            .slice(0, 25)
            .sort((a, b) =>
              itemObj.customValue ? itemObj.customValue(b.attributes) - itemObj.customValue(a.attributes) : 0
            )
            .map(item => ({
              label: itemStringCustom(itemObj, item.attributes?.customName),
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

function makeEmbed(
  i: CommandInteraction | ButtonInteraction,
  itemObj: Item,
  selectedItem: SpecialItemInProfile,
  useRes: Extract<UsableItemReturn, { text: string }>,
  embedColor: number
) {
  return embedTemplate({
    i,
    color: embedColor,
    title: `Izmantot: ${itemString(itemObj, null, true, selectedItem.attributes?.customName)}`,
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
    if ('error' in useRes) return i.reply(errorEmbed);
    if ('custom' in useRes) return useRes.custom(i, embedColor);
    return i.reply(makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
  }

  const msg = await i.reply(
    embedTemplate({
      i,
      color: embedColor,
      description:
        `Tavā inventārā ir **${itemString(itemObj, itemsInInv.length)}**\n` +
        `No saraksta izvēlies kuru tu gribi izmantot`,
      components: makeComponents(itemsInInv, itemObj),
    })
  );

  await buttonHandler(
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
      } else if (customId === 'izmantot_special_confirm') {
        if (int.componentType !== ComponentType.Button) return;

        const user = await findUser(userId, guildId);
        if (!user) return;

        const selectedItem = user.specialItems.find(item => item._id === selectedItemId);
        if (!selectedItem) {
          return {
            after: async () => {
              await int.reply(ephemeralReply('Tavs inventāra saturs ir mainījies, šī manta nav tavā inventārā'));
            },
          };
        }

        const useRes = await itemObj.use!(userId, guildId, itemKey, selectedItem);

        return {
          end: true,
          after: async () => {
            if ('error' in useRes) return int.reply(errorEmbed);
            if ('custom' in useRes) return useRes.custom(int, embedColor);

            int.reply(makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
          },
        };
      }
    },
    60000
  );
}
