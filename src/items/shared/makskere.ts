import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle } from "discord.js";
import maksekeresData from "@/commands/zvejot/makskeresData";
import { calcRepairCost } from "@/commands/zvejot/zvejot";
import addLati from "@/db/addLati";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import smallEmbed from "@/utils/embeds/smallEmbed";
import { AttributeItem, UsableAttributeItemFunc } from "@/types/Item";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import mainEmbed from "@/utils/embeds/mainEmbed";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mongoTransaction from "@/utils/mongoTransaction";

export function makskereDisplayAttributes(itemKey: ItemKey) {
  return ({ durability }: ItemAttributes) => `Izturība: ${durability}/${maksekeresData[itemKey].maxDurability}`;
}

export function makskereDynamicValue(itemKey: string): AttributeItem<ItemAttributes>["dynamicValue"] {
  return ({ durability }) => {
    const { value } = itemList[itemKey];
    const { maxDurability } = maksekeresData[itemKey];

    if (durability! <= 0) return 1;

    if (durability! < maxDurability) {
      return Math.floor((durability! / maxDurability) * value);
    }

    return value;
  };
}

export function makskereSort(attrA: ItemAttributes, attrB: ItemAttributes): number {
  return attrA.durability! - attrB.durability!;
}

type State = {
  user: UserProfile;
  itemKey: ItemKey;
  itemObj: AttributeItem;
  makskereInProfile: SpecialItemInProfile;
  repairCost: number;
  hasRepaired: boolean;
};

const enum ComponentId {
  FixFishingRod = "izmantot_makskere_fix_fishing_rod",
}

const view: DialogsViewFunc<State> = (state, i) => {
  const { repairable, maxDurability } = maksekeresData[state.itemKey];

  const { durability } = state.makskereInProfile.attributes!;

  const canAfford = state.user.lati >= state.repairCost;

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.FixFishingRod)
        .setLabel(
          repairable
            ? `Salabot ${state.itemObj.nameAkuVsk} - ${latiString(state.repairCost)}${!canAfford ? " (nevari atļauties)" : ""}`
            : `${capitalizeFirst(state.itemObj.nameNomVsk)} nav salabojama`,
        )
        .setStyle(
          state.hasRepaired ? ButtonStyle.Success : repairable && canAfford ? ButtonStyle.Primary : ButtonStyle.Danger,
        )
        .setDisabled(state.hasRepaired || !repairable || !canAfford)
        .setEmoji(state.itemObj.emoji() || "❓"),
    ),
  ];

  let description = `Makšķeres ir izmantojamas zvejošanai\nSāc zvejot ar komandu \`/zvejot\``;

  if (durability! >= maxDurability) {
    description += "\n\n💡 Ja makšķerei ir samazinājusies izturība, to var salabot ar šo pašu komandu";
  }

  return mainEmbed({
    i,
    title: `Izmantot: ${itemString(state.itemKey, null, true)}`,
    description,
    color: commandColors.izmantot,
    components: durability! < maxDurability ? components : [],
  });
};

const makskere: UsableAttributeItemFunc = async (i, user, itemKey, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const { attributes, _id } = specialItem;
  const { maxDurability, repairable } = maksekeresData[itemKey];

  const repairCost = calcRepairCost(itemKey, attributes.durability!);
  const itemObj = itemList[itemKey] as AttributeItem;

  const initialState: State = {
    user,
    itemKey,
    itemObj,
    makskereInProfile: specialItem,
    repairCost,
    hasRepaired: false,
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot");

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    if (!repairable) return;
    if (int.customId !== ComponentId.FixFishingRod || !int.isButton()) return;

    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    const { lati, specialItems } = user;

    if (lati < repairCost) {
      intReply(
        int,
        ephemeralReply(
          `Tev nepietiek nauda lai salabotu makšķeri - ${latiString(repairCost, false, true)}\n` +
            `Tev ir ${latiString(lati, false, true)}`,
        ),
      );
      return { end: true };
    }

    if (!specialItems.find((item) => item._id === _id)) {
      intReply(int, ephemeralReply("Tavs inventāra saturs ir mainījies, šī makšķere vairs nav tavā inventārā"));
      return { end: true };
    }

    const { ok, values } = await mongoTransaction((session) => [
      () => addLati(userId, guildId, -repairCost, session),
      () => editItemAttribute(userId, guildId, _id!, { durability: maxDurability }, session),
    ]);

    if (!ok) return { error: true };

    const userAfter = values[1];

    state.hasRepaired = true;

    intReply(
      int,
      smallEmbed(
        `Tu salaboji ${bold(itemString(itemObj, null, true))} - ${latiString(repairCost)}\n` +
          itemObj.displayAttributes(userAfter.newItem.attributes, false, Date.now()),
        commandColors.izmantot,
      ),
    );
    return { edit: true, end: true };
  });
};

export default makskere;
