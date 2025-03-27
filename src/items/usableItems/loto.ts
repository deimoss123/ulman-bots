import chance, { ChanceValue } from "@/items/helpers/chance";
import itemList, { ItemKey } from "@/items/itemList";
import { UsableItemFunc } from "@/types/Item";
import findUser from "@/db/findUser";
import intReply from "@/utils/intReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import embedTemplate from "@/utils/embeds/embedTemplate";
import itemString from "@/utils/strings/itemString";
import shuffleArray from "@/items/helpers/shuffleArray";
import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ComponentEmojiResolvable,
  ComponentType,
} from "discord.js";
import addLati from "@/db/addLati";
import addItems from "@/db/addItems";
import smallEmbed from "@/utils/embeds/smallEmbed";
import commandColors from "@/utils/commandColors";
import emoji from "@/utils/emoji";
import { Dialogs } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testLaimesti(options: LotoOptions, count: number) {
  console.log(`Started testing ${count} spins`);
  let totalLati = 0;

  for (let i = 0; i < count; i++) {
    if (i % 100_000 === 0) console.log(`i = ${i}`);
    const lotoArr = generateLotoArr(options);
    // scrach first x items
    lotoArr.forEach((item, index) => {
      if (index < options.scratches) item.scratched = true;
    });

    const calcRes = calcTotal(lotoArr);
    totalLati += calcRes.total;
  }

  console.log(`Finished testing ${count} spins`);
  const avg = (totalLati / count).toFixed(3);
  console.log(`Avg reward: ${avg} lati`);
}

// prettier-ignore
export type LotoReward = {
  lati: number;
  multiplier?: never;
  emoji: () => string;
  chance: ChanceValue;
} | {
  lati?: never;
  multiplier: number;
  emoji: () => string;
  chance: ChanceValue;
}

export interface LotoOptions {
  rows: number;
  columns: number;
  scratches: number;
  minRewards: number;
  maxRewards: number;
  rewards: Record<string, LotoReward>; // pirmais rewards ir garantēts
  colors: { lati: number; color: number }[];
}

type LotoArray = {
  reward: LotoReward | null;
  scratched: boolean;
}[];

function generateLotoArr(
  { rows, columns, minRewards, maxRewards, rewards }: LotoOptions,
  printBoard = false,
): LotoArray {
  const rewardsCount = Math.floor(Math.random() * (maxRewards - minRewards) + minRewards);

  const array = Array.from({ length: rows * columns }, (_, index) => {
    if (index === 0) return rewards[Object.keys(rewards)[0]];
    if (index < rewardsCount) return chance(rewards).obj as LotoReward;
    return null;
  }).map((reward) => ({ reward, scratched: false }));

  const shuffled = shuffleArray(array);

  if (printBoard) {
    console.log("-".repeat(columns * 10));
    for (let row = 0; row < rows; row++) {
      console.log(
        shuffled
          .slice(row * columns, (row + 1) * columns)
          .map((i) =>
            (i.reward?.lati ? `${i.reward?.lati}Ls` : i.reward?.multiplier ? `${i.reward?.multiplier}x` : "").padEnd(7),
          )
          .join(" | "),
      );
      console.log("-".repeat(columns * 10));
    }
  }

  return shuffled;
}

function scratchesLeftText(scratchesLeft: number, format = false) {
  const boldStr = format ? "**" : "";

  return scratchesLeft === 1
    ? `Atlicis ${boldStr}1${boldStr} skrāpējums`
    : `Atlikuši ${boldStr}${scratchesLeft}${boldStr} skrāpējumi`;
}

function calcTotal(lotoArray: LotoArray) {
  const filtered = lotoArray.filter(({ scratched, reward }) => scratched && reward) as {
    reward: LotoReward;
    scratched: boolean;
  }[];

  const sorted = filtered.sort((a, b) => {
    if (a.reward.lati && b.reward.multiplier) return -1;
    if (a.reward.lati && b.reward.lati) return b.reward.lati - a.reward.lati;
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

const TEST_SPINS = false;

type State = {
  itemKey: ItemKey;
  totalWin: number;
  lotoArray: LotoArray;
  lotoArrayWon: LotoArray;
  lotoOptions: LotoOptions;
  scratchesLeft: number;
  isActive: boolean;
  lotoInInv: number;
};

function view(state: State, i: BaseInteraction) {
  const { itemKey, totalWin, lotoArray, lotoArrayWon, scratchesLeft, lotoOptions, isActive, lotoInInv } = state;

  const latiArr = lotoArrayWon.filter((item) => item.reward?.lati);
  const multiplierArr = lotoArrayWon.filter((item) => item.reward?.multiplier);
  const color = scratchesLeft ? commandColors.feniks : lotoOptions.colors.find(({ lati }) => totalWin >= lati)!.color;

  const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

  for (let row = 0; row < lotoOptions.rows; row++) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        Array.from({ length: lotoOptions.columns }, (_, index) => {
          const lotoArrIndex = row * lotoOptions.columns + index;
          const { reward, scratched } = lotoArray[lotoArrIndex];

          const btnEmoji: ComponentEmojiResolvable =
            !isActive || scratched
              ? reward
                ? reward.emoji() //
                : emoji("blank")
              : emoji("loto_question_mark");

          const btn = new ButtonBuilder()
            .setCustomId(`${itemKey}-${lotoArrIndex}`)
            .setStyle(scratched ? (reward ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
            .setEmoji(btnEmoji)
            .setDisabled(!isActive);

          // temp
          if ((!isActive || scratched) && reward) {
            // btn.setLabel(reward.lati ? `${reward.lati} lati` : `${reward.multiplier}x`);
          }

          return btn;
        }),
      ),
    );
  }

  if (isActive || (!isActive && !lotoInInv)) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("_")
          .setStyle(ButtonStyle.Secondary)
          .setLabel(scratchesLeftText(scratchesLeft))
          .setDisabled(true),
      ),
    );
  } else if (lotoInInv) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("loto_izmantot_velreiz")
          .setStyle(ButtonStyle.Primary)
          .setLabel(`Izmantot vēlreiz (${lotoInInv})`)
          .setEmoji(itemList[itemKey].emoji() || "❓"),
      ),
    );
  }

  return embedTemplate({
    i,
    content: "\u200b",
    title: `Izmantot: ${itemString(itemKey, null, true)}`,
    description: scratchesLeftText(scratchesLeft, true),
    color,
    fields: [
      {
        name: "Atrastie lati:",
        value: latiArr.length ? latiArr.map((item) => item.reward?.emoji()).join(" + ") : "-",
        inline: false,
      },
      {
        name: "Atrastie reizinātāji:",
        value:
          `${multiplierArr.length ? multiplierArr.map((item) => item.reward?.emoji()).join(" + ") : "-"}\n\n` +
          (scratchesLeft
            ? `_Spied uz_ ${emoji("loto_question_mark")} _lai atklātu balvas_`
            : `**KOPĒJAIS LAIMESTS: __${totalWin}__ lati**`),
        inline: false,
      },
    ],
    components: actionRows,
  });
}

export default function loto(itemKey: ItemKey, options: LotoOptions): UsableItemFunc {
  return () => ({
    custom: async (i) => {
      if (TEST_SPINS) {
        await intReply(i, smallEmbed("Testing spins...", 0xffffff));
        testLaimesti(options, 1_000_000);
        return;
      }

      const userId = i.user.id;
      const guildId = i.guildId!;

      let user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const initialState: State = {
        itemKey,
        totalWin: 0,
        lotoArray: generateLotoArr(options),
        lotoArrayWon: [],
        lotoOptions: options,
        scratchesLeft: options.scratches,
        isActive: true,
        lotoInInv: 0,
      };

      const buttonCount = options.rows * options.columns;

      const dialogs = new Dialogs<State>(i, initialState, view, `izmantot_loto_${Date.now()}`, { time: 300000 });

      if (!(await dialogs.start())) {
        return intReply(i, errorEmbed);
      }

      dialogs.onClick(async (int, state) => {
        const { customId } = int;
        if (int.componentType !== ComponentType.Button) return;

        if (customId === "loto_izmantot_velreiz" && !state.scratchesLeft) {
          return {
            end: true,
            after: async () => {
              // ahhh nepatīk šitais imports, lūdzu, neesi atmiņas noplūde
              const izmantotRun = await import("@/commands/izmantot/izmantotRun");
              izmantotRun.default(int, itemKey, 0);
            },
          };
        }

        if (state.scratchesLeft <= 0) return;

        const [btnItemKey, btnIndexStr] = customId.split("-");
        const btnIndex = +btnIndexStr;

        if (btnItemKey !== itemKey || isNaN(btnIndex) || btnIndex < 0 || btnIndex >= buttonCount) return;

        const clickedItem = state.lotoArray[btnIndex];
        if (!clickedItem || clickedItem.scratched) return;

        if (options.scratches === state.scratchesLeft) {
          const user = await findUser(userId, guildId);
          if (!user) return { error: true };

          const item = user.items.find((item) => item.name === itemKey);
          const hasItem = item && item.amount > 0;

          if (!hasItem) {
            intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString(itemKey)}**. Tu mēģini krāpties?`));
            return { end: true };
          }

          const res = await addItems(userId, guildId, { [itemKey]: -1 });
          if (!res) return { error: true };
        }

        clickedItem.scratched = true;
        state.scratchesLeft--;

        state.isActive = state.scratchesLeft > 0;

        const { total, sorted } = calcTotal(state.lotoArray);

        state.lotoArrayWon = sorted;
        state.totalWin = total;

        if (!state.isActive) {
          user = total > 0 ? await addLati(userId, guildId, total) : await findUser(userId, guildId);
          if (!user) return { error: true };

          state.lotoInInv = user.items.find((item) => item.name === itemKey)?.amount || 0;
        }

        return {
          update: true,
          setInactive: !state.isActive,
        };
      });
    },
  });
}
