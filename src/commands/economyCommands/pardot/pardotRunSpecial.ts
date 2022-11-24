import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SelectMenuBuilder,
} from 'discord.js';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setStats from '../../../economy/stats/setStats';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import { AttributeItem } from '../../../interfaces/Item';
import UserProfile, { SpecialItemInProfile } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import { attributeItemSort } from '../inventars';
import { PIRKT_PARDOT_NODOKLIS } from './pardot';

function makeComponents(itemsInInv: SpecialItemInProfile[], itemObj: AttributeItem, selectedIds: string[]) {
  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('pardot_special_select')
        .setPlaceholder('Izvēlies ko pārdot')
        .setMinValues(1)
        .setMaxValues(itemsInInv.length)
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
              description:
                `${latiString(
                  'customValue' in itemObj && itemObj.customValue ? itemObj.customValue(item.attributes) : itemObj.value
                )} | ` + displayAttributes(item, true),
              value: item._id!,
              emoji: (itemObj.customEmoji ? itemObj.customEmoji(item.attributes) : itemObj.emoji) || '❓',
              default: !!selectedIds.length && selectedIds!.includes(item._id!),
            }))
        )
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('pardot_special_confirm')
        .setDisabled(!selectedIds.length)
        .setLabel('Pārdot')
        .setStyle(selectedIds.length ? ButtonStyle.Primary : ButtonStyle.Secondary)
    ),
  ];
}

function makeEmbed(
  i: ChatInputCommandInteraction,
  user: UserProfile,
  soldItems: SpecialItemInProfile[],
  soldValue: number,
  color: number
) {
  return embedTemplate({
    i,
    title: 'Tu pārdevi:',
    color,
    fields: [
      ...soldItems.map(item => ({
        name: itemString(itemList[item.name], null, false, item.attributes),
        value: displayAttributes(item),
        inline: false,
      })),
      { name: 'Tu ieguvi', value: latiString(soldValue, true), inline: true },
      { name: 'Tev tagad ir', value: latiString(user.lati), inline: true },
    ],
  });
}

export default async function pardotRunSpecial(
  i: ChatInputCommandInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem;
  let selectedIds: string[] = [];

  if (itemsInInv.length === 1) {
    const soldValue =
      'customValue' in itemObj && itemObj.customValue ? itemObj.customValue(itemsInInv[0].attributes) : itemObj.value;

    const taxPaid = Math.floor(soldValue * PIRKT_PARDOT_NODOKLIS);

    await Promise.all([
      addLati(i.client.user!.id, guildId, taxPaid),
      addLati(userId, guildId, soldValue),
      setStats(userId, guildId, { soldShop: soldValue, taxPaid }),
    ]);

    const user = await removeItemsById(userId, guildId, [itemsInInv[0]._id!]);
    if (!user) return intReply(i, errorEmbed);

    return intReply(i, makeEmbed(i, user, itemsInInv, soldValue, embedColor));
  }

  const msg = await intReply(
    i,
    embedTemplate({
      i,
      color: embedColor,
      description:
        `Tavā inventārā ir **${itemString(itemObj, itemsInInv.length)}**\n` +
        `No saraksta izvēlies vienu vai vairākas mantas kuras pārdot`,
      components: makeComponents(itemsInInv, itemObj, selectedIds),
    })
  );

  if (!msg) return;

  buttonHandler(
    i,
    'pardot',
    msg,
    async int => {
      const { customId } = int;
      if (customId === 'pardot_special_select') {
        if (int.componentType !== ComponentType.StringSelect) return;
        selectedIds = int.values;
        return {
          edit: {
            components: makeComponents(itemsInInv, itemObj, selectedIds),
          },
        };
      } else if (customId === 'pardot_special_confirm') {
        if (int.componentType !== ComponentType.Button) return;
        const selectedItems = itemsInInv.filter(item => selectedIds.includes(item._id!));
        const soldValue = selectedItems.reduce((p, { attributes }) => {
          return (
            p + ('customValue' in itemObj && itemObj.customValue ? itemObj.customValue(attributes) : itemObj.value)
          );
        }, 0);

        if (!selectedItems.length) return;

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const userItemIds = user.specialItems.map(item => item._id!);
        for (const id of selectedIds) {
          if (!userItemIds.includes(id)) {
            return {
              end: true,
              after: () => {
                intReply(
                  int,
                  ephemeralReply(
                    '**Kļūda:** tavs inventāra saturs ir mainījies, kāda no izvēlētām mantām vairs nav tavā inventārā'
                  )
                );
              },
            };
          }
        }

        const taxPaid = Math.floor(soldValue * PIRKT_PARDOT_NODOKLIS);

        await Promise.all([
          addLati(i.client.user!.id, guildId, taxPaid),
          addLati(userId, guildId, soldValue),
          setStats(userId, guildId, { soldShop: soldValue, taxPaid }),
        ]);

        const userAfter = await removeItemsById(userId, guildId, selectedIds);
        if (!userAfter) return { error: true };

        return {
          edit: {
            embeds: makeEmbed(i, userAfter, selectedItems, soldValue, embedColor).embeds,
            components: [],
          },
        };
      }
    },
    60000
  );
}
