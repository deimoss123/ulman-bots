import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import latiString from '../../../embeds/helpers/latiString';
import UserProfile from '../../../interfaces/UserProfile';
import itemList, { ItemCategory, ItemKey } from '../../../items/itemList';
import { KazinoLikme } from '../rulete/rulete';
import { FENIKS_MIN_LIKME } from './feniks';

export default function feniksComponents(
  likme: KazinoLikme,
  { lati, items }: UserProfile,
  isFree: boolean,
  spinning = false
  // selected: string | null = null
) {
  const canSpinAgain = typeof likme === 'number' ? lati >= likme : lati >= FENIKS_MIN_LIKME;
  const freeSpinsInInv: [ItemKey, number][] = items
    .filter(({ name }) => itemList[name].categories.includes(ItemCategory.BRIVGRIEZIENS))
    .sort((a, b) => itemList[b.name].value - itemList[a.name].value)
    .map(({ name, amount }) => [name, amount]);

  const buttons: ButtonBuilder[] = freeSpinsInInv.map(([name, amount]) =>
    new ButtonBuilder()
      .setCustomId(`freespin_${name}`)
      .setStyle(spinning ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setLabel(`${itemList[name].nameNomVsk} (${amount})`)
      .setEmoji(itemList[name].emoji || '❓')
      .setDisabled(spinning)
  );

  if (!isFree) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId('feniks_spin_again')
        .setDisabled(spinning || !canSpinAgain)
        .setStyle(spinning ? ButtonStyle.Secondary : canSpinAgain ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setLabel(`Griezt vēlreiz | ${typeof likme === 'number' ? latiString(likme) : likme}`)
    );
  }

  return buttons.length ? [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)] : [];
}
