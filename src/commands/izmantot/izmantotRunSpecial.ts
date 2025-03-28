import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  RepliableInteraction,
  StringSelectMenuBuilder,
} from "discord.js";
import findUser from "@/db/findUser";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import { displayAttributes } from "@/utils/strings/displayAttributes";
import itemString, { itemStringCustom } from "@/utils/strings/itemString";
import { AttributeItem, NotSellableItem } from "@/types/Item";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import itemList, { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import { attributeItemSort } from "@/commands/inventars/inventars";
import { Dialogs } from "@/utils/dialogs";

type State = {
  itemsInInv: SpecialItemInProfile[];
  itemObj: AttributeItem<ItemAttributes>;
  selectedId: string | null;
};

const enum ComponentId {
  Confirm = "izmantot_special_confirm",
  UseMany = "izmantot_special_many",
  Select = "izmantot_special_select",
}

function view(state: State, i: BaseInteraction) {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentId.Confirm)
      .setDisabled(!state.selectedId)
      .setLabel("Izmantot")
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
        .setPlaceholder("Izvēlies kuru izmantot")
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
            .map((item) => ({
              label: itemStringCustom(state.itemObj, item.attributes?.customName),
              description: displayAttributes(item, true),
              value: item._id!,
              emoji:
                (state.itemObj.customEmoji ? state.itemObj.customEmoji(item.attributes) : state.itemObj.emoji()) ||
                "❓",
              default: state.selectedId === item._id,
            })),
        ),
    ),
    buttonRow,
  ];

  return mainEmbed({
    i,
    color: 0x000000,
    description:
      `Tavā inventārā ir **${itemString(state.itemObj, state.itemsInInv.length)}**\n` +
      `No saraksta izvēlies kuru tu gribi izmantot`,
    components,
  });
}

export default async function izmantotRunSpecial(
  i: RepliableInteraction,
  itemKey: ItemKey,
  itemsInInv: SpecialItemInProfile[],
  user: UserProfile,
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const itemObj = itemList[itemKey] as AttributeItem | NotSellableItem;

  // ja inventārā tikai viena manta, tad izmanto pa taisno
  if (itemsInInv.length === 1) {
    const selectedItem = itemsInInv[0];
    return itemObj.use(i, user, itemKey, selectedItem);
  }

  const initialState: State = {
    itemsInInv,
    itemObj,
    selectedId: null,
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot", { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId } = int;

    if (customId === ComponentId.Select && int.isStringSelectMenu()) {
      state.selectedId = int.values[0];
      return { update: true };
    }

    if (!int.isButton()) return;

    if (customId === ComponentId.Confirm) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const selectedItem = user.specialItems.find((item) => item._id === state.selectedId);

      if (!selectedItem) {
        state.selectedId = null;
        state.itemsInInv = user.specialItems.filter((item) => item.name === itemKey);

        intReply(int, ephemeralReply("Tavs inventāra saturs ir mainījies, šī manta vairs nav tavā inventārā"));
        return { edit: true };
      }

      itemObj.use(int, user, itemKey, selectedItem);
      return { end: true };
    }

    if (customId === ComponentId.UseMany) {
      if (!itemObj.useMany) return { error: true };

      itemObj.useMany!.runFunc(int);
      return { end: true };
    }
  });
}
