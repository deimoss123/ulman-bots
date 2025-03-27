import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
} from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../embeds/helpers/itemString';
import Item, { AttributeItem, NotSellableItem } from '../../interfaces/Item';
import UsableItemReturn from '../../interfaces/UsableItemReturn';
import { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../items/itemList';
import intReply from '../../utils/intReply';
import { attributeItemSort } from '../inventars/inventars';
import { Dialogs } from '../../utils/Dialogs';

function makeEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemObj: Item,
  selectedItem: SpecialItemInProfile,
  useRes: Extract<UsableItemReturn, { text: string }>,
  embedColor: number,
) {
  return embedTemplate({
    i,
    color: embedColor,
    title: `Izmantot: ${itemString(itemObj, null, true, selectedItem.attributes)}`,
    description: useRes.text,
    fields: useRes.fields || [],
  });
}

type State = {
  itemsInInv: SpecialItemInProfile[];
  itemObj: AttributeItem<ItemAttributes>;
  selectedId: string | null;
  embedColor: number;
};

const enum ComponentId {
  Confirm = 'izmantot_special_confirm',
  UseMany = 'izmantot_special_many',
  Select = 'izmantot_special_select',
}

function view(state: State, i: BaseInteraction) {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentId.Confirm)
      .setDisabled(!state.selectedId)
      .setLabel('Izmantot')
      .setStyle(state.selectedId ? ButtonStyle.Primary : ButtonStyle.Secondary),
  );

  if (state.itemObj.useMany) {
    const usableItems = state.itemsInInv.filter(({ attributes }) => state.itemObj.useMany!.filter(attributes));

    if (usableItems.length) {
      buttonRow.addComponents(
        new ButtonBuilder()
          .setCustomId(ComponentId.UseMany)
          .setLabel(`Izmantot visus (${usableItems.length}/${state.itemsInInv.length})`)
          .setStyle(ButtonStyle.Primary),
      );
    }
  }

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ComponentId.Select)
        .setPlaceholder('Izvēlies kuru izmantot')
        .setOptions(
          state.itemsInInv
            .slice(0, 25)
            .sort((a, b) => {
              const valueA = state.itemObj.customValue ? state.itemObj.customValue(a.attributes) : state.itemObj.value;
              const valueB = state.itemObj.customValue ? state.itemObj.customValue(b.attributes) : state.itemObj.value;
              if (valueA === valueB) {
                return attributeItemSort(a.attributes, b.attributes, state.itemObj.sortBy);
              }

              return valueB - valueA;
            })
            .map(item => ({
              label: itemStringCustom(state.itemObj, item.attributes?.customName),
              description: displayAttributes(item, true),
              value: item._id!,
              emoji:
                (state.itemObj.customEmoji ? state.itemObj.customEmoji(item.attributes) : state.itemObj.emoji()) ||
                '❓',
              default: state.selectedId === item._id,
            })),
        ),
    ),
    buttonRow,
  ];

  return embedTemplate({
    i,
    color: state.embedColor,
    description:
      `Tavā inventārā ir **${itemString(state.itemObj, state.itemsInInv.length)}**\n` +
      `No saraksta izvēlies kuru tu gribi izmantot`,
    components,
  });
}

export default async function izmantotRunSpecial(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number,
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem<ItemAttributes> | NotSellableItem;

  if (itemsInInv.length === 1) {
    const selectedItem = itemsInInv[0];
    const useRes = await itemObj.use(userId, guildId, itemKey, selectedItem);
    if ('error' in useRes) return intReply(i, errorEmbed);
    if ('custom' in useRes) return useRes.custom(i, embedColor);
    return intReply(i, makeEmbed(i, itemObj, selectedItem, useRes, embedColor));
  }

  const initialState: State = {
    itemsInInv,
    itemObj,
    selectedId: null,
    embedColor,
  };

  const dialogs = new Dialogs(i, initialState, view, 'izmantot', { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId } = int;

    if (customId === ComponentId.Select) {
      if (int.componentType !== ComponentType.StringSelect) return;
      state.selectedId = int.values[0]!;
      return { update: true };
    }

    if (int.componentType !== ComponentType.Button) return;

    if (customId === ComponentId.Confirm) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const selectedItem = user.specialItems.find(item => item._id === state.selectedId);

      if (!selectedItem) {
        state.selectedId = null;
        state.itemsInInv = user.specialItems.filter(item => item.name === itemKey);

        intReply(int, ephemeralReply('Tavs inventāra saturs ir mainījies, šī manta vairs nav tavā inventārā'));
        return { edit: true };
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

    if (customId === ComponentId.UseMany) {
      if (!itemObj.useMany) return;

      return {
        end: true,
        after: () => itemObj.useMany!.runFunc(int),
      };
    }
  });
}
