import { ButtonBuilder, ButtonStyle, SeparatorBuilder, TextDisplayBuilder } from "discord.js";
import UserProfile from "@/types/UserProfile";
import { KazinoLikme } from "@/commands/rulete/rulete";
import { CalcSpinRes } from "@/commands/feniks/calcSpin";
import emoji from "@/utils/emoji";
import latiString from "@/utils/strings/latiString";
import feniksLaimesti from "@/commands/feniks/feniksLaimesti";
import itemList, { ItemKey } from "@/utils/itemList";
import { DialogsViewFunc } from "@/utils/dialogs";
import { CommandDisplayBox } from "@/utils/embeds/commandDisplayBox";

export type FeniksState = {
  likme: KazinoLikme;
  likmeLati: number;
  spinCount: number;
  isFree: boolean;
  spinRes: CalcSpinRes;
  wonLati: number;

  canSpinAgain: boolean;
  freeSpinsInInv: [ItemKey, number][];

  user: UserProfile;
  isSpinning: boolean;
};

export const enum ComponentId {
  SpinAgain = "feniks_spin_again",

  FreeSpin10 = "feniks_freespin_10",
  FreeSpin25 = "feniks_freespin_25",
  FreeSpin50 = "feniks_freespin_50",
  FreeSpin100 = "feniks_freespin_100",
}

export const FreeSpinIds: Record<string, ComponentId> = {
  brivgriez10: ComponentId.FreeSpin10,
  brivgriez25: ComponentId.FreeSpin25,
  brivgriez50: ComponentId.FreeSpin50,
  brivgriez100: ComponentId.FreeSpin100,
};

const feniksView: DialogsViewFunc<FeniksState> = (state, i) => {
  const emptyEmoji = emoji("blank");
  const arrow_1_left = emoji("icon_arrow_1_left");
  const arrow_1_right = emoji("icon_arrow_1_right");
  const arrow_2_left = emoji("icon_arrow_2_left");
  const arrow_2_right = emoji("icon_arrow_2_right");

  let title = "Griežas...";
  let emojiRow = Array(state.spinCount).fill(emoji("f_spin")).join("");
  let multiplierRow = Array(state.spinCount).fill(emptyEmoji).join("");

  if (!state.isSpinning) {
    const { emojiGroups, totalMultiplier } = state.spinRes!;

    if (!totalMultiplier) title = "Tu neko nelaimēji";
    else title = `Tu laimēji ${latiString(state.wonLati, true)} (${totalMultiplier}x)`;

    const emojiArr: string[] = [];
    const multiplierArr: string[] = [];

    for (const { name, count, isWinner } of emojiGroups) {
      emojiArr.push(...Array(count).fill(feniksLaimesti[name].emoji()));

      if (!isWinner) {
        multiplierArr.push(...Array(count).fill(emptyEmoji));
      } else {
        multiplierArr.push(
          ...Array(count)
            .fill("")
            .map((_, i) => {
              const emojiName = `${name}_${count}_${i + 1}`;
              return emoji(emojiName);
            }),
        );
      }
    }

    emojiRow = emojiArr.join("");
    multiplierRow = multiplierArr.join("");
  }

  let color;

  let displayLati = state.user.lati - state.wonLati;

  if (!state.isSpinning) {
    const colors = [
      [15, 0xf066ff],
      [8, 0x9966ff],
      [5, 0x66ffc2],
      [2, 0x96ff66],
      [1.1, 0xe0ff66],
      [0.9, 0xffff66],
      [0.7, 0xffd166],
      [0.3, 0xff8f66],
      [0.05, 0xff7a66],
      [0, 0xff4230],
    ];

    color = colors.find(([m]) => state.spinRes.totalMultiplier >= m)?.[1] || colors.at(-1)![1];

    displayLati = state.user.lati;
  }

  const box = new CommandDisplayBox(i, { title, commandName: "feniks", color });

  const text = new TextDisplayBuilder().setContent(
    (state.isSpinning ? arrow_1_right : arrow_2_right) +
      `${emptyEmoji}${emojiRow}${emptyEmoji}` +
      (state.isSpinning ? arrow_1_left : arrow_2_left) +
      `\n${emptyEmoji.repeat(2)}${multiplierRow}${emptyEmoji.repeat(2)}\n` +
      `-# _ _ \n` +
      `**Likme:** ${latiString(state.likmeLati)} ` +
      (state.isFree ? "**(brīvgrieziens)**" : typeof state.likme !== "number" ? `(${state.likme})` : "") +
      `\n**Maks:** ${latiString(displayLati)}`,
  );

  box.container.addTextDisplayComponents(text);

  if (!state.isFree) {
    const btn = new ButtonBuilder()
      .setCustomId(ComponentId.SpinAgain)
      .setDisabled(state.isSpinning || !state.canSpinAgain)
      .setStyle(
        state.isSpinning ? ButtonStyle.Secondary : state.canSpinAgain ? ButtonStyle.Primary : ButtonStyle.Danger,
      )
      .setLabel(`Griezt vēlreiz | ${typeof state.likme === "number" ? latiString(state.likme) : state.likme}`);

    box.container.addActionRowComponents((row) => row.addComponents(btn));
  }

  if (state.freeSpinsInInv.length) {
    box.container.addSeparatorComponents(new SeparatorBuilder());
    box.container.addTextDisplayComponents(new TextDisplayBuilder().setContent("Izmantot brīvgriezienu:"));

    const buttons: ButtonBuilder[] = state.freeSpinsInInv.map(([name, amount]) =>
      new ButtonBuilder()
        .setCustomId(FreeSpinIds[name])
        .setStyle(state.isSpinning ? ButtonStyle.Secondary : ButtonStyle.Secondary)
        .setLabel(`(${amount})`)
        .setEmoji(itemList[name].emoji() || "❓")
        .setDisabled(state.isSpinning),
    );

    box.container.addActionRowComponents((row) => row.addComponents(buttons));
  }

  return box.viewReturn();
};

export default feniksView;
