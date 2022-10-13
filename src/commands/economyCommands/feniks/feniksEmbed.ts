import { ButtonInteraction, CommandInteraction } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import iconEmojis from '../../../embeds/iconEmojis';
import { KazinoLikme } from '../rulete/rulete';
import { CalcSpinRes } from './calcSpin';
import feniksLaimesti from './feniksLaimesti';
import multiplierEmojis from './multiplierEmojis';

const spinEmoji = {
  id: '1030179417810534503',
  name: 'spin',
};

const emptyEmoji = '<:tuksums:1030165403822981270>';

export default function feniksEmbed(
  i: CommandInteraction | ButtonInteraction,
  likme: KazinoLikme,
  likmeLati: number,
  spinCount: number,
  isFree: boolean,
  spinRes?: CalcSpinRes,
  wonLati?: number
) {
  let title = 'Griežas...';
  let emojiRow = Array(spinCount).fill(`<a:${spinEmoji.name}:${spinEmoji.id}>`).join('');
  let multiplierRow = Array(spinCount).fill(emptyEmoji).join('');
  const isSpinning = !spinRes && wonLati === undefined;

  if (!isSpinning) {
    const { emojiGroups, totalMultiplier } = spinRes!;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(wonLati!, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];
    const multiplierArr: string[] = [];

    for (const { name, count, isWinner } of emojiGroups) {
      emojiArr.push(...Array(count).fill(feniksLaimesti[name].emoji));

      if (!isWinner) {
        multiplierArr.push(...Array(count).fill(emptyEmoji));
      } else {
        multiplierArr.push(
          ...Array(count)
            .fill('')
            .map((_, i) => {
              const emojiName = `${name}_${count}_${i + 1}`;
              return `<:${emojiName}:${multiplierEmojis[emojiName]}>`;
            })
        );
      }
    }

    emojiRow = emojiArr.join('');
    multiplierRow = multiplierArr.join('');
  }

  const m = spinRes?.totalMultiplier;

  return embedTemplate({
    i,
    title,
    color:
      m === undefined
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
      (isSpinning ? iconEmojis.arrow_1_right : iconEmojis.arrow_2_right) +
      `${emptyEmoji}${emojiRow}${emptyEmoji}` +
      (isSpinning ? iconEmojis.arrow_1_left : iconEmojis.arrow_2_left) +
      `\n${emptyEmoji.repeat(2)}${multiplierRow}${emptyEmoji.repeat(2)}\n\n` +
      `**Likme:** ${latiString(likmeLati)} ` +
      (isFree ? '**(brīvgrieziens)**' : typeof likme !== 'number' ? `(${likme})` : ''),
  }).embeds;
}
