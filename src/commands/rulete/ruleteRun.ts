import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from "discord.js";
import addLati from "@/db/addLati";
import findUser from "@/db/findUser";
import setStats from "@/db/stats/setStats";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import itemList from "@/items/itemList";
import intReply from "@/utils/intReply";
import generateRulete, { GenerateRuleteRes } from "@/commands/rulete/generateRulete";
import { KazinoLikme } from "@/commands/rulete/rulete";
import { RulColors, RulPosition, rulPositions } from "@/commands/rulete/ruleteData";
import emoji from "@/utils/emoji";
import UserProfile from "@/types/UserProfile";
import mongoTransaction from "@/utils/mongoTransaction";
import { Dialogs } from "@/utils/dialogs";

const colorsLat: Record<RulColors, string> = {
  black: "melns",
  red: "sarkans",
  green: "zaļš",
};

const rulColor = {
  winBig: 0xc337fa,
  win: 0x4eed54,
  lose: 0x9d2235,
};

const RULETE_MIN_LIKME = 20;

type State = {
  user: UserProfile;
  position: RulPosition | number;
  likme: KazinoLikme;
  likmeLati: number;
  rulRes: GenerateRuleteRes;
  isSpinning: boolean;
};

const enum ComponentId {
  SpinAgain = "rulete_spin_again",
}

function view(state: State, i: BaseInteraction) {
  const { num, color, didWin, multiplier } = state.rulRes;

  const canSpinAgain =
    typeof state.likme === "number" ? state.user.lati >= state.likme : state.user.lati >= RULETE_MIN_LIKME;

  let emojisStr = "";
  for (let j = 0; j < 8; j++) {
    const key = state.isSpinning ? `rul_spin_${j}` : `rul_${num}_${j}`;
    emojisStr += emoji(key);
    if (j === 3) emojisStr += "\n";
  }

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ComponentId.SpinAgain)
        .setDisabled(state.isSpinning || !canSpinAgain)
        .setStyle(state.isSpinning ? ButtonStyle.Secondary : canSpinAgain ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setLabel(
          `Griezt vēlreiz | ` +
            `${typeof state.position === "number" ? state.position : rulPositions[state.position].shortName} | ` +
            `${typeof state.likme === "number" ? latiString(state.likme) : state.likme}`,
        ),
    ),
  ];

  return mainEmbed({
    i,
    content: "\u200B",
    color: state.isSpinning
      ? commandColors.rulete
      : didWin
        ? typeof state.position === "number" && state.position === num
          ? rulColor.winBig
          : rulColor.win
        : rulColor.lose,
    title: state.isSpinning
      ? "Griežas..."
      : didWin
        ? `Tu laimēji ${latiString(state.likmeLati * multiplier, true)} (${multiplier}x)`
        : "Tu neko nelaimēji (nākamreiz paveiksies)",
    fields: [
      {
        name: state.isSpinning ? "\u200B" : `${num} ${colorsLat[color]}`,
        value:
          `${emojisStr}\n\n` +
          `**Likme:** ${latiString(state.likmeLati)} ${typeof state.likme !== "number" ? `(${state.likme})` : ""} \n` +
          `**Pozīcija:** ${typeof state.position === "number" ? state.position : rulPositions[state.position as RulPosition].name}`,
        inline: false,
      },
    ],
    components,
  });
}

export default async function ruleteRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  position: RulPosition | number,
  likme: KazinoLikme,
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  const { lati, items } = user;

  if (lati < RULETE_MIN_LIKME) {
    return intReply(
      i,
      ephemeralReply(
        `Tev vajag vismaz ${latiString(RULETE_MIN_LIKME, true, true)} lai grieztu ruleti\n` +
          `Tev ir ${latiString(lati, false, true)}`,
      ),
    );
  }

  if (typeof likme === "number" && lati < likme) {
    return intReply(
      i,
      ephemeralReply(
        `Tu nepietiek naudas lai griezt ruleti ar likmi ${latiString(likme, false, true)}\n` +
          `Tev ir ${latiString(lati, false, true)}`,
      ),
    );
  }

  if (likme === "virve") {
    const hasVirve = items.find((item) => item.name === "virve");
    if (!hasVirve) {
      return intReply(
        i,
        ephemeralReply(
          `Lai grieztu ruleti ar likmi \`virve\`, tev inventārā ir jābūt **${itemString(
            itemList.virve,
          )}** (nopērkama veikalā)`,
        ),
      );
    }
  }

  const likmeLati =
    typeof likme === "number"
      ? likme
      : likme === "virve"
        ? Math.floor(Math.random() * (lati - RULETE_MIN_LIKME) + RULETE_MIN_LIKME)
        : lati;

  const rulRes = generateRulete(position);
  const latiToAdd = (rulRes.multiplier - 1) * likmeLati;

  // prettier-ignore
  const { ok, values } = await mongoTransaction(session => [
    () => addLati(userId, guildId, latiToAdd, session),
    () => setStats(userId, guildId, {
      rulBiggestBet: `=${likmeLati}`,
      rulBiggestWin: `=${rulRes.multiplier * likmeLati}`,
      rulSpent: likmeLati,
      rulWon: rulRes.multiplier * likmeLati,
      rulSpinCount: 1,
    }, session),
  ]);

  if (!ok) {
    return intReply(i, errorEmbed);
  }

  const initialState: State = {
    user: values[0],
    position,
    likme,
    likmeLati,
    rulRes,
    isSpinning: true,
  };

  const dialogs = new Dialogs(i, initialState, view, "rulete", { time: 20000, isActive: true });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  setTimeout(async () => {
    dialogs.state.isSpinning = false;
    await dialogs.edit();
    dialogs.setActive(false);
  }, 1500);

  dialogs.onClick(async (int) => {
    if (int.customId === ComponentId.SpinAgain && int.componentType === ComponentType.Button) {
      return {
        end: true,
        after: () => {
          ruleteRun(int, position, likme);
        },
      };
    }
  });
}
