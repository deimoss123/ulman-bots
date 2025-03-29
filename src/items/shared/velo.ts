import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import addItems from "@/db/addItems";
import addXp from "@/db/addXp";
import findUser from "@/db/findUser";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import itemString from "@/utils/strings/itemString";
import xpAddedEmbed from "@/utils/embeds/xpAddedEmbed";
import { UsableItemFunc } from "@/types/Item";
import { ItemInProfile } from "@/types/UserProfile";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import emoji from "@/utils/emoji";
import commandColors from "@/utils/commandColors";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mongoTransaction from "@/utils/mongoTransaction";

const VELO_XP = 10;

export const veloInfo =
  "Šī ir viena no 4 nepieciešajām detaļām lai sataisītu **Velosipēdu**\n" +
  `Velosipēda sataisīšana pievienos tavam inventāram velospēdu, kā arī tu iegūsi **${VELO_XP}** UlmaņPunktus`;

const requiredItems: Record<ItemKey, number> = {
  velo_ramis: 1,
  velo_ritenis: 2,
  velo_kede: 1,
  velo_sture: 1,
};

type State = {
  hasAll: boolean;
  items: Record<ItemKey, number>;
};

const enum ComponentId {
  Sataisit = "sataisit_velosipedu",
}

const view: DialogsViewFunc<State> = (state, i) => {
  const maxLength = Math.max(...Object.values(state.items)).toString().length;

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.Sataisit)
        .setLabel("Sataisīt velosipēdu")
        .setStyle(state.hasAll ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!state.hasAll),
    ),
  ];

  return mainEmbed({
    i,
    title: `Taisīt ${itemString("velosipeds", null, true)}`,
    description:
      `Ar velosipēda detaļām tu vari sataisīt **${itemString("velosipeds", null, true)}**\n` +
      `Velosipēda izveide dod **10** UlmaņPunktus`,
    fields: [
      {
        name: "Nepieciešamās detaļas:",
        value: Object.entries(state.items)
          .map(
            ([key, amount]) =>
              `${amount >= requiredItems[key] ? emoji("icon_check1") : emoji("icon_cross")} ` +
              `\` ${" ".repeat(maxLength - `${amount}`.length)}${amount}/${requiredItems[key]} \` ` +
              itemString(key),
          )
          .join("\n"),
        inline: false,
      },
    ],
    components,
    color: commandColors.izmantot,
  });
};

function calcReqItems(items: ItemInProfile[]): {
  items: Record<ItemKey, number>;
  hasAll: boolean;
} {
  const reqItemsInv: Record<ItemKey, number> = {};
  let hasAll = true;

  for (const [key, amount] of Object.entries(requiredItems)) {
    const amountInInv = items.find((i) => i.name === key)?.amount ?? 0;
    reqItemsInv[key] = amountInInv;
    if (amountInInv < amount) hasAll = false;
  }

  return {
    items: reqItemsInv,
    hasAll,
  };
}

const velo: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const initialState: State = calcReqItems(user.items);
  const dialogs = new Dialogs(i, initialState, view, "izmantot");

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    if (int.customId === ComponentId.Sataisit && int.isButton()) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const { hasAll, items } = calcReqItems(user.items);
      state.hasAll = hasAll;
      state.items = items;
      if (!state.hasAll) {
        intReply(int, ephemeralReply("Tev nav visas nepieciešamās detaļas, inventāra saturs ir mainījies"));
        return { edit: true, end: true };
      }

      const itemsToRemove: Record<ItemKey, number> = {};
      for (const [key, value] of Object.entries(requiredItems)) {
        itemsToRemove[key] = -value;
      }

      const { ok, values } = await mongoTransaction((session) => [
        () => addXp(userId, guildId, VELO_XP, session),
        () => addItems(userId, guildId, { ...itemsToRemove, velosipeds: 1 }, session),
      ]);

      if (!ok) return { error: true };
      const [userAfterXp, userAfter] = values;

      const { hasAll: hasAll2, items: items2 } = calcReqItems(userAfter.items);
      state.hasAll = hasAll2;
      state.items = items2;

      intReply(int, {
        embeds: [
          new EmbedBuilder()
            .setDescription(`No velosipēda detaļām tu sataisīji **${itemString(itemList.velosipeds, 1, true)}**`)
            .setColor(commandColors.izmantot),
          xpAddedEmbed(userAfterXp, VELO_XP, "Par velosipēda sataisīšanu tu ieguvi"),
        ],
      });

      return { edit: true, end: !state.hasAll };
    }
  });
};

export default velo;
