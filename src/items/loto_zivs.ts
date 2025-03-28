import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import removeItemsById from "@/db/removeItemsById";
import chance, { ChanceRecord, ChanceObj } from "@/utils/chance";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import { item, AttributeItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import UserProfile from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import { Dialogs } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import mongoTransaction from "@/utils/mongoTransaction";
import itemString from "@/utils/strings/itemString";
import { useDifferentItemSelectMenu, useDifferentItemHandler } from "@/utils/useDifferentItem";
import { BaseInteraction, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from "discord.js";

const fishCountChance: ChanceRecord = {
  3: { chance: "*" }, // 0.25
  4: { chance: "*" }, // 0.25
  5: { chance: 0.2 },
  6: { chance: 0.15 },
  7: { chance: 0.1 },
  8: { chance: 0.05 },
};

function generateFishCount() {
  return +chance(fishCountChance).key;
}

const lotoFishChanceObj: Record<ItemKey, ChanceObj> = {
  lidaka: { chance: "*" },
  asaris: { chance: "*" },
  lasis: { chance: "*" },
  petniekzivs: { chance: 0.15 },
  juridiska_zivs: { chance: 0.1 },
  divaina_zivs: { chance: 0.1 },
};

type State = {
  user: UserProfile;
  itemId: string;
  wonFishArr: ItemKey[];
  wonFishObj: Record<ItemKey, number>;
  isSpinning: boolean;
};

function view(state: State, i: BaseInteraction) {
  const emptyEmoji = emoji("blank");
  const arrow_1_left = emoji("icon_arrow_1_left");
  const arrow_1_right = emoji("icon_arrow_1_right");
  const arrow_2_left = emoji("icon_arrow_2_left");
  const arrow_2_right = emoji("icon_arrow_2_right");

  const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

  if (!state.isSpinning && state.user.specialItems.filter(({ name }) => name === "loto_zivs").length) {
    components.push(useDifferentItemSelectMenu(state.user, "loto_zivs", state.itemId));
  }

  return mainEmbed({
    i,
    color: state.isSpinning ? commandColors.feniks : 0xf080ff,
    title: `Izmantot: ${itemString(itemList.loto_zivs, null, true)} (satur ${state.wonFishArr.length} zivis)`,
    description:
      (state.isSpinning ? arrow_1_right : arrow_2_right) +
      emptyEmoji +
      (state.isSpinning
        ? Array(state.wonFishArr.length).fill(emoji("icon_loto_zivs_spin"))
        : state.wonFishArr.map((key) => itemList[key].emoji())
      ).join(" ") +
      emptyEmoji +
      (state.isSpinning ? arrow_1_left : arrow_2_left),
    fields: state.isSpinning
      ? []
      : [
          {
            name: "Tu laimēji:",
            value: Object.entries(state.wonFishObj)
              .map(([key, amount]) => itemString(itemList[key], amount, true))
              .join("\n"),
            inline: true,
          },
        ],
    components,
  });
}

const use: UsableAttributeItemFunc = async (i, user, _, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const holdsFishCount = specialItem.attributes.holdsFishCount!;
  const freeSlots = countFreeInvSlots(user);

  if (freeSlots < holdsFishCount - 1) {
    return intReply(
      i,
      ephemeralReply(
        `Lai izmantotu ${itemString(itemList.loto_zivs, null, true)} kas satur **${holdsFishCount}** zivis, ` +
          `tev inventārā ir jābūt vismaz **${holdsFishCount - 1}** brīvām vietām\n` +
          `Tev ir ${freeSlots} brīvas vietas`,
      ),
    );
  }

  const wonFishObj: Record<ItemKey, number> = {};
  const wonFishArr: ItemKey[] = [];
  for (let i = 0; i < holdsFishCount; i++) {
    const { key } = chance(lotoFishChanceObj);
    wonFishArr.push(key);
    wonFishObj[key] = wonFishObj[key] ? wonFishObj[key] + 1 : 1;
  }

  const { ok, values } = await mongoTransaction((session) => [
    () => addItems(userId, guildId, { ...wonFishObj }, session),
    () => removeItemsById(userId, guildId, [specialItem!._id!], session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  const userNew = values[1];

  const initialState: State = {
    user: userNew,
    itemId: specialItem!._id!,
    wonFishArr,
    wonFishObj,
    isSpinning: true,
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot", { time: 30000, isActive: true });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  setTimeout(() => {
    dialogs.state.isSpinning = false;
    dialogs.setActive(false);
    dialogs.edit();
  }, 1000);

  dialogs.onClick(async (int, state) => {
    if (state.isSpinning) return {};

    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    state.user = user;

    if (int.customId === "use_different" && int.componentType === ComponentType.StringSelect) {
      return useDifferentItemHandler(user, "loto_zivs", int);
    }
  });
};

type Attributes = {
  holdsFishCount: number;
};

const loto_zivs = item<AttributeItem<Attributes>>({
  info:
    "Uzgriez loto zivi un kā laimestu saņem... zivis\n" +
    'Loto zivij piemīt atribūts "Satur **x** zivis", kas nosaka cik zivis no loto zivs ir iespējams laimēt',
  addedInVersion: "4.1",
  nameNomVsk: "loto zivs",
  nameNomDsk: "loto zivis",
  nameAkuVsk: "loto zivi",
  nameAkuDsk: "loto zivis",
  isVirsiesuDzimte: false,
  emoji: () => emoji("loto_zivs"),
  imgLink: "https://www.ulmanbots.lv/images/items/loto_zivs.gif",
  categories: [ItemCategory.ZIVIS],
  value: 0,
  customValue: ({ holdsFishCount }) => holdsFishCount! * 10,
  defaultAttributes: () => ({
    holdsFishCount: generateFishCount(),
  }),
  sortBy: { holdsFishCount: 1 },
  use,
});

export default loto_zivs;
