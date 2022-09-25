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

const EMOJI_COUNT = 5;

function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
    const { emojiGroups, totalMultiplier } = spinRes;

    if (!totalMultiplier) title = 'Šodien nepaveicās, tu neko nelaimēji';
    else title = `Tu laimēji ${latiString(wonLati, true)} | ${totalMultiplier}x`;

    const emojiArr: string[] = [];

    for (const { name, count } of emojiGroups) {
      emojiArr.push(...Array(count).fill(feniksLaimesti[name].emoji));
    }

    emojiRow = emojiArr.join('');
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

interface CalcSpinRes {
  emojiGroups: {
    name: string;
    count: number;
    isWinner: boolean;
  }[];
  totalMultiplier: number;
}

function calcSpin(): CalcSpinRes {
  const res: Record<string, number> = {};
  let emojiGroups: CalcSpinRes['emojiGroups'] = [];
  let totalMultiplier = 0;

  for (let i = 0; i < EMOJI_COUNT; i++) {
    const { key } = chance(feniksLaimesti);
    res[key] = res[key] ? res[key] + 1 : 1;
  }

  for (const [name, count] of Object.entries(res)) {
    const { multipliers } = feniksLaimesti[name];
    if (multipliers?.[count]) {
      totalMultiplier += multipliers[count];
      emojiGroups.push({ name, count, isWinner: true });
    } else {
      emojiGroups.push(...Array(count).fill({ name, count: 1, isWinner: false }));
    }
  }

  emojiGroups = shuffleArray(emojiGroups);
  totalMultiplier = Math.floor(totalMultiplier * 100) / 100;

  // console.log('-'.repeat(50));
  // console.log('res', res);
  // console.log('total multiplier', totalMultiplier);
  // console.log('emojiGroups', emojiGroups);
  // console.log('-'.repeat(50));

  return {
    emojiGroups,
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

  // testSpins(1_000_000);

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
