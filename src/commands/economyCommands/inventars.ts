import Command from '../../interfaces/Command';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedField,
  User,
} from 'discord.js';
import embedTemplate from '../../embeds/embedTemplate';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemList from '../../items/itemList';
import latiString from '../../embeds/helpers/latiString';
import userString from '../../embeds/helpers/userString';
import countItems from '../../items/helpers/countItems';
import commandColors from '../../embeds/commandColors';
import itemString from '../../embeds/helpers/itemString';
import ephemeralReply from '../../embeds/ephemeralReply';
import UserProfile, { ItemAttributes, ItemInProfile, SpecialItemInProfile } from '../../interfaces/UserProfile';
import Item, { AttributeItem, NotSellableItem } from '../../interfaces/Item';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import buttonHandler from '../../embeds/buttonHandler';
import pardotRun from './pardot/pardotRun';
import iconEmojis from '../../embeds/iconEmojis';
import { INCREASE_CAP_1 } from '../../items/usableItems/mugursoma';
import { INCREASE_CAP_2 } from '../../items/usableItems/divaina_mugursoma';
import intReply from '../../utils/intReply';
import btnPaginationRow from '../../items/helpers/btnPaginationRow';

export type ItemType = 'not_usable' | 'usable' | 'special' | 'not_sellable';

export const itemTypes: Record<ItemType, { text: string; emoji: string }> = {
  not_sellable: {
    text: 'īpaša izmantojama un **nepārdodama** un manta',
    emoji: '<:check3:1017598453032943636>',
  },
  special: {
    text: 'izmantojama manta ar atribūtiem',
    emoji: '<:check2:1017601966555267132>',
  },
  usable: {
    text: 'izmantojama manta',
    emoji: iconEmojis.checkmark,
  },
  not_usable: {
    text: 'neizmantojama manta',
    emoji: iconEmojis.cross,
  },
};

export function attributeItemSort(
  attrA: ItemAttributes,
  attrB: ItemAttributes,
  sortByObj: Partial<Record<keyof ItemAttributes, 1 | -1>>,
  index = 0
): number {
  if (index >= Object.keys(sortByObj).length) return 0;

  const [currentAttr, sortDirection] = Object.entries(sortByObj)[index] as [keyof ItemAttributes, 1 | -1];
  const valueA = attrA[currentAttr];
  const valueB = attrB[currentAttr];

  if (valueA === valueB) {
    return attributeItemSort(attrA, attrB, sortByObj, index + 1);
  }

  switch (typeof valueA) {
    case 'string':
      return valueA ? -1 : 1;
    case 'number':
      return ((valueB as number) - valueA) * sortDirection;
    case 'boolean':
      return valueA ? -1 : 1;
  }

  return 0;
}

function mapItems({ items, specialItems }: UserProfile) {
  const itemTypesInInv = new Set<ItemType>();

  const specialItemsFields = specialItems
    .sort((a, b) => {
      const itemA = itemList[a.name] as AttributeItem | NotSellableItem;
      const itemB = itemList[b.name] as AttributeItem | NotSellableItem;

      if ('notSellable' in itemA === 'notSellable' in itemB) {
        const valueA = itemA.customValue ? itemA.customValue(a.attributes) : itemA.value;
        const valueB = itemB.customValue ? itemB.customValue(b.attributes) : itemB.value;

        if (a.name === b.name && valueA === valueB) {
          const { sortBy } = itemA;

          return attributeItemSort(a.attributes, b.attributes, sortBy);
        }

        return valueB - valueA;
      } else if ('notSellable' in itemB) {
        return 1;
      }

      return -1;
    })
    .map(specialItem => {
      const { name, attributes } = specialItem;
      const item = itemList[name] as AttributeItem | NotSellableItem;

      const currentItemType: ItemType = 'notSellable' in item && item.notSellable ? 'not_sellable' : 'special';
      itemTypesInInv.add(currentItemType);

      const value = item.customValue ? item.customValue(attributes) : item.value;

      return {
        name: itemString(item, null, false, attributes),
        value:
          `${itemTypes[currentItemType].emoji} ` +
          `${currentItemType === 'not_sellable' ? '??? lati' : latiString(value)}\n` +
          displayAttributes(specialItem),
        inline: true,
      };
    });

  const sortedItems: ItemInProfile[] = items.sort((a, b) => {
    const itemA = itemList[a.name];
    const itemB = itemList[b.name];
    return 'use' in itemB === 'use' in itemA ? itemB.value - itemA.value : 'use' in itemB ? 1 : -1;
  });

  const itemFields = sortedItems.map(({ name, amount }) => {
    const item = itemList[name] as Item;

    const currentItemType: ItemType = 'use' in item ? 'usable' : 'not_usable';
    itemTypesInInv.add(currentItemType);

    return {
      name: `${itemString(item)} x${amount}`,
      value: `${itemTypes[currentItemType].emoji} ${latiString(item.value)}`,
      inline: true,
    };
  });

  return {
    fields: [...specialItemsFields, ...itemFields],
    itemTypesInv: Array.from(itemTypesInInv),
  };
}

export function getInvValue({ items, specialItems }: UserProfile) {
  return (
    items.reduce((prev, { name, amount }) => {
      return prev + itemList[name]!.value * amount;
    }, 0) +
    specialItems.reduce((prev, { name, attributes }) => {
      const itemObj = itemList[name] as AttributeItem;
      return prev + (itemObj.customValue ? itemObj.customValue!(attributes) : itemObj.value);
    }, 0)
  );
}

const INV_PAGE_SIZE = 12;

function mantaVaiMantas(items: ItemInProfile[], specialItems: SpecialItemInProfile[]) {
  const count = countItems(items) + specialItems.length;
  return count % 10 === 1 && count % 100 !== 11 ? 'manta' : 'mantas';
}

function invEmbed(
  i: ChatInputCommandInteraction,
  target: User,
  targetUser: UserProfile,
  fields: EmbedField[],
  currentPage: number,
  itemTypesInv: ItemType[]
) {
  const { items, specialItems, itemCap } = targetUser;

  const totalValue = getInvValue(targetUser);

  const fieldsToShow = fields.slice(currentPage * INV_PAGE_SIZE, (currentPage + 1) * INV_PAGE_SIZE);

  return embedTemplate({
    i,
    title: targetUser.userId === i.user.id ? 'Tavs inventārs' : `${userString(target)} inventārs`,
    description:
      items.length + specialItems.length
        ? `**${countItems(items) + specialItems.length}** ${mantaVaiMantas(items, specialItems)} no **${itemCap}**\n` +
          `Inventāra vērtība: ${latiString(totalValue, false, true)}\n\n` +
          Object.entries(itemTypes).reduce(
            (prev, [key, { text, emoji }]) =>
              itemTypesInv.includes(key as ItemType) ? prev + `${emoji} - ${text}\n` : prev,
            ''
          ) +
          '\u2800'
        : 'Tev nav nevienas mantas (diezgan bēdīgi)\nIzmanto komandu `/palidziba`',
    color: commandColors.inventars,
    fields: fieldsToShow,
  }).embeds;
}

function sellRow({ items }: UserProfile, buttonsPressed: ('visas' | 'neizmantojamas')[] = []) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('inv_pardot_visas')
      .setLabel('Pārdot visas mantas')
      .setStyle(buttonsPressed.includes('visas') ? ButtonStyle.Success : ButtonStyle.Primary)
      .setDisabled(buttonsPressed.includes('visas'))
  );

  const hasUnusableItems = items.find(item => !('use' in itemList[item.name]));
  if (hasUnusableItems) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('inv_pardot_neizmantojamas')
        .setLabel('Pārdot neizmantojamās mantas')
        .setStyle(buttonsPressed.includes('neizmantojamas') ? ButtonStyle.Success : ButtonStyle.Primary)
        .setDisabled(buttonsPressed.includes('neizmantojamas'))
    );
  }

  return row;
}

function invComponents(
  i: ChatInputCommandInteraction,
  targetUser: UserProfile,
  fields: {
    name: string;
    value: string;
    inline: boolean;
  }[],
  currentPage?: number,
  totalPages?: number,
  buttonsPressed: ('visas' | 'neizmantojamas')[] = []
) {
  const { userId, items, specialItems } = targetUser;

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  if (fields.length > INV_PAGE_SIZE) {
    rows.push(btnPaginationRow('inv', currentPage!, totalPages!));
  }

  if (
    userId === i.user.id &&
    (items.length || (specialItems.length && specialItems.find(({ name }) => !('notSellable' in itemList[name]))))
  ) {
    rows.push(sellRow(targetUser, buttonsPressed));
  }

  return rows;
}

const inventars: Command = {
  description:
    'Apskatīt savu, vai cita lietotāja inventāru\n' +
    'Inventārā tiek glabātas visas lietotāja mantas\n' +
    'Caur inventāru ir iespējams arī pārdot nelietojamās vai visas mantas\n\n' +
    'Katra lietotāja inventāram ir mantu limits - **50**\n' +
    `Inventāra limitu ir iespējams palielināt ar šīm mantām: \n` +
    `- ${itemString(itemList.mugursoma)} (līdz ${INCREASE_CAP_1})\n` +
    `- ${itemString(itemList.divaina_mugursoma)} (līdz ${INCREASE_CAP_2})\n\n` +
    'Katra manta aizņem vienādu vietu inventārā - **1** (vienu)',
  color: commandColors.inventars,
  data: {
    name: 'inv',
    description: 'Apskatīt savu, vai cita lietotāja inventāru',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt inventāru',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser('lietotājs') || i.user;

    const targetUser = await findUser(target.id, i.guildId!);
    if (!targetUser) return intReply(i, errorEmbed);

    if (target.id === i.client.user?.id) {
      return intReply(i, ephemeralReply('Tu nevari apskatīt Valsts Bankas inventāru'));
    }

    const { fields, itemTypesInv } = mapItems(targetUser);

    const totalPages = Math.ceil(fields.length / INV_PAGE_SIZE);
    let currentPage = 0;

    const msg = await intReply(i, {
      content: totalPages > 1 ? '\u200b' : undefined,
      embeds: invEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
      components: invComponents(i, targetUser, fields, currentPage, totalPages),
      fetchReply: true,
    });
    if (!msg) return;

    const buttonsPressed: ('visas' | 'neizmantojamas')[] = [];

    await buttonHandler(
      i,
      'inventārs',
      msg,
      async int => {
        const { customId } = int;
        if (int.componentType !== ComponentType.Button) return;

        switch (customId) {
          case 'inv_prev_page': {
            currentPage--;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            return {
              edit: {
                embeds: invEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: invComponents(i, targetUser, fields, currentPage, totalPages),
              },
            };
          }
          case 'inv_next_page': {
            currentPage++;
            if (currentPage < 0) currentPage = 0;
            return {
              edit: {
                embeds: invEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: invComponents(i, targetUser, fields, currentPage, totalPages),
              },
            };
          }
          case 'inv_pardot_neizmantojamas': {
            if (!buttonsPressed.includes('neizmantojamas')) buttonsPressed.push('neizmantojamas');

            return {
              edit: {
                embeds: invEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: invComponents(i, targetUser, fields, currentPage, totalPages, buttonsPressed),
              },
              after: () => pardotRun(int, 'neizmantojamās'),
            };
          }
          case 'inv_pardot_visas': {
            if (!buttonsPressed.includes('visas')) buttonsPressed.push('visas');
            return {
              edit: {
                embeds: invEmbed(i, target, targetUser, fields, currentPage, itemTypesInv),
                components: invComponents(i, targetUser, fields, currentPage, totalPages, buttonsPressed),
              },
              after: () => pardotRun(int, 'visas'),
            };
          }
        }
      },
      60000
    );
  },
};

export default inventars;
