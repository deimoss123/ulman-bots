import { ButtonInteraction, CommandInteraction, Message } from 'discord.js';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import latiString from '../../../embeds/helpers/latiString';
import chance from '../../../items/helpers/chance';
import feniksLaimesti from './feniksLaimesti';

const spinEmoji = {
  id: '917087131128700988',
  name: 'fenka1',
};

const EMOJI_COUNT = 6;

function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

interface EmojiRowGroup {
  key: string;
  count: number;
  isMatching: boolean;
}

function makeEmojiRow(spinRes: CalcSpinRes): string[] {
  const { res, winners } = spinRes;

  let emojiRowGrouped: EmojiRowGroup[] = [];

  for (const w of winners) {
    emojiRowGrouped.push({ ...w, isMatching: true });
    res[w.key] -= w.count;
  }

  for (const [key, count] of Object.entries(res)) {
    emojiRowGrouped.push(...Array(count).fill({ key, count: 1, isMatching: false }));
  }

  emojiRowGrouped = shuffleArray<EmojiRowGroup>(emojiRowGrouped);

  const emojiRowFinal: string[] = [];
  for (const { key, count, isMatching } of emojiRowGrouped) {
    const { emoji } = feniksLaimesti[key];
    if (!isMatching) {
      emojiRowFinal.push(emoji.noBorder);
      continue;
    }

    // yandere dev tipa programmēšana
    for (let i = 0; i < count; i++) {
      if (count === 1) emojiRowFinal.push(emoji.allBorder);
      else if (i === 0) emojiRowFinal.push(emoji.leftBorder);
      else if (i === count - 1) emojiRowFinal.push(emoji.rightBorder);
      else emojiRowFinal.push(emoji.midBorder);
    }
  }

  return emojiRowFinal;
}

function makeEmbed(
  i: CommandInteraction | ButtonInteraction,
  likme: number,
  isFree: boolean,
  spinRes?: CalcSpinRes,
  wonLati?: number
) {
  let title = 'Griežas...';
  let emojiRow = Array(EMOJI_COUNT).fill(`<a:${spinEmoji.name}:${spinEmoji.id}>`).join('');

  if (spinRes && wonLati !== undefined) {
    const { res, totalMultiplier } = spinRes;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(wonLati, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];

    for (const [key, value] of Object.entries(res)) {
      emojiArr.push(...Array(value).fill(feniksLaimesti[key].emoji.noBorder));
    }

    emojiRow = makeEmojiRow(spinRes).join('');
  }

  return [
    embedTemplate({
      i,
      title,
      color: 0x2e3035,
      description:
        `**>>**\u2800${emojiRow}\u2800**<<**\n\n` +
        `**Likme:** ${latiString(likme)} ${isFree ? '**(brīvgrieziens)**' : ''}`,
    }).embeds![0],
  ];
}

type Winners = { key: string; count: number }[];

// rekursija :^)
function variationsCalc(
  variations: number[],
  currentIndex: number,
  key: string,
  countLeft: number,
  winners: Winners
): Winners {
  if (currentIndex < 0) return winners;

  if (variations[currentIndex] <= countLeft) {
    countLeft -= variations[currentIndex];
    winners.push({ key, count: variations[currentIndex] });
    return variationsCalc(variations, currentIndex, key, countLeft, winners);
  }

  return variationsCalc(variations, currentIndex - 1, key, countLeft, winners);
}

interface CalcSpinRes {
  res: Record<string, number>;
  winners: Winners;
  totalMultiplier: number;
}

function calcSpin(): CalcSpinRes {
  const res: Record<string, number> = {};
  const winners: Winners = [];

  for (let i = 0; i < EMOJI_COUNT; i++) {
    const { key } = chance(feniksLaimesti);
    res[key] = res[key] ? res[key] + 1 : 1;
  }

  // console.log(res);

  for (const [key, value] of Object.entries(res)) {
    const { variations } = feniksLaimesti[key];
    winners.push(...variationsCalc(variations, variations.length - 1, key, value, []));
  }

  const totalMultiplier =
    Math.floor(winners.reduce((prev, curr) => prev + feniksLaimesti[curr.key].multiplier * curr.count ** 2, 0) * 100) /
    100;

  // console.log();
  // console.log('res', res);
  // console.log('winners', winners);
  // console.log('total multiplier', totalMultiplier);
  // console.log();

  return {
    res,
    winners,
    totalMultiplier,
  };
}

function testSpins(count: number) {
  console.log('Testē griezienus...');

  let totalMultiplierSum = 0;
  for (let i = 0; i < count; i++) {
    totalMultiplierSum += calcSpin().totalMultiplier;
  }

  console.log(`Skaits: ${count}, vidējais reizinātajs - ${totalMultiplierSum / count}`);
}

export default async function feniksRun(
  i: CommandInteraction | ButtonInteraction,
  likme: number,
  isFree = false
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return;

  if (!isFree && likme > user.lati) {
    return i.reply(
      ephemeralReply(
        `Tu nevari griezt aparātu ar likmi **${latiString(likme)}**\n` + `Tev ir **${latiString(user.lati)}**`
      )
    );
  }

  const msgSpinning = await i.reply({
    content: '\u200B',
    embeds: makeEmbed(i, likme, isFree),
    components: [],
    fetchReply: true,
  });

  testSpins(1_000_000);

  const spinRes = calcSpin();
  const latiWon = Math.floor(likme * spinRes.totalMultiplier);

  const msg = (await new Promise(res => {
    setTimeout(async () => {
      const userAfter = await addLati(userId, guildId, latiWon - (isFree ? 0 : likme));
      res(
        await msgSpinning.edit({
          embeds: makeEmbed(i, likme, isFree, spinRes, latiWon),
        })
      );
    }, 1500);
  })) as Message;
}
