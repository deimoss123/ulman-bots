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

function makeEmbed(
  i: CommandInteraction | ButtonInteraction,
  likme: number,
  isFree: boolean,
  spinRes?: CalcSpinRes,
  wonLati?: number
) {
  let title = 'Griežas...';
  let emojiRow = Array(5).fill(`<a:${spinEmoji.name}:${spinEmoji.id}>`).join('\u2800');

  if (spinRes && wonLati !== undefined) {
    const { res, totalMultiplier } = spinRes;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(wonLati, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];

    for (const [key, value] of Object.entries(res)) {
      emojiArr.push(...Array(value).fill(feniksLaimesti[key].emoji));
    }

    emojiRow = emojiArr.join('\u2800');
  }

  return [
    embedTemplate({
      i,
      title,
      color: 0x2e3035,
      description:
        `**>>**\u2800\u2800${emojiRow}\u2800\u2800**<<**\n\n` +
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

  for (let i = 0; i < 5; i++) {
    const { key } = chance(feniksLaimesti);
    res[key] = res[key] ? res[key] + 1 : 1;
  }

  // console.log(res);

  for (const [key, value] of Object.entries(res)) {
    const { variations } = feniksLaimesti[key];
    winners.push(...variationsCalc(variations, variations.length - 1, key, value, []));
  }

  const totalMultiplier = winners.reduce(
    (prev, curr) => prev + feniksLaimesti[curr.key].multiplier * curr.count ** 2,
    0
  );

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
  const user = await findUser(i.user.id);
  if (!user) return;

  if (!isFree && likme > user.lati) {
    return i.reply(
      ephemeralReply(
        `Tu nevari griezt aparātu ar likmi **${latiString(likme)}**\n` +
          `Tev ir **${latiString(user.lati)}**`
      )
    );
  }

  const msgSpinning = await i.reply({
    content: '\u200B',
    embeds: makeEmbed(i, likme, isFree),
    components: [],
    fetchReply: true,
  });

  // testSpins(1_000_000);

  const spinRes = calcSpin();
  const latiWon = Math.floor(likme * spinRes.totalMultiplier);

  const msg = (await new Promise((res) => {
    setTimeout(async () => {
      const userAfter = await addLati(i.user.id, latiWon - (isFree ? 0 : likme));
      res(
        await msgSpinning.edit({
          embeds: makeEmbed(i, likme, isFree, spinRes, latiWon),
        })
      );
    }, 2000);
  })) as Message;
}
