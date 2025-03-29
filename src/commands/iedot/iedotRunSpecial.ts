import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
} from "discord.js";
import addLati from "@/db/addLati";
import addSpecialItems from "@/db/addSpecialItems";
import findUser from "@/db/findUser";
import removeItemsById from "@/db/removeItemsById";
import setStats from "@/db/stats/setStats";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import itemString, { itemStringCustom } from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import Item, { AttributeItem } from "@/types/Item";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import checkUserSpecialItems from "@/utils/checkUserSpecialItems";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import itemList, { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import { attributeItemSort } from "@/commands/inventars/inventars";
import { cantPayTaxEmbed } from "@/commands/iedot/iedot";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mongoTransaction from "@/utils/mongoTransaction";

function makeEmbedAfter(
  i: ChatInputCommandInteraction,
  taxLati: number,
  user: UserProfile,
  targetUser: UserProfile,
  itemsToGive: SpecialItemInProfile[],
  hasJuridisks: boolean,
  itemObj: AttributeItem,
  currTime: number,
) {
  return mainEmbed({
    i,
    color: commandColors.iedot,
    content: `<@${targetUser.userId}>`,

    description: `Nodoklis: ${
      "notSellable" in itemObj
        ? "**0** lati **(nepārdodama manta)**"
        : hasJuridisks
          ? "**0** lati **(juridiska persona)**"
          : `${latiString(taxLati, false, true)} (${Math.floor(user.giveTax * 100)}% no mantu kopējās vērtības)`
    }\n<@${targetUser.userId}> tu iedevi:`,

    fields: [
      ...itemsToGive.map((item) => {
        const lati =
          "dynamicValue" in itemObj && itemObj.dynamicValue ? itemObj.dynamicValue(item.attributes) : itemObj.value;

        return {
          name: itemString(itemObj, null, true, item.attributes),
          value:
            ("notSellable" in itemObj ? "" : `Vērtība: ${latiString(lati, false, true)}\n`) +
            itemObj.displayAttributes(item.attributes, false, currTime),
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

  currTime: number;
};

const enum ComponentId {
  Select = "iedot_special_select",
  Confirm = "iedot_special_confirm",
}

const view: DialogsViewFunc<State> = (state, i) => {
  const selectedIds = state.selectedItems.map((item) => item._id!);

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ComponentId.Select)
        .setDisabled(state.hasGiven)
        .setPlaceholder("Izvēlies ko iedot")
        .setMinValues(1)
        .setMaxValues(Math.min(state.itemsInInv.length, 25))
        .setOptions(
          state.itemsInInv
            .slice(0, 25)
            .sort((a, b) => {
              const valueA = state.itemObj.dynamicValue
                ? state.itemObj.dynamicValue(a.attributes)
                : state.itemObj.value;
              const valueB = state.itemObj.dynamicValue
                ? state.itemObj.dynamicValue(b.attributes)
                : state.itemObj.value;

              if (valueA === valueB) {
                return attributeItemSort(a.attributes, b.attributes, state.itemObj.sortBy);
              }

              return valueB - valueA;
            })
            .map((item) => {
              const lati =
                "dynamicValue" in state.itemObj && state.itemObj.dynamicValue
                  ? state.itemObj.dynamicValue(item.attributes)
                  : state.itemObj.value;

              return {
                label: itemStringCustom(state.itemObj, item.attributes?.customName),
                description:
                  ("notSellable" in state.itemObj ? "" : `${latiString(lati)} | `) +
                  state.itemObj.displayAttributes(item.attributes, true, state.currTime),
                value: item._id!,
                emoji:
                  (state.itemObj.dynamicEmoji ? state.itemObj.dynamicEmoji(item.attributes) : state.itemObj.emoji()) ||
                  "❓",
                default: !!selectedIds.length && selectedIds!.includes(item._id!),
              };
            }),
        ),
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.Confirm)
        .setDisabled(state.hasGiven || !selectedIds.length || state.user.lati < state.totalTax)
        .setLabel(state.user.lati < state.totalTax ? "Iedot (nepietiek naudas)" : "Iedot")
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

  return mainEmbed({
    i,
    color: commandColors.iedot,
    description:
      `Tavā inventārā ir **${itemString(state.itemObj, state.itemsInInv.length)}**\n` +
      `No saraksta izvēlies vienu vai vairākas mantas ko iedot <@${state.targetUserId}>\n\n` +
      `**Nodoklis:** ` +
      ("notSellable" in state.itemObj
        ? `0 lati **(nepārdodama manta)**`
        : state.hasJuridisks
          ? `0 lati **(${itemList.juridiska_zivs.emoji()} juridiska persona)**`
          : `${state.totalTax ? latiString(state.totalTax) : "-"} ` +
            `(${Math.floor(state.user.giveTax * 100)}% no mantu kopējās vērtības)`),
    components,
  });
};

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

  const currTime = Date.now();

  if (itemsInInv.length === 1) {
    const hasInvSpace = checkTargetInv(targetUser, 1);
    if (!hasInvSpace) {
      return intReply(i, noInvSpaceEmbed(targetUser, itemObj, 1));
    }

    const checkRes = checkUserSpecialItems(targetUser, itemKey);
    if (!checkRes.valid) {
      return intReply(i, ephemeralReply(`Neizdevās iedot, jo ${checkRes.reason}`));
    }

    if (hasJuridisks || "notSellable" in itemObj) {
      totalTax = 0;
    } else {
      const value =
        "dynamicValue" in itemObj && itemObj.dynamicValue
          ? itemObj.dynamicValue(itemsInInv[0].attributes)
          : itemObj.value;
      totalTax = Math.floor(value * user.giveTax);
    }

    if (user.lati < totalTax) {
      return intReply(i, cantPayTaxEmbed(itemObj, 1, totalTax, user));
    }

    const { ok } = await mongoTransaction((session) => {
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

    return intReply(i, makeEmbedAfter(i, totalTax, user, targetUser, itemsInInv, hasJuridisks, itemObj, currTime));
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

    currTime,
  };

  const dialogs = new Dialogs(i, initialState, view, "iedot", { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId, componentType } = int;

    if (customId === ComponentId.Select && componentType === ComponentType.StringSelect) {
      state.selectedItems = itemsInInv.filter((item) => int.values.includes(item._id!));

      if (hasJuridisks || "notSellable" in itemObj) {
        state.totalTax = 0;
      } else {
        state.totalTax =
          Math.floor(
            (itemObj.dynamicValue
              ? state.selectedItems.reduce((prev, item) => prev + itemObj.dynamicValue!(item.attributes), 0)
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

      const userItemIds = user.specialItems.map((item) => item._id!);
      for (const specItem of state.selectedItems) {
        if (!userItemIds.includes(specItem._id!)) {
          return {
            end: true,
            after: () => {
              intReply(
                int,
                ephemeralReply("Tavs inventāra saturs ir mainījies, kāda no izvēlētām mantām vairs nav tavā inventārā"),
              );
            },
          };
        }
      }

      const { ok } = await mongoTransaction((session) => {
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
            makeEmbedAfter(
              i,
              state.totalTax,
              state.user,
              targetUser,
              state.selectedItems,
              hasJuridisks,
              itemObj,
              state.currTime,
            ),
          );
        },
      };
    }
  });

  return;
}
