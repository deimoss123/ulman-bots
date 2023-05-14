import chance, { ChanceRecord, ChanceValue } from '../helpers/chance';
import { ItemKey } from '../itemList';
import { UsableItemFunc } from '../../interfaces/Item';
import findUser from '../../economy/findUser';
import intReply from '../../utils/intReply';
import errorEmbed from '../../embeds/errorEmbed';
import embedTemplate from '../../embeds/embedTemplate';
import itemString from '../../embeds/helpers/itemString';
import shuffleArray from '../helpers/shuffleArray';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentEmojiResolvable,
  ComponentType,
} from 'discord.js';
import buttonHandler from '../../embeds/buttonHandler';
import iconEmojis from '../../embeds/iconEmojis';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testLaimesti(laimesti: ChanceRecord) {
  let total = 0;
  const count = 100000;
  for (let i = 0; i < count; i++) {
    const test = chance(laimesti);
    total += test.obj.reward;
  }
  console.log(total / count);
}

// export default async function loto(userId: string, guildId: string, laimesti: ChanceRecord): Promise<UsableItemReturn> {
//   const res = chance(laimesti);

//   // testLaimesti(laimesti)

//   await addLati(userId, guildId, res.obj.reward);

//   let text = 'Tu neko nelaimēji :(';
//   if (res.key !== 'lose') {
//     text = `Tu laimēji ${res.obj.name} laimestu - **${res.obj.reward}** latus!`;
//   }

//   return { text, color: res.obj.color };
// }

// prettier-ignore
export type LotoReward = {
  lati: number;
  multiplier?: never;
  emoji: string;
  chance: ChanceValue;
} | {
  lati?: never;
  multiplier: number;
  emoji: string;
  chance: ChanceValue;
}

export interface LotoOptions {
  rows: number;
  columns: number;
  scratches: number;
  minRewards: number;
  maxRewards: number;
  rewards: Record<string, LotoReward>; // pirmais rewards ir garantēts
}

type LotoArray = {
  reward: LotoReward | null;
  scratched: boolean;
}[];

function generateLotoArr({ rows, columns, minRewards, maxRewards, rewards }: LotoOptions): LotoArray {
  const rewardsCount = Math.floor(Math.random() * (maxRewards - minRewards) + minRewards);

  const array = Array.from({ length: rows * columns }, (_, index) => {
    if (index === 0) return rewards[Object.keys(rewards)[0]];
    if (index <= rewardsCount) return chance(rewards).obj as LotoReward;
    return null;
  }).map(reward => ({ reward, scratched: false }));

  return shuffleArray(array);
}

function lotoEmbed(
  i: ButtonInteraction | ChatInputCommandInteraction,
  itemKey: ItemKey,
  lotoArray: LotoArray,
  scratchesLeft: number
) {
  return embedTemplate({
    i,
    title: `Izmantot: ${itemString(itemKey, null, true)}`,
    description: scratchesLeft === 1 ? `Atlicis **1** skrāpējums` : `Atlikuši **${scratchesLeft}** skrāpējumi`,
  }).embeds;
}

function lotoComponents(itemKey: ItemKey, lotoArray: LotoArray, { rows, columns }: LotoOptions, hasEnded = false) {
  const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

  for (let row = 0; row < rows; row++) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        Array.from({ length: columns }, (_, index) => {
          const lotoArrIndex = row * columns + index;
          const { reward, scratched } = lotoArray[lotoArrIndex];

          const emoji: ComponentEmojiResolvable =
            hasEnded || scratched
              ? reward
                ? reward.emoji //
                : iconEmojis.emptyEmoji
              : '❔';

          const btn = new ButtonBuilder()
            .setCustomId(`${itemKey}-${lotoArrIndex}`)
            .setStyle(scratched ? (reward ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
            .setEmoji(emoji)
            .setDisabled(hasEnded || scratched);

          // temp
          if ((hasEnded || scratched) && reward) {
            btn.setLabel(reward.lati ? `${reward.lati} lati` : `${reward.multiplier}x`);
          }

          return btn;
        })
      )
    );
  }

  return actionRows;
}

function calcTotal(lotoArray: LotoArray) {
  const filtered = lotoArray.filter(({ scratched, reward }) => scratched && reward) as {
    reward: LotoReward;
    scratched: boolean;
  }[];

  const sorted = filtered.sort((a, b) => {
    if (a.reward.lati && b.reward.multiplier) return -1;
    if (a.reward.lati && b.reward.lati) return a.reward.lati - b.reward.lati;
    if (a.reward.multiplier && b.reward.multiplier) return b.reward.multiplier - a.reward.multiplier;

    return 0;
  });

  const latiSum = sorted.reduce((p, c) => (c.reward.lati ? p + c.reward.lati : p), 0);
  const multiplierSum = sorted.reduce((p, c) => (c.reward.multiplier ? p + c.reward.multiplier : p), 0);

  return {
    sorted,
    total: multiplierSum ? multiplierSum * latiSum : latiSum,
  };
}

export default function loto(item: ItemKey, options: LotoOptions): UsableItemFunc {
  return () => ({
    custom: async i => {
      const userId = i.user.id;
      const guildId = i.guildId!;

      const user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const lotoArray = generateLotoArr(options);
      console.log(lotoArray);
      const buttonCount = options.rows * options.columns;
      let scratchesLeft = options.scratches;

      const msg = await intReply(i, {
        content: '\u200b',
        embeds: lotoEmbed(i, item, lotoArray, scratchesLeft),
        components: lotoComponents(item, lotoArray, options),
        fetchReply: true,
      });
      if (!msg) return;

      buttonHandler(
        i,
        `izmantot-${item}`,
        msg,
        async int => {
          const { customId } = int;

          if (scratchesLeft <= 0 || int.componentType !== ComponentType.Button) return;
          const [btnItemKey, btnIndexStr] = customId.split('-');
          const btnIndex = +btnIndexStr;

          if (btnItemKey !== item || isNaN(btnIndex) || btnIndex < 0 || btnIndex >= buttonCount) return;

          const clickedItem = lotoArray[btnIndex];
          if (!clickedItem || clickedItem.scratched) return;

          clickedItem.scratched = true;
          scratchesLeft--;
          const hasEnded = scratchesLeft <= 0;

          const { total, sorted } = calcTotal(lotoArray);
          console.log(sorted);
          console.log(total);

          return {
            edit: {
              embeds: lotoEmbed(int, item, lotoArray, scratchesLeft),
              components: lotoComponents(item, lotoArray, options, hasEnded),
            },
          };
        },
        60000
      );
    },
  });
}
