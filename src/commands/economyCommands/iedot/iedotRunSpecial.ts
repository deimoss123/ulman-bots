import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
} from 'discord.js';
import addLati from '../../../economy/addLati';
import addSpecialItems from '../../../economy/addSpecialItems';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setStats from '../../../economy/stats/setStats';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString, { itemStringCustom } from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import Item, { AttributeItem } from '../../../interfaces/Item';
import UserProfile, { ItemAttributes, SpecialItemInProfile } from '../../../interfaces/UserProfile';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../../../items/itemList';
import intReply from '../../../utils/intReply';
import { attributeItemSort } from '../inventars/inventars';
import { cantPayTaxEmbed } from './iedot';
import { Dialogs } from '../../../utils/Dialogs';
import errorEmbed from '../../../embeds/errorEmbed';
import mongoTransaction from '../../../utils/mongoTransaction';

function makeEmbedAfter(
  i: ChatInputCommandInteraction,
  taxLati: number,
  user: UserProfile,
  targetUser: UserProfile,
  itemsToGive: SpecialItemInProfile[],
  hasJuridisks: boolean,
  itemObj: Item,
) {
  return embedTemplate({
    i,
    color: commandColors.iedot,
    content: `<@${targetUser.userId}>`,

    description: `Nodoklis: ${
      'notSellable' in itemObj
        ? '**0** lati **(nepārdodama manta)**'
        : hasJuridisks
          ? '**0** lati **(juridiska persona)**'
          : `${latiString(taxLati, false, true)} (${Math.floor(user.giveTax * 100)}% no mantu kopējās vērtības)`
    }\n<@${targetUser.userId}> tu iedevi:`,

    fields: [
      ...itemsToGive.map(item => {
        const lati =
          'customValue' in itemObj && itemObj.customValue ? itemObj.customValue(item.attributes) : itemObj.value;

        return {
          name: itemString(itemObj, null, true, item.attributes),
          value:
            ('notSellable' in itemObj ? '' : `Vērtība: ${latiString(lati, false, true)}\n`) + displayAttributes(item),
          inline: false,
        };
      }),
    ],
  });
}

type State = {
  itemsInInv: SpecialItemInProfile[];
  itemObj: AttributeItem<ItemAttributes>;
  targetUserId: string;
  user: UserProfile;
  hasJuridisks: boolean;

  selectedItems: SpecialItemInProfile[];
  totalTax: number;
  hasGiven: boolean;
};

const enum ComponentId {
  Select = 'iedot_special_select',
  Confirm = 'iedot_special_confirm',
}

function view(state: State, i: BaseInteraction) {
  const selectedIds = state.selectedItems.map(item => item._id!);

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ComponentId.Select)
        .setDisabled(state.hasGiven)
        .setPlaceholder('Izvēlies ko iedot')
        .setMinValues(1)
        .setMaxValues(Math.min(state.itemsInInv.length, 25))
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
            .map(item => {
              const lati =
                'customValue' in state.itemObj && state.itemObj.customValue
                  ? state.itemObj.customValue(item.attributes)
                  : state.itemObj.value;

              return {
                label: itemStringCustom(state.itemObj, item.attributes?.customName),
                description:
                  ('notSellable' in state.itemObj ? '' : `${latiString(lati)} | `) + displayAttributes(item, true),
                value: item._id!,
                emoji:
                  (state.itemObj.customEmoji ? state.itemObj.customEmoji(item.attributes) : state.itemObj.emoji()) ||
                  '❓',
                default: !!selectedIds.length && selectedIds!.includes(item._id!),
              };
            }),
        ),
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.Confirm)
        .setDisabled(state.hasGiven || !selectedIds.length || state.user.lati < state.totalTax)
        .setLabel(state.user.lati < state.totalTax ? 'Iedot (nepietiek naudas)' : 'Iedot')
        .setStyle(
          state.hasGiven
            ? ButtonStyle.Success
            : state.user.lati < state.totalTax
              ? ButtonStyle.Danger
              : selectedIds.length
                ? ButtonStyle.Primary
                : ButtonStyle.Secondary,
        ),
    ),
  ];

  return embedTemplate({
    i,
    color: commandColors.iedot,
    description:
      `Tavā inventārā ir **${itemString(state.itemObj, state.itemsInInv.length)}**\n` +
      `No saraksta izvēlies vienu vai vairākas mantas ko iedot <@${state.targetUserId}>\n\n` +
      `**Nodoklis:** ` +
      ('notSellable' in state.itemObj
        ? `0 lati **(nepārdodama manta)**`
        : state.hasJuridisks
          ? `0 lati **(${itemList.juridiska_zivs.emoji()} juridiska persona)**`
          : `${state.totalTax ? latiString(state.totalTax) : '-'} ` +
            `(${Math.floor(state.user.giveTax * 100)}% no mantu kopējās vērtības)`),
    components,
  });
}

function checkTargetInv(targetUser: UserProfile, amountToGive: number): boolean {
  if (amountToGive > countFreeInvSlots(targetUser)) return false;
  return true;
}

export function noInvSpaceEmbed(targetUser: UserProfile, itemToGive: Item, amountToGive: number) {
  return ephemeralReply(
    `Tu nevari iedot ${itemString(itemToGive, amountToGive, true)}\n` +
      `<@${targetUser.userId}> inventārā ir **${countFreeInvSlots(targetUser)}** brīvas vietas`,
  );
}

export default async function iedotRunSpecial(
  i: ChatInputCommandInteraction,
  user: UserProfile,
  targetUser: UserProfile,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  hasJuridisks: boolean,
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem<ItemAttributes>;

  let totalTax: number;

  if (itemsInInv.length === 1) {
    const hasInvSpace = checkTargetInv(targetUser, 1);
    if (!hasInvSpace) {
      return intReply(i, noInvSpaceEmbed(targetUser, itemObj, 1));
    }

    const checkRes = checkUserSpecialItems(targetUser, itemKey);
    if (!checkRes.valid) {
      return intReply(i, ephemeralReply(`Neizdevās iedot, jo ${checkRes.reason}`));
    }

    if (hasJuridisks || 'notSellable' in itemObj) {
      totalTax = 0;
    } else {
      const value =
        'customValue' in itemObj && itemObj.customValue ? itemObj.customValue(itemsInInv[0].attributes) : itemObj.value;
      totalTax = Math.floor(value * user.giveTax);
    }

    if (user.lati < totalTax) {
      return intReply(i, cantPayTaxEmbed(itemObj, 1, totalTax, user));
    }

    const { ok } = await mongoTransaction(session => {
      const arr = [
        // prettier-ignore
        () => removeItemsById(i.user.id, guildId, itemsInInv.map(item => item._id!), session),
        () => addSpecialItems(targetUser.userId, guildId, itemsInInv, session),
        () => setStats(targetUser.userId, guildId, { itemsReceived: 1 }, session),
        () => setStats(userId, guildId, { itemsGiven: 1, taxPaid: totalTax }, session),
      ];

      if (!hasJuridisks && totalTax) {
        arr.push(
          () => addLati(userId, guildId, -totalTax, session),
          () => addLati(i.client.user!.id, guildId, totalTax, session),
        );
      }

      return arr;
    });

    if (!ok) return intReply(i, errorEmbed);

    return intReply(i, makeEmbedAfter(i, totalTax, user, targetUser, itemsInInv, hasJuridisks, itemObj));
  }

  const initialState: State = {
    itemsInInv,
    itemObj,
    targetUserId: targetUser.userId,
    user,
    hasJuridisks,

    selectedItems: [],
    totalTax: 0,
    hasGiven: false,
  };

  const dialogs = new Dialogs(i, initialState, view, 'iedot', { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId, componentType } = int;

    if (customId === ComponentId.Select && componentType === ComponentType.StringSelect) {
      state.selectedItems = itemsInInv.filter(item => int.values.includes(item._id!));

      if (hasJuridisks || 'notSellable' in itemObj) {
        state.totalTax = 0;
      } else {
        state.totalTax =
          Math.floor(
            (itemObj.customValue
              ? state.selectedItems.reduce((prev, item) => prev + itemObj.customValue!(item.attributes), 0)
              : itemObj.value * state.selectedItems.length) * state.user.giveTax,
          ) || 1;
      }

      return { update: true };
    } else if (
      customId === ComponentId.Confirm &&
      componentType === ComponentType.Button &&
      state.selectedItems.length
    ) {
      const targetUserNew = await findUser(targetUser.userId, guildId);
      if (!targetUserNew) return { error: true };

      const hasInvSpace = checkTargetInv(targetUserNew, state.selectedItems.length);
      if (!hasInvSpace) {
        intReply(int, noInvSpaceEmbed(targetUserNew, itemObj, state.selectedItems.length));
        return { end: true };
      }

      const checkRes = checkUserSpecialItems(targetUserNew, itemKey, state.selectedItems.length);
      if (!checkRes.valid) {
        intReply(int, ephemeralReply(`Neizdevās iedot, jo ${checkRes.reason}`));
        return { end: true };
      }

      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      if (user.lati < state.totalTax) {
        return {
          end: true,
          after: () => {
            intReply(int, cantPayTaxEmbed(itemObj, state.selectedItems.length, state.totalTax, user));
          },
        };
      }

      const userItemIds = user.specialItems.map(item => item._id!);
      for (const specItem of state.selectedItems) {
        if (!userItemIds.includes(specItem._id!)) {
          return {
            end: true,
            after: () => {
              intReply(
                int,
                ephemeralReply('Tavs inventāra saturs ir mainījies, kāda no izvēlētām mantām vairs nav tavā inventārā'),
              );
            },
          };
        }
      }

      const { ok } = await mongoTransaction(session => {
        const arr = [
          // prettier-ignore
          () => removeItemsById(userId, guildId, state.selectedItems.map(item => item._id!), session),
          () => addSpecialItems(targetUser.userId, guildId, state.selectedItems, session),
          () => setStats(targetUser.userId, guildId, { itemsReceived: state.selectedItems.length }, session),
          () => setStats(userId, guildId, { itemsGiven: state.selectedItems.length, taxPaid: state.totalTax }, session),
        ];

        if (!hasJuridisks && state.totalTax) {
          arr.push(
            () => addLati(userId, guildId, -state.totalTax, session),
            () => addLati(i.client.user!.id, guildId, state.totalTax, session),
          );
        }

        return arr;
      });

      if (!ok) return { error: true };

      state.hasGiven = true;

      return {
        end: true,
        edit: true,
        after: () => {
          intReply(
            int,
            makeEmbedAfter(i, state.totalTax, state.user, targetUser, state.selectedItems, hasJuridisks, itemObj),
          );
        },
      };
    }
  });

  return;
}
