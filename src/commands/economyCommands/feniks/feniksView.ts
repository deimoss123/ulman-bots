import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle } from 'discord.js';
import UserProfile from '../../../interfaces/UserProfile';
import { KazinoLikme } from '../rulete/rulete';
import { CalcSpinRes } from './calcSpin';
import emoji from '../../../utils/emoji';
import latiString from '../../../embeds/helpers/latiString';
import feniksLaimesti from './feniksLaimesti';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import itemList, { ItemKey } from '../../../items/itemList';

export type FeniksState = {
  likme: KazinoLikme;
  likmeLati: number;
  spinCount: number;
  isFree: boolean;
  spinRes: CalcSpinRes;
  wonLati: number;

  canSpinAgain: boolean;
  freeSpinsInInv: [ItemKey, number][];

  user: UserProfile;
  isSpinning: boolean;
};

export const enum ComponentId {
  SpinAgain = 'feniks_spin_again',

  FreeSpin10 = 'feniks_freespin_10',
  FreeSpin25 = 'feniks_freespin_25',
  FreeSpin50 = 'feniks_freespin_50',
  FreeSpin100 = 'feniks_freespin_100',
}

export const FreeSpinIds: Record<string, ComponentId> = {
  brivgriez10: ComponentId.FreeSpin10,
  brivgriez25: ComponentId.FreeSpin25,
  brivgriez50: ComponentId.FreeSpin50,
  brivgriez100: ComponentId.FreeSpin100,
};

export default function feniksView(state: FeniksState, i: BaseInteraction) {
  const emptyEmoji = emoji('blank');
  const arrow_1_left = emoji('icon_arrow_1_left');
  const arrow_1_right = emoji('icon_arrow_1_right');
  const arrow_2_left = emoji('icon_arrow_2_left');
  const arrow_2_right = emoji('icon_arrow_2_right');

  let title = 'Griežas...';
  let emojiRow = Array(state.spinCount).fill(emoji('f_spin')).join('');
  let multiplierRow = Array(state.spinCount).fill(emptyEmoji).join('');

  if (!state.isSpinning) {
    const { emojiGroups, totalMultiplier } = state.spinRes!;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(state.wonLati, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];
    const multiplierArr: string[] = [];

    for (const { name, count, isWinner } of emojiGroups) {
      emojiArr.push(...Array(count).fill(feniksLaimesti[name].emoji()));

      if (!isWinner) {
        multiplierArr.push(...Array(count).fill(emptyEmoji));
      } else {
        multiplierArr.push(
          ...Array(count)
            .fill('')
            .map((_, i) => {
              const emojiName = `${name}_${count}_${i + 1}`;
              return emoji(emojiName);
            }),
        );
      }
    }

    emojiRow = emojiArr.join('');
    multiplierRow = multiplierArr.join('');
  }

  const buttons: ButtonBuilder[] = state.freeSpinsInInv.map(([name, amount]) =>
    new ButtonBuilder()
      .setCustomId(FreeSpinIds[name] || '_')
      .setStyle(state.isSpinning ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setLabel(`${itemList[name].nameNomVsk} (${amount})`)
      .setEmoji(itemList[name].emoji() || '❓')
      .setDisabled(state.isSpinning),
  );

  if (!state.isFree) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId('feniks_spin_again')
        .setDisabled(state.isSpinning || !state.canSpinAgain)
        .setStyle(
          state.isSpinning ? ButtonStyle.Secondary : state.canSpinAgain ? ButtonStyle.Primary : ButtonStyle.Danger,
        )
        .setLabel(`Griezt vēlreiz | ${typeof state.likme === 'number' ? latiString(state.likme) : state.likme}`),
    );
  }

  const components = buttons.length ? [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)] : [];

  const m = state.spinRes?.totalMultiplier;

  return embedTemplate({
    i,
    title,
    content: '\u200B',
    color: state.isSpinning
      ? commandColors.feniks
      : m >= 15
        ? 0xf066ff
        : m >= 8
          ? 0x9966ff
          : m >= 5
            ? 0x66ffc2
            : m >= 2
              ? 0x96ff66
              : m >= 1.1
                ? 0xe0ff66
                : m >= 0.9
                  ? 0xffff66
                  : m >= 0.7
                    ? 0xffd166
                    : m >= 0.3
                      ? 0xff8f66
                      : m > 0
                        ? 0xff7a66
                        : 0xff4230,
    description:
      (state.isSpinning ? arrow_1_right : arrow_2_right) +
      `${emptyEmoji}${emojiRow}${emptyEmoji}` +
      (state.isSpinning ? arrow_1_left : arrow_2_left) +
      `\n${emptyEmoji.repeat(2)}${multiplierRow}${emptyEmoji.repeat(2)}\n\n` +
      `**Likme:** ${latiString(state.likmeLati)} ` +
      (state.isFree ? '**(brīvgrieziens)**' : typeof state.likme !== 'number' ? `(${state.likme})` : ''),
    components,
  });
}
