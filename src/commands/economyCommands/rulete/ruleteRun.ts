import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import itemList from '../../../items/itemList';
import interactionCache from '../../../utils/interactionCache';
import generateRulete, { GenerateRuleteRes, RulColors } from './generateRulete';
import { KazinoLikme } from './rulete';
import { RulPosition, rulPositions } from './ruleteData';
import ruleteEmojis from './ruleteEmojis';

const colorsLat: Record<RulColors, string> = {
  black: 'melns',
  red: 'sarkans',
  green: 'zaļš',
};

const rulColor = {
  winBig: 0xc337fa,
  win: 0x4eed54,
  lose: 0x9d2235,
};

const RULETE_MIN_LIKME = 20;

function ruleteEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  position: RulPosition | number,
  likme: KazinoLikme,
  likmeLati: number,
  { num, color, didWin, multiplier }: GenerateRuleteRes,
  spinning = false
) {
  const isLikmeNum = typeof likme === 'number';
  const isPosNum = typeof position === 'number';

  let emojisStr = '';
  for (let j = 1; j <= 6; j++) {
    const key = spinning ? `spin_${j}` : `rul_${j}_${num < 10 ? `0${num}` : num}`;
    emojisStr += `<${spinning ? 'a' : ''}:${key}:${ruleteEmojis[key]}>`;
    if (j === 3) emojisStr += '\n';
  }

  return embedTemplate({
    i,
    color: spinning
      ? commandColors.rulete
      : didWin
      ? isPosNum && position === num
        ? rulColor.winBig
        : rulColor.win
      : rulColor.lose,
    title: spinning
      ? 'Griežas...'
      : didWin
      ? `Tu laimēji ${latiString(likmeLati * multiplier, true)} (${multiplier}x)`
      : 'Tu neko nelaimēji (nākamreiz paveiksies)',
    fields: [
      {
        name: spinning ? '\u200B' : `${num} ${colorsLat[color]}`,
        value:
          `${emojisStr}\n\n` +
          `**Likme:** ${latiString(likmeLati)} ${!isLikmeNum ? `(${likme})` : ''} \n` +
          `**Pozīcija:** ${isPosNum ? position : rulPositions[position].name}`,
        inline: false,
      },
    ],
  }).embeds;
}

function rulComponents(position: RulPosition | number, likme: KazinoLikme, lati: number | undefined, spinning = false) {
  const canSpinAgain = lati === undefined ? true : typeof likme === 'number' ? lati >= likme : lati >= RULETE_MIN_LIKME;

  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('rulete_spin_again')
        .setDisabled(spinning || !canSpinAgain)
        .setStyle(spinning ? ButtonStyle.Secondary : canSpinAgain ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setLabel(
          `Griezt vēlreiz | ` +
            `${typeof position === 'number' ? position : rulPositions[position].shortName} | ` +
            `${typeof likme === 'number' ? latiString(likme) : likme}`
        )
    ),
  ];
}

export default async function ruleteRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  position: RulPosition | number,
  likme: KazinoLikme
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return i.reply(errorEmbed);

  const { lati, items } = user;

  if (lati < RULETE_MIN_LIKME) {
    return i.reply(
      ephemeralReply(
        `Tev vajag vismaz ${latiString(RULETE_MIN_LIKME, true, true)} lai grieztu ruleti\n` +
          `Tev ir ${latiString(lati, false, true)}`
      )
    );
  }

  if (typeof likme === 'number' && lati < likme) {
    return i.reply(
      ephemeralReply(
        `Tu nepietiek naudas lai griezt ruleti ar likmi ${latiString(likme, false, true)}\n` +
          `Tev ir ${latiString(lati, false, true)}`
      )
    );
  }

  if (likme === 'virve') {
    const hasVirve = items.find(item => item.name === 'virve');
    if (!hasVirve) {
      return i.reply(
        ephemeralReply(
          `Lai grieztu ruleti ar likmi \`virve\`, tev inventārā ir jābūt **${itemString(
            itemList.virve
          )}** (nopērkama veikalā)`
        )
      );
    }
  }

  const likmeLati =
    typeof likme === 'number'
      ? likme
      : likme === 'virve'
      ? Math.floor(Math.random() * (lati - RULETE_MIN_LIKME) + RULETE_MIN_LIKME)
      : lati;

  const rulRes = generateRulete(position);
  const latiToAdd = (rulRes.multiplier - 1) * likmeLati;

  const [userAfter, msg] = await Promise.all([
    addLati(userId, guildId, latiToAdd),
    i.reply({
      content: '\u200B',
      embeds: ruleteEmbed(i, position, likme, likmeLati, rulRes, true),
      components: rulComponents(position, likme, lati, true),
      fetchReply: true,
    }),
  ]);

  buttonHandler(
    i,
    'rulete',
    msg,
    async int => {
      if (int.customId === 'rulete_spin_again' && int.componentType === ComponentType.Button) {
        return {
          end: true,
          after: async () => {
            ruleteRun(int, position, likme);
          },
        };
      }
    },
    20000,
    true,
    true
  );

  setTimeout(() => {
    // guh
    const a = interactionCache.get(`${userId}-${guildId}`)!.get('rulete')!;
    interactionCache.get(`${userId}-${guildId}`)?.set('rulete', { ...a, isInteractionActive: false });
    i.editReply({
      embeds: ruleteEmbed(i, position, likme, likmeLati, rulRes, false),
      components: rulComponents(position, likme, userAfter?.lati),
    });
  }, 1500);
}
