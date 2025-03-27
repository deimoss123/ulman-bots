import { ButtonInteraction, ChatInputCommandInteraction, ComponentType } from "discord.js";
import addItems from "@/db/addItems";
import addLati from "@/db/addLati";
import findUser from "@/db/findUser";
import setStats from "@/db/stats/setStats";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import smallEmbed from "@/utils/embeds/smallEmbed";
import UserProfile from "@/types/UserProfile";
import itemList, { ItemKey } from "@/utils/itemList";
import intReply from "@/utils/intReply";
import { KazinoLikme } from "@/commands/rulete/rulete";
import calcSpin from "@/commands/feniks/calcSpin";
import { FENIKS_MIN_LIKME } from "@/commands/feniks/feniks";
import { Dialogs } from "@/utils/dialogs";
import feniksView, { ComponentId, FeniksState, FreeSpinIds } from "@/commands/feniks/feniksView";
import { ItemCategory } from "@/types/Item";

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

    if (typeof likme === "number" && lati < likme) {
      return intReply(
        i,
        ephemeralReply(
          `Tu nepietiek naudas lai griezt aparātu ar likmi ${latiString(likme, false, true)}\n` +
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
            `Lai grieztu aparātu ar likmi \`virve\`, tev inventārā ir jābūt **${itemString(
              itemList.virve,
            )}** (nopērkama veikalā)`,
          ),
        );
      }
    }
  }

  const likmeLati =
    typeof likme === "number"
      ? likme
      : likme === "virve"
        ? Math.floor(Math.random() * (lati - FENIKS_MIN_LIKME) + FENIKS_MIN_LIKME)
        : lati;

  const spinRes = calcSpin(DEFAULT_EMOJI_COUNT);
  let latiWon = Math.floor(likmeLati * spinRes.totalMultiplier);

  if (spinRes.totalMultiplier && latiWon === 0) {
    latiWon = 1;
  }

  if (isFree) {
    user = await addItems(userId, guildId, { [freeSpinName!]: -1 });
    if (!user) return intReply(i, errorEmbed);
  }

  const promises: Promise<any>[] = [addLati(userId, guildId, latiWon - (isFree ? 0 : likmeLati))];

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

  const [userAfter] = (await Promise.all(promises)) as [UserProfile];

  if (!userAfter) {
    return i
      .editReply({
        embeds: smallEmbed(errorEmbed.content!, commandColors.feniks).embeds,
        components: [],
      })
      .catch((_) => _);
  }

  // testSpins(1_000_000);

  const canSpinAgain = typeof likme === "number" ? lati >= likme : lati >= FENIKS_MIN_LIKME;

  const freeSpinsInInv: [ItemKey, number][] = userAfter.items
    .filter(({ name }) => itemList[name].categories.includes(ItemCategory.BRIVGRIEZIENS))
    .sort((a, b) => itemList[b.name].value - itemList[a.name].value)
    .map(({ name, amount }) => [name, amount]);

  const initialState: FeniksState = {
    likme,
    likmeLati,
    spinCount: DEFAULT_EMOJI_COUNT,
    isFree,
    spinRes,
    wonLati: latiWon,

    canSpinAgain,
    freeSpinsInInv,

    user: userAfter,
    isSpinning: true,
  };

  const dialogs = new Dialogs(i, initialState, feniksView, "feniks", { time: 20000, isActive: true });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  setTimeout(
    async () => {
      dialogs.state.isSpinning = false;
      await dialogs.edit();
      dialogs.setActive(false);
    },
    isFree ? 300 : 1500,
  );

  dialogs.onClick(async (int) => {
    const { customId, componentType } = int;

    if (componentType !== ComponentType.Button) return;

    if (customId === ComponentId.SpinAgain) {
      return {
        end: true,
        after: () => feniksRun(int, likme, false),
      };
    }

    const freeSpinName = Object.entries(FreeSpinIds).find(([_, id]) => id === customId)?.[0];

    if (freeSpinName) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const itemObj = itemList[freeSpinName];

      const itemInInv = user.items.find((item) => item.name === freeSpinName);
      if (!itemInInv || itemInInv.amount < 1) {
        await intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString(itemObj)}**`));
        return;
      }

      const freeSpinLikme = freeSpinName.split("brivgriez")[1];
      if (!freeSpinLikme) return { error: true };

      return {
        end: true,
        after: () => feniksRun(int, +freeSpinLikme, true, freeSpinName),
      };
    }
  });
}
