import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import findUser from "@/db/findUser";
import errorEmbed from "@/utils/embeds/errorEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import addLati from "@/db/addLati";
import addItems from "@/db/addItems";
import mainEmbed from "@/utils/embeds/mainEmbed";
import itemList from "@/utils/itemList";
import izmantotRun from "@/commands/izmantot/izmantotRun";
import getItemPrice from "@/utils/getItemPrice";
import { PIRKT_PARDOT_NODOKLIS } from "@/commands/pardot/pardot";
import checkUserSpecialItems from "@/utils/checkUserSpecialItems";
import setStats from "@/db/stats/setStats";
import getDiscounts from "@/utils/getDiscounts";
import intReply from "@/utils/intReply";
import Item from "@/types/Item";
import commandColors from "@/utils/commandColors";
import UserProfile from "@/types/UserProfile";
import mongoTransaction from "@/utils/mongoTransaction";
import { Dialogs } from "@/utils/dialogs";

type State = {
  user: UserProfile;
  itemObj: Item;
  isUsable: boolean;
  amountToBuy: number;
  totalCost: number;
  itemAmountAfterBuy: number;
};

const enum ComponentId {
  Izmantot = "pirkt_izmantot",
}

function view(state: State, i: BaseInteraction) {
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ComponentId.Izmantot)
      .setLabel(`Izmantot (${state.itemAmountAfterBuy})`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(state.itemObj.emoji() || "❓"),
  );

  return mainEmbed({
    i,
    title: "Tu nopirki",
    description: `**${itemString(state.itemObj, state.amountToBuy, true)}** par ${state.totalCost} latiem`,
    color: commandColors.pirkt,
    fields: [
      {
        name: "Tev palika",
        value: latiString(state.user.lati),
        inline: true,
      },
      {
        name: "Tev tagad ir",
        value: itemString(state.itemObj, state.itemAmountAfterBuy),
        inline: true,
      },
    ],
    components: state.isUsable ? [actionRow] : [],
  });
}

export default async function pirktRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemToBuyKey: string,
  amountToBuy: number,
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const [user, discounts] = await Promise.all([findUser(userId, guildId), getDiscounts()]);
  if (!user || !discounts) return intReply(i, errorEmbed);

  const itemObj = itemList[itemToBuyKey];
  const totalCost = getItemPrice(itemToBuyKey, discounts).price * amountToBuy;

  if (totalCost > user.lati) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tev nepietiek naudas lai nopirktu **${itemString(itemObj, amountToBuy, true)}**\n` +
      `Cena: ${latiString(totalCost)}\n` +
      `Tev ir ${latiString(user.lati)}`,
    ));
  }

  const freeSlots = countFreeInvSlots(user);

  if (freeSlots < amountToBuy) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tev nepietiek vietas inventārā lai nopirktu **${itemString(itemObj, amountToBuy, true)}**\n` +
      `Tev ir **${freeSlots}** brīvas vietas`,
    ));
  }

  if ("defaultAttributes" in itemObj) {
    const checkRes = checkUserSpecialItems(user, itemToBuyKey, amountToBuy);
    if (!checkRes.valid) {
      return intReply(i, ephemeralReply(`Neizdevās nopirkt, jo ${checkRes.reason}`));
    }
  }

  const tax = Math.floor(totalCost * PIRKT_PARDOT_NODOKLIS);

  const { ok, values } = await mongoTransaction((session) => [
    () => addLati(i.client.user!.id, guildId, tax, session),
    () => addLati(userId, guildId, -totalCost, session),
    () => setStats(userId, guildId, { spentShop: totalCost, taxPaid: tax }, session),
    () => addItems(userId, guildId, { [itemToBuyKey]: amountToBuy }, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  const userAfter = values[3];

  const itemAmountAfterBuy =
    "defaultAttributes" in itemObj
      ? userAfter.specialItems.filter((item) => item.name === itemToBuyKey).length
      : (userAfter.items.find((item) => item.name === itemToBuyKey)?.amount ?? 0);

  const isUsable = "use" in itemObj;

  const initialState: State = {
    itemObj,
    isUsable,
    user: userAfter,
    totalCost,
    amountToBuy,
    itemAmountAfterBuy,
  };

  if (!isUsable) {
    return intReply(i, view(initialState, i));
  }

  const dialogs = new Dialogs<State>(i, initialState, view, "pirkt", { time: 15000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int) => {
    if (int.customId === ComponentId.Izmantot && int.isButton()) {
      izmantotRun(int, itemToBuyKey);
      return { end: true };
    }
  });
}
