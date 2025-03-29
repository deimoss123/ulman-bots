import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import setLati from "@/db/setLati";
import { item, ItemCategory, ShopItem, UsableItem, UsableItemFunc } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle } from "discord.js";

type State = {
  firstConfirm: boolean;
  secondConfirm: boolean;
  cancelled: boolean;
};

const enum ComponentId {
  Ja = "izmantot_virve_ja",
  Ne = "izmantot_virve_ne",
}

function embed(i: BaseInteraction, description: string, hasComponents = false) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ComponentId.Ja).setLabel("Jā").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(ComponentId.Ne).setLabel("Nē").setStyle(ButtonStyle.Secondary),
  );

  return mainEmbed({
    i,
    content: "\u200B",
    title: izmantotTitle("virve"),
    color: commandColors.izmantot,
    description,
    components: hasComponents ? [row] : [],
  });
}

const view: DialogsViewFunc<State> = (state, i) => {
  if (state.cancelled) {
    return embed(i, "Tu izvēlējies dzīvot");
  }

  if (state.firstConfirm && !state.secondConfirm) {
    return embed(i, "Vai tu _**TIEŠĀM**_ gribi pakārties?", true);
  }

  if (state.secondConfirm) {
    return embed(i, "Tu pakāries un pazaudēji **VISU** savu naudu.\n_Vai tas tiešām bija tā vērts?_");
  }

  return embed(i, "Vai tu vēlies pakārties? (ļoti bīstami)", true);
};

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  if (user.lati < 0) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      "Tu nevari pakārties, jo tev ir negatīvs latu daudzums. Izcils veikums!"
    ));
  }

  const initialState: State = {
    firstConfirm: false,
    secondConfirm: false,
    cancelled: false,
  };

  const dialogs = new Dialogs<State>(i, initialState, view, "izmantot", { time: 30000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    if (!int.isButton()) return;

    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    if (!user.items.find((item) => item.name === "virve")) {
      // prettier-ignore
      intReply(int, ephemeralReply(
          `Tava latviskā daba neļāva tev pakārties\n(tavā inventārā vairs nav **${itemString("virve")}**)`
        ));
      return { end: true };
    }

    if (int.customId === ComponentId.Ne) {
      state.cancelled = true;
      return { update: true, end: true };
    }

    if (int.customId === ComponentId.Ja) {
      if (!state.firstConfirm) {
        state.firstConfirm = true;
        return { update: true };
      }

      if (!state.secondConfirm) {
        state.secondConfirm = true;

        const { ok } = await mongoTransaction((session) => [
          () => setLati(userId, guildId, 0, session),
          () => addItems(userId, guildId, { virve: -1 }, session),
        ]);

        if (!ok) return { error: true };

        return { update: true, end: true };
      }
    }
  });
};

const virve = item<UsableItem & ShopItem>({
  info: "Nopērc virvi, ja vienkārši vairs nevari izturēt...\nVirvi izmantot nav ieteicams.",
  addedInVersion: "4.0",
  nameNomVsk: "virve",
  nameNomDsk: "virves",
  nameAkuVsk: "virvi",
  nameAkuDsk: "virves",
  isVirsiesuDzimte: false,
  emoji: () => emoji("virve"),
  imgLink: "https://www.ulmanbots.lv/images/items/virve.png",
  categories: [ItemCategory.VEIKALS],
  value: 10,
  allowDiscount: true,
  use,
});

export default virve;
