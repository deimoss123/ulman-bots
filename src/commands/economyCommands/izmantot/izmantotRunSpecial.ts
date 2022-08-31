import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import Item from '../../../interfaces/Item';
import UsableItemReturn from '../../../interfaces/UsableItemReturn';
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
  useRes: UsableItemReturn,
  embedColor: number
) {
  return embedTemplate({
    i,
    color: embedColor,
    fields: [
      {
        name: `Izmantot: ${itemString(itemObj, null, true, selectedItem.attributes?.customName)}`,
        value: useRes.text,
        inline: false,
      },
      ...(useRes.fields || []),
    ],
  });
}

export default async function izmantotRunSpecial(
  i: CommandInteraction | ButtonInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number
): Promise<any> {
  const itemObj = itemList[itemKey];
  let selectedItemId = '';

  if (itemsInInv.length === 1) {
    const selectedItem = itemsInInv[0];
    const useRes = await itemObj.use!(i.user.id, selectedItem);
    if (useRes.custom) return useRes.custom(i, embedColor);
    return i.reply(makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
  }

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

  await buttonHandler(
    i,
    'izmantot',
    msg,
    async (componentInteraction) => {
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

        const user = await findUser(i.user.id);
        if (!user) return;

        const selectedItem = user.specialItems.find((item) => item._id === selectedItemId);
        if (!selectedItem) {
          return {
            after: async () => {
              await componentInteraction.reply(
                ephemeralReply('Tavs inventāra saturs ir mainījies, šī manta nav tavā inventārā')
              );
            },
          };
        }

        const useRes = await itemObj.use!(i.user.id, selectedItem);

        return {
          end: true,
          after: async () => {
            if (useRes.custom) return useRes.custom(componentInteraction, embedColor);
            await componentInteraction.reply(
              makeEmbed(i, itemObj, selectedItem, useRes, embedColor)
            );
          },
        };
      }
    },
    60000
  );
}
