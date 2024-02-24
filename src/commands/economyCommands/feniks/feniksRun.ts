import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, Message } from 'discord.js';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import setStats from '../../../economy/stats/setStats';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import smallEmbed from '../../../embeds/smallEmbed';
import UserProfile from '../../../interfaces/UserProfile';
import itemList from '../../../items/itemList';
import interactionCache from '../../../utils/interactionCache';
import intReply from '../../../utils/intReply';
import { KazinoLikme } from '../rulete/rulete';
import calcSpin from './calcSpin';
import { FENIKS_MIN_LIKME } from './feniks';
import feniksComponents from './feniksComponents';
import feniksEmbed from './feniksEmbed';

const DEFAULT_EMOJI_COUNT = 5;

export default async function feniksRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  likme: KazinoLikme,
  isFree = false,
  freeSpinName?: string,
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  let user = await findUser(userId, guildId);
  if (!user) return;

  const { lati, items } = user;

  if (!isFree) {
    if (lati < FENIKS_MIN_LIKME) {
      return intReply(
        i,
        ephemeralReply(
          `Tev vajag vismaz ${latiString(FENIKS_MIN_LIKME, true, true)} lai grieztu aparātu\n` +
            `Tev ir ${latiString(lati, false, true)}`,
        ),
      );
    }

    if (typeof likme === 'number' && lati < likme) {
      return intReply(
        i,
        ephemeralReply(
          `Tu nepietiek naudas lai griezt aparātu ar likmi ${latiString(likme, false, true)}\n` +
            `Tev ir ${latiString(lati, false, true)}`,
        ),
      );
    }

    if (likme === 'virve') {
      const hasVirve = items.find(item => item.name === 'virve');
      if (!hasVirve) {
        return intReply(
          i,
          ephemeralReply(
            `Lai grieztu aparātu ar likmi \`virve\`, tev inventārā ir jābūt **${itemString(
              itemList.virve,
            )}** (nopērkama veikalā)`,
          ),
        );
      }
    }
  }

  const likmeLati =
    typeof likme === 'number'
      ? likme
      : likme === 'virve'
        ? Math.floor(Math.random() * (lati - FENIKS_MIN_LIKME) + FENIKS_MIN_LIKME)
        : lati;

  const spinRes = calcSpin(DEFAULT_EMOJI_COUNT);
  const latiWon = Math.floor(likmeLati * spinRes.totalMultiplier);

  if (isFree) {
    user = await addItems(userId, guildId, { [freeSpinName!]: -1 });
    if (!user) return intReply(i, errorEmbed);
  }

  const promises: Promise<any>[] = [
    intReply(i, {
      content: '\u200B',
      embeds: feniksEmbed(i, likme, likmeLati, DEFAULT_EMOJI_COUNT, isFree),
      components: feniksComponents(likme, user, isFree, true),
      fetchReply: true,
    }),
    addLati(userId, guildId, latiWon - (isFree ? 0 : likmeLati)),
  ];

  if (!isFree) {
    promises.push(
      setStats(userId, guildId, {
        fenkaBiggestWin: `=${latiWon}`,
        fenkaBiggestBet: `=${likmeLati}`,
        fenkaSpent: likmeLati,
        fenkaWon: latiWon,
        fenkaSpinCount: 1,
      }),
    );
  }

  const [msg, userAfter] = (await Promise.all(promises)) as [Message, UserProfile];
  if (!userAfter) {
    return i
      .editReply({
        embeds: smallEmbed(errorEmbed.content!, commandColors.feniks).embeds,
        components: [],
      })
      .catch(_ => _);
  }

  // testSpins(1_000_000);

  buttonHandler(
    i,
    'feniks',
    msg,
    async int => {
      if (int.componentType !== ComponentType.Button) return;
      const { customId } = int;
      if (customId === 'feniks_spin_again') {
        return {
          end: true,
          after: () => feniksRun(int, likme, false),
        };
      }
      if (customId.startsWith('freespin_')) {
        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const itemName = customId.split('_')[1];
        const itemObj = itemList[itemName];

        const itemInInv = user.items.find(item => item.name === itemName);
        if (!itemInInv || itemInInv.amount < 1) {
          intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString(itemObj)}**`));
          return { end: true };
        }

        const freeSpinLikme = itemName.split('brivgriez')[1];
        if (!freeSpinLikme) return { error: true };

        return {
          end: true,
          after: () => feniksRun(int, +freeSpinLikme, true, itemName),
        };
      }
    },
    20000,
    true,
    true,
  );

  setTimeout(
    async () => {
      // guh
      const a = interactionCache.get(`${userId}-${guildId}`)!.get('feniks')!;
      interactionCache.get(`${userId}-${guildId}`)?.set('feniks', { ...a, isInteractionActive: false });
      i.editReply({
        embeds: feniksEmbed(i, likme, likmeLati, DEFAULT_EMOJI_COUNT, isFree, spinRes, latiWon),
        components: feniksComponents(likme, userAfter, isFree),
      }).catch(_ => _);
    },
    isFree ? 300 : 1500,
  );
}
