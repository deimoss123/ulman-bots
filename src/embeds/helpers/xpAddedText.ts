import { AddXpReturn } from '../../economy/addXp';
import itemList from '../../items/itemList';
import levelsList, { MAX_LEVEL } from '../../levelingSystem/levelsList';
import itemString from './itemString';
import latiString from './latiString';

// prefixText piemērs - "Par zvejošanu tu saņēmi" ...
export default function xpAddedText(
  leveledUser: AddXpReturn,
  xpToAdd: number,
  prefixText: string
): string {
  const { user, levelIncrease, maxLevelReward, excessXp } = leveledUser;

  const XP_BAR_LENGTH = 20;

  let xpBar = '';
  let xpText = '🔥';

  if (user.level !== MAX_LEVEL) {
    const filledSlots = '#'.repeat(
      Math.round((XP_BAR_LENGTH / levelsList[user.level + 1].xp) * excessXp)
    );
    xpBar += filledSlots + '-'.repeat(XP_BAR_LENGTH - filledSlots.length);
    xpBar = `**${user.level}** \`[${xpBar}]\` **${user.level + 1}**\n`;

    xpText = `| UlmaņPunkti: ${user.xp}/${levelsList[user.level + 1].xp}`;
  }

  let levelIncreaseText = '';
  if (levelIncrease) {
    let rewardText = '';
    let addedLati = 0;
    for (const levelReward of levelIncrease.rewards) {
      if (levelReward.lati) addedLati += levelReward.lati;
      if (levelReward.item)
        rewardText += Object.entries(levelReward.item)
          .map(([key, amount]) => itemString(itemList[key], amount))
          .join(', ');
    }

    levelIncreaseText =
      `\nPalielināts līmenis **${levelIncrease.from}** ➔ **${levelIncrease.to}**\n` +
      `Līmeņa palielināšanas bonuss: ${
        addedLati ? `${latiString(addedLati)} ` : ''
      }${rewardText}\n`;
  }

  return (
    `${prefixText} **${xpToAdd}** UlmaņPunktu${xpToAdd === 1 ? '' : 's'}\n` +
    `Līmenis: **${user.level}** ${xpText}\n` +
    xpBar +
    levelIncreaseText +
    (maxLevelReward ? `Maksimālā līmeņa bonuss: **${latiString(maxLevelReward)}**` : '')
  );
}
