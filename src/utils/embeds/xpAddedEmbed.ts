import { bold, EmbedBuilder } from "discord.js";
import { AddXpReturn } from "@/db/addXp";
import itemList from "@/items/itemList";
import levelsList, { MAX_LEVEL } from "@/levelingSystem/levelsList";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";

const DEFAULT_COLOR = 0x2e3035;
const LEVEL_INCREASE_COLOR = 0xbb4ae8;
const MAX_LEVEL_COLOR = 0xffffff;

// prefixText piemērs - "Par zvejošanu tu saņēmi" ...
export default function xpAddedEmbed(leveledUser: AddXpReturn, xpToAdd: number, prefixText: string) {
  const { user, levelIncrease, maxLevelReward, excessXp } = leveledUser;

  const XP_BAR_LENGTH = 20;

  let xpBar = "";
  let xpText = "🔥";

  if (user.level !== MAX_LEVEL) {
    const filledSlots = "#".repeat(Math.round((XP_BAR_LENGTH / levelsList[user.level + 1].xp) * excessXp));
    xpBar += filledSlots + "-".repeat(XP_BAR_LENGTH - filledSlots.length);
    xpBar = `**${user.level}** \`[${xpBar}]\` **${user.level + 1}**\n`;

    xpText = `| UlmaņPunkti: ${user.xp}/${levelsList[user.level + 1].xp}`;
  }

  let levelIncreaseText = "";
  if (levelIncrease) {
    const rewardsArr: string[] = [];
    let addedLati = 0;
    for (const levelReward of levelIncrease.rewards) {
      if (levelReward.lati) addedLati += levelReward.lati;
      if (levelReward.item) {
        rewardsArr.push(
          ...Object.entries(levelReward.item).map(([key, amount]) => itemString(itemList[key], amount, true)),
        );
      }
      if (levelReward.taxDiscount) {
        const { payTax, giveTax } = levelReward.taxDiscount;
        const taxArr: string[] = [];
        if (payTax) taxArr.push(`maksāšanai (**${Math.floor(payTax * 100)}%**)`);
        if (giveTax) taxArr.push(`iedošanai (**${Math.floor(giveTax * 100)}%**)`);
        rewardsArr.push("Nodokļu atvieglojumu " + taxArr.join(" un "));
      }
      if (levelReward.fishingInvIncrease) {
        rewardsArr.push(`Zvejošanas inventārs palielināts uz **${levelReward.fishingInvIncrease}**`);
      }
    }

    if (addedLati) {
      rewardsArr.unshift(latiString(addedLati, true));
    }

    levelIncreaseText =
      `\nPalielināts līmenis **${levelIncrease.from}** ➔ **${levelIncrease.to}**\n\n` +
      `${bold("Tu saņēmi:")}\n` +
      rewardsArr.map((r) => `> ${r}`).join("\n");
  }

  return new EmbedBuilder()
    .setDescription(
      `${prefixText} **${xpToAdd}** UlmaņPunktu${xpToAdd === 1 ? "" : "s"}\n` +
        `Līmenis: **${user.level}** ${xpText}\n` +
        xpBar +
        levelIncreaseText +
        (maxLevelReward ? `Maksimālā līmeņa bonuss: **${latiString(maxLevelReward)}**` : ""),
    )
    .setColor(levelIncrease ? LEVEL_INCREASE_COLOR : maxLevelReward ? MAX_LEVEL_COLOR : DEFAULT_COLOR);
}
