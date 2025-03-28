import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
} from "discord.js";
import addLati from "@/db/addLati";
import findUser from "@/db/findUser";
import removeItemsById from "@/db/removeItemsById";
import setStats from "@/db/stats/setStats";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import { displayAttributes } from "@/utils/strings/displayAttributes";
import itemString, { itemStringCustom } from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import { AttributeItem } from "@/types/Item";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import itemList, { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import { attributeItemSort } from "@/commands/inventars/inventars";
import { PIRKT_PARDOT_NODOKLIS } from "@/commands/pardot/pardot";
import { Dialogs } from "@/utils/dialogs";
import mongoTransaction from "@/utils/mongoTransaction";

type State = {
  user: UserProfile;
  color: number;
  itemsInInv: SpecialItemInProfile[];
  itemObj: AttributeItem<ItemAttributes>;
  selectedIds: string[];

  didSell: boolean;
  soldItems: SpecialItemInProfile[];
  soldValue: number;
};

const enum ComponentId {
  Select = "pardot_special_select",
  Confirm = "pardot_special_confirm",
}

function view(state: State, i: BaseInteraction) {
  if (state.didSell) {
    return soldEmbed(i, state.user, state.soldItems, state.soldValue, state.color);
  }

  const { itemObj, itemsInInv, selectedIds } = state;

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ComponentId.Select)
        .setPlaceholder("Izvēlies ko pārdot")
        .setMinValues(1)
        .setMaxValues(itemsInInv.length)
        .setOptions(
          itemsInInv
            .slice(0, 25)
            .sort((a, b) => {
              const valueA = itemObj.dynamicValue ? itemObj.dynamicValue(a.attributes) : itemObj.value;
              const valueB = itemObj.dynamicValue ? itemObj.dynamicValue(b.attributes) : itemObj.value;
              if (valueA === valueB) {
                return attributeItemSort(a.attributes, b.attributes, itemObj.sortBy);
              }

              return valueB - valueA;
            })
            .map((item) => ({
              label: itemStringCustom(itemObj, item.attributes?.customName),
              description:
                `${latiString(
                  "dynamicValue" in itemObj && itemObj.dynamicValue
                    ? itemObj.dynamicValue(item.attributes)
                    : itemObj.value,
                )} | ` + displayAttributes(item, true),
              value: item._id!,
              emoji: (itemObj.dynamicEmoji ? itemObj.dynamicEmoji(item.attributes) : itemObj.emoji()) || "❓",
              default: !!selectedIds.length && selectedIds!.includes(item._id!),
            })),
        ),
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.Confirm)
        .setDisabled(!selectedIds.length)
        .setLabel("Pārdot")
        .setStyle(selectedIds.length ? ButtonStyle.Primary : ButtonStyle.Secondary),
    ),
  ];

  return mainEmbed({
    i,
    color: state.color,
    description:
      `Tavā inventārā ir **${itemString(itemObj, itemsInInv.length)}**\n` +
      `No saraksta izvēlies vienu vai vairākas mantas ko pārdot`,
    components,
  });
}

function soldEmbed(
  i: BaseInteraction,
  user: UserProfile,
  soldItems: SpecialItemInProfile[],
  soldValue: number,
  color: number,
) {
  return mainEmbed({
    i,
    title: "Tu pārdevi:",
    color,
    fields: [
      ...soldItems.map((item) => ({
        name: itemString(itemList[item.name], null, false, item.attributes),
        value: displayAttributes(item),
        inline: false,
      })),
      { name: "Tu ieguvi", value: latiString(soldValue, true), inline: true },
      { name: "Tev tagad ir", value: latiString(user.lati), inline: true },
    ],
  });
}

export default async function pardotRunSpecial(
  i: ChatInputCommandInteraction,
  user: UserProfile,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  embedColor: number,
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem<ItemAttributes>;

  if (itemsInInv.length === 1) {
    const soldValue =
      "dynamicValue" in itemObj && itemObj.dynamicValue
        ? itemObj.dynamicValue(itemsInInv[0].attributes)
        : itemObj.value;

    const taxPaid = Math.floor(soldValue * PIRKT_PARDOT_NODOKLIS);

    const { ok, values } = await mongoTransaction((session) => [
      () => addLati(i.client.user!.id, guildId, taxPaid, session),
      () => addLati(userId, guildId, soldValue, session),
      () => setStats(userId, guildId, { soldShop: soldValue, taxPaid }, session),
      () => removeItemsById(userId, guildId, [itemsInInv[0]._id!], session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    return intReply(i, soldEmbed(i, values[3], itemsInInv, soldValue, embedColor));
  }

  const initialState: State = {
    user,
    color: embedColor,
    itemsInInv,
    itemObj,
    selectedIds: [],

    didSell: false,
    soldItems: [],
    soldValue: 0,
  };

  const dialogs = new Dialogs(i, initialState, view, "pardot", { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId, componentType } = int;
    if (customId === ComponentId.Select && componentType === ComponentType.StringSelect) {
      state.selectedIds = int.values;
      return { update: true };
    } else if (customId === ComponentId.Confirm && componentType === ComponentType.Button) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const userItemIds = user.specialItems.map((item) => item._id!);
      const hasEvery = state.selectedIds.every((id) => userItemIds.includes(id));

      if (!hasEvery) {
        // prettier-ignore
        intReply(int, ephemeralReply(
          'Tava inventāra saturs ir mainījies, kāda no izvēlētām mantām vairs nav tavā inventārā'
        ));

        return { end: true };
      }

      const selectedItems = itemsInInv.filter((item) => state.selectedIds.includes(item._id!));
      const soldValue = selectedItems.reduce((p, { attributes }) => {
        return (
          p + ("dynamicValue" in itemObj && itemObj.dynamicValue ? itemObj.dynamicValue(attributes) : itemObj.value)
        );
      }, 0);

      if (!selectedItems.length) return;

      const taxPaid = Math.floor(soldValue * PIRKT_PARDOT_NODOKLIS);

      const { ok, values } = await mongoTransaction((session) => [
        () => addLati(i.client.user!.id, guildId, taxPaid, session),
        () => addLati(userId, guildId, soldValue, session),
        () => setStats(userId, guildId, { soldShop: soldValue, taxPaid }, session),
        () => removeItemsById(userId, guildId, state.selectedIds, session),
      ]);

      if (!ok) return { error: true };

      state.didSell = true;
      state.user = values[3];
      state.soldItems = selectedItems;
      state.soldValue = soldValue;

      return {
        update: true,
        end: true,
      };
    }
  });
}
