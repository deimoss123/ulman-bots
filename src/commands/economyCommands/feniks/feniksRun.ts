import { ButtonInteraction, CommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import latiString from '../../../embeds/helpers/latiString';
import { ChanceValue } from '../../../items/helpers/chance';

interface Laimests {
  chance: ChanceValue;
  multiplier: number;
  emoji: string;

  // piemēram [2, 3], ja reizinātājs summējas vairākiem
  variations: number[];
}

export const fenkaLaimesti: Record<string, Laimests> = {
  varde: {
    chance: '*',
    multiplier: 0.01,
    emoji: '<:varde:894250302868443169>',
    variations: [3, 5],
  },
  zivs: {
    chance: 0.2,
    multiplier: 0.05,
    emoji: '<:zivs:894250303094947900>',
    variations: [3, 5],
  },
  nuja: {
    chance: 0.15,
    multiplier: 0.1,
    emoji: '<:nuja:894250302633553931>',
    variations: [2, 3],
  },
  muskulis: {
    chance: 0.1,
    multiplier: 0.2,
    emoji: '<:muskulis:894250303371763762>',
    variations: [2, 3],
  },
  bacha: {
    chance: 0.07,
    multiplier: 0.5,
    emoji: '<:bacha:894250303183020074>',
    variations: [3],
  },
  izbrinits: {
    chance: 0.03,
    multiplier: 1,
    emoji: '<:izbrinits:894250302914592788>',
    variations: [3],
  },
  kabacis: {
    chance: 0.01,
    multiplier: 3,
    emoji: '<:kabacis:894250303191388230>',
    variations: [1, 2, 3],
  },
  ulmanis: {
    chance: 0.007,
    multiplier: 5,
    emoji: '<:ulmanis:894250302839066624>',
    variations: [1, 2, 3],
  },
  petnieks: {
    chance: 0.002,
    multiplier: 10,
    emoji: '<a:petnieks:911599720928002059>',
    variations: [1, 2, 3],
  },
};

const spinEmoji = {
  id: '917087131128700988',
  name: 'fenka1',
};

function makeEmbed(i: CommandInteraction | ButtonInteraction, likme: number) {
  return [
    embedTemplate({
      i,
      title: 'Griežas...',
      color: 0x2e3035,
      description:
        `>>\u2800\u2800${`<a:${spinEmoji.name}:${spinEmoji.id}>\u2800`.repeat(5)}\u2800<<\n\n` +
        `**Likme:** ${latiString(likme)}`,
    }).embeds![0],
  ];
}

const laimesti = {};

export default async function feniksRun(
  i: CommandInteraction | ButtonInteraction,
  likme: number,
  isFree = false
): Promise<any> {
  const msg = await i.reply({
    embeds: makeEmbed(i, likme),
    components: [],
    fetchReply: true,
  });
}
