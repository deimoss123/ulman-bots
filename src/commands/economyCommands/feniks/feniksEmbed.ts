import { ButtonInteraction, CommandInteraction } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import { KazinoLikme } from '../rulete/rulete';
import { CalcSpinRes } from './calcSpin';
import feniksLaimesti from './feniksLaimesti';

const spinEmoji = {
  id: '917087131128700988',
  name: 'fenka1',
};

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

  if (spinRes && wonLati !== undefined) {
    const { emojiGroups, totalMultiplier } = spinRes;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(wonLati, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];

    for (const { name, count } of emojiGroups) {
      emojiArr.push(...Array(count).fill(feniksLaimesti[name].emoji));
    }

    emojiRow = emojiArr.join('');
  }

  return embedTemplate({
    i,
    title,
    color: commandColors.feniks,
    description:
      `**>>**\u2800${emojiRow}\u2800**<<**\n\n` +
      `**Likme:** ${latiString(likmeLati)} ` +
      (isFree ? '**(brīvgrieziens)**' : typeof likme !== 'number' ? `(${likme})` : ''),
  }).embeds;
}
