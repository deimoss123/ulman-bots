import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import addSpecialItems from '../../../economy/addSpecialItems';
import removeItemsById from '../../../economy/removeItemsById';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import Item from '../../../interfaces/Item';
import UserProfile, { SpecialItemInProfile } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';

async function iedotSpecialQuery(
  i: CommandInteraction,
  targetUser: UserProfile,
  selectedItems: SpecialItemInProfile[]
) {
  const user = await removeItemsById(
    i.user.id,
    selectedItems.map((item) => item._id!)
  );
  await addSpecialItems(targetUser.userId, selectedItems);
  return user;
}

function makeEmbed(
  i: CommandInteraction,
  user: UserProfile,
  targetUser: UserProfile,
  itemsToGive: SpecialItemInProfile[],
  color: number
) {
  return embedTemplate({
    i,
    color,
    content: `<@${targetUser.userId}>`,
    description: `<@${targetUser.userId}> tu iedevi:`,
    fields: [
      ...itemsToGive.map((item) => ({
        name: itemString(itemList[item.name], null, true, item.attributes.customName),
        value: displayAttributes(item),
        inline: false,
      })),
    ],
  });
}

function makeComponents(
  itemsInInv: SpecialItemInProfile[],
  itemObj: Item,
  selectedItems: SpecialItemInProfile[]
) {
  const selectedIds = selectedItems.map((item) => item._id!);
  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('iedot_special_select')
        .setPlaceholder('Izvēlies ko iedot')
        .setMinValues(1)
        .setMaxValues(itemsInInv.length)
        .setOptions(
          itemsInInv.map((item) => ({
            label: itemStringCustom(itemObj, item.attributes?.customName),
            description: displayAttributes(item, true),
            value: item._id!,
            emoji: itemObj.emoji || '❓',
            default: !!selectedIds.length && selectedIds!.includes(item._id!),
          }))
        )
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('iedot_special_confirm')
        .setDisabled(!selectedIds.length)
        .setLabel('Iedot')
        .setStyle(selectedIds.length ? ButtonStyle.Primary : ButtonStyle.Secondary)
    ),
  ];
}

export default async function iedotRunSpecial(
  i: CommandInteraction,
  targetUser: UserProfile,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number
) {
  const itemObj = itemList[itemKey];
  let selectedItems: SpecialItemInProfile[] = [];

  if (itemsInInv.length === 1) {
    const user = await iedotSpecialQuery(i, targetUser, itemsInInv);
    if (!user) return i.reply(errorEmbed);

    return i.reply(makeEmbed(i, user, targetUser, selectedItems, embedColor));
  }

  const msg = await i.reply(
    embedTemplate({
      i,
      color: embedColor,
      content: `<@${targetUser.userId}>`,
      description:
        `Tavā inventārā ir ${itemString(itemObj, itemsInInv.length)}\n` +
        `No saraksta izvēlies vienu vai vairākas mantas ko iedot <@${targetUser.userId}>`,
      components: makeComponents(itemsInInv, itemObj, selectedItems),
    })
  );

  await buttonHandler(
    i,
    'iedot',
    msg,
    async (componentInteraction) => {
      const { customId } = componentInteraction;
      if (customId === 'iedot_special_select') {
        if (componentInteraction.componentType !== ComponentType.SelectMenu) return;
        selectedItems = itemsInInv.filter((item) =>
          componentInteraction.values.includes(item._id!)
        );
        return {
          edit: {
            components: makeComponents(itemsInInv, itemObj, selectedItems),
          },
        };
      } else if (customId === 'iedot_special_confirm') {
        if (componentInteraction.componentType !== ComponentType.Button) return;
        if (!selectedItems.length) return;

        const user = await iedotSpecialQuery(i, targetUser, selectedItems);
        if (!user) return;

        return {
          edit: {
            embeds: makeEmbed(i, user, targetUser, selectedItems, embedColor).embeds,
            components: [],
          },
        };
      }
    },
    60000
  );
}
