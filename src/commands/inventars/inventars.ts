import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType, ComponentType } from 'discord.js';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemList from '../../items/itemList';
import latiString from '../../embeds/helpers/latiString';
import countItems from '../../items/helpers/countItems';
import commandColors from '../../embeds/commandColors';
import itemString from '../../embeds/helpers/itemString';
import ephemeralReply from '../../embeds/ephemeralReply';
import UserProfile, { ItemAttributes, ItemInProfile } from '../../interfaces/UserProfile';
import Item, { AttributeItem, NotSellableItem } from '../../interfaces/Item';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import pardotRun from '../pardot/pardotRun';
import { INCREASE_CAP_1 } from '../../items/usableItems/mugursoma';
import { INCREASE_CAP_2 } from '../../items/usableItems/divaina_mugursoma';
import intReply from '../../utils/intReply';
import emoji from '../../utils/emoji';
import { ComponentId, InventarsState, inventarsView } from './inventarsView';
import { Dialogs } from '../../utils/Dialogs';

export type ItemType = 'not_usable' | 'usable' | 'special' | 'not_sellable';

export const itemTypes: Record<ItemType, { text: string; textCompact: string; emoji: () => string }> = {
  not_sellable: {
    text: 'īpaša izmantojama un **nepārdodama** un manta',
    textCompact: 'izmantojams (nepārdodams)',
    emoji: () => emoji('icon_check3'),
  },
  special: {
    text: 'izmantojama manta ar atribūtiem',
    textCompact: 'izmantojams (ar atribūtiem)',
    emoji: () => emoji('icon_check2'),
  },
  usable: {
    text: 'izmantojama manta',
    textCompact: 'izmantojams',
    emoji: () => emoji('icon_check1'),
  },
  not_usable: {
    text: 'neizmantojama manta',
    textCompact: 'neizmantojams',
    emoji: () => emoji('icon_cross'),
  },
};

export function attributeItemSort(
  attrA: ItemAttributes,
  attrB: ItemAttributes,
  sortByObj: Partial<Record<keyof ItemAttributes, 1 | -1>>,
  index = 0,
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
      const itemA = itemList[a.name] as AttributeItem<ItemAttributes> | NotSellableItem;
      const itemB = itemList[b.name] as AttributeItem<ItemAttributes> | NotSellableItem;

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
      const item = itemList[name] as AttributeItem<ItemAttributes> | NotSellableItem;

      const currentItemType: ItemType = 'notSellable' in item && item.notSellable ? 'not_sellable' : 'special';
      itemTypesInInv.add(currentItemType);

      const value = item.customValue ? item.customValue(attributes) : item.value;

      return {
        name: itemString(item, null, false, attributes),
        value:
          `${itemTypes[currentItemType].emoji()} ` +
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
      value: `${itemTypes[currentItemType].emoji()} ${latiString(item.value)}`,
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
      const itemObj = itemList[name] as AttributeItem<ItemAttributes>;
      return prev + (itemObj.customValue ? itemObj.customValue!(attributes) : itemObj.value);
    }, 0)
  );
}

export const INV_PAGE_SIZE = 12;

const inventars: Command = {
  description: () =>
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
    const targetDiscordUser = i.options.getUser('lietotājs') || i.user;

    const targetUser = await findUser(targetDiscordUser.id, i.guildId!);
    if (!targetUser) return intReply(i, errorEmbed);

    if (targetDiscordUser.id === i.client.user?.id) {
      return intReply(i, ephemeralReply('Tu nevari apskatīt Valsts Bankas inventāru'));
    }

    const { fields, itemTypesInv } = mapItems(targetUser);

    const totalPages = Math.ceil(fields.length / INV_PAGE_SIZE);

    const totalInvValue = getInvValue(targetUser);
    const itemCount = countItems(targetUser.items) + targetUser.specialItems.length;

    const initialState: InventarsState = {
      targetDiscordUser,
      targetUser,
      fields,
      currentPage: 0,
      totalPages,
      itemTypesInInv: itemTypesInv,
      totalInvValue,
      itemCount,
      buttonsPressed: new Set(),
    };

    const dialogs = new Dialogs<InventarsState>(i, initialState, inventarsView, 'inventārs', { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async int => {
      const { customId } = int;
      if (int.componentType !== ComponentType.Button) return;

      if (dialogs.state.currentPage < 0) {
        dialogs.state.currentPage = 0;
      }

      if (dialogs.state.currentPage >= dialogs.state.totalPages) {
        dialogs.state.currentPage = dialogs.state.totalPages - 1;
      }

      switch (customId) {
        case ComponentId.FirstPage: {
          dialogs.state.currentPage = 0;
          return { update: true };
        }
        case ComponentId.PrevPage: {
          if (dialogs.state.currentPage > 0) dialogs.state.currentPage--;
          return { update: true };
        }
        case ComponentId.NextPage: {
          if (dialogs.state.currentPage < dialogs.state.totalPages - 1) dialogs.state.currentPage++;
          return { update: true };
        }
        case ComponentId.LastPage: {
          dialogs.state.currentPage = dialogs.state.totalPages - 1;
          return { update: true };
        }
        case ComponentId.SellUnusable: {
          dialogs.state.buttonsPressed.add('neizmantojamas');

          return {
            edit: true,
            after: () => pardotRun(int, 'neizmantojamās'),
          };
        }
        case ComponentId.SellAll: {
          dialogs.state.buttonsPressed.add('visas');

          return {
            edit: true,
            after: () => pardotRun(int, 'visas'),
          };
        }
      }
    });
  },
};

export default inventars;
