import addItems from "@/db/addItems";
import editItemAttribute from "@/db/editItemAttribute";
import editMultipleItemAttributes from "@/db/editMultipleItemAttributes";
import findUser from "@/db/findUser";
import countFreeInvSlots from "@/utils/countFreeInvSlots";
import { UseManyType, item, AttributeItem, TirgusItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import UserProfile, { ItemAttributes } from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import { Dialogs } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import smallEmbed from "@/utils/embeds/smallEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import mongoTransaction from "@/utils/mongoTransaction";
import itemString from "@/utils/strings/itemString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { useDifferentItemSelectMenu, useDifferentItemHandler } from "@/utils/useDifferentItem";
import { BaseInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import wrapString from "@/utils/strings/wrapString";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";

function getRandFreeSpin() {
  const spins: ItemKey[] = ["brivgriez10", "brivgriez25", "brivgriez50"];
  return spins[Math.floor(Math.random() * spins.length)];
}

export const PETNIEKS_COOLDOWN = 43_200_000;

const useMany: UseManyType = {
  filter: ({ lastUsed }) => lastUsed! + PETNIEKS_COOLDOWN < Date.now(),
  async runFunc(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const usableItems = user.specialItems.filter(
      ({ name, attributes }) => name === "petnieks" && this.filter(attributes),
    );

    if (!usableItems.length) {
      return intReply(i, ephemeralReply(`Tev nav neviens izmantojams **${itemString("petnieks")}**`));
    }

    const itemsToAdd: Record<ItemKey, number> = {};
    for (const {
      attributes: { foundItemKey },
    } of usableItems) {
      itemsToAdd[foundItemKey!] = itemsToAdd[foundItemKey!] ? itemsToAdd[foundItemKey!] + 1 : 1;
    }

    const freeSlots = countFreeInvSlots(user);
    if (freeSlots < usableItems.length) {
      return intReply(
        i,
        ephemeralReply(
          `Lai saņemtu brīvgriezienus tev vajag vismaz **${usableItems.length}** brīvas vietas inventārā\n` +
            `Tev ir **${freeSlots}** brīvas vietas`,
        ),
      );
    }

    const { ok } = await mongoTransaction((session) => [
      () =>
        editMultipleItemAttributes(
          userId,
          guildId,
          usableItems.map(({ _id, attributes }) => ({
            itemId: _id!,
            newAttributes: { ...attributes, foundItemKey: getRandFreeSpin(), lastUsed: Date.now() },
          })),
          session,
        ),
      () => addItems(userId, guildId, itemsToAdd, session),
    ]);

    if (!ok) {
      return intReply(i, errorEmbed);
    }

    intReply(
      i,
      mainEmbed({
        i,
        color: commandColors.izmantot,
        title: `Izmantot ${itemString("petnieks", usableItems.length, true)}`,
        fields: [
          {
            name: "Atrastie brīvgriezieni:",
            value: Object.entries(itemsToAdd)
              .sort((a, b) => itemList[b[0]].value - itemList[a[0]].value)
              .map(([name, amount]) => `> ${itemString(name, amount)}`)
              .join("\n"),
            inline: false,
          },
        ],
      }),
    );
  },
};

type State = {
  user: UserProfile;
  text: string;
  itemId: string;
  attributes: ItemAttributes;
};

const enum ComponentId {
  AddHat = "petnieks_add_hat",
  RemoveHat = "petnieks_remove_hat",
}

function view(state: State, i: BaseInteraction) {
  const { hat } = state.attributes;

  const components = [];
  const hatInInv = state.user.items.find(({ name }) => name === "salaveca_cepure");

  if (hatInInv || hat) {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(hat ? ComponentId.RemoveHat : ComponentId.AddHat)
          .setEmoji(itemList.salaveca_cepure.emoji() || "❓")
          .setLabel(hat ? "Novilkt cepuri" : "Uzvilkt cepuri")
          .setStyle(ButtonStyle.Primary),
      ),
    );
  }

  if (state.user.specialItems.filter(({ name }) => name === "petnieks").length > 1) {
    components.push(useDifferentItemSelectMenu(state.user, "petnieks", state.itemId));
  }

  return mainEmbed({
    i,
    content: hatInInv || hat ? "\u200b" : undefined,
    title: `Izmantot: ${itemString("petnieks", null, true, state.attributes)}`,
    description: state.text,
    color: commandColors.izmantot,
    components,
  });
}

const use: UsableAttributeItemFunc = async (i, user, _, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const color = commandColors.izmantot;

  let text = "";

  const lastUsed = specialItem!.attributes.lastUsed!;
  const itemKey = specialItem!.attributes.foundItemKey!;

  if (Date.now() - lastUsed < PETNIEKS_COOLDOWN) {
    text =
      `Pētnieks tev nevar uzdāvināt brīvgriezienu, jo viņš to vēl nav atradis\n` +
      `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - Date.now() + lastUsed)}\``;
  } else if (!countFreeInvSlots(user)) {
    text = `Pētnieks ir atradis ${itemString(itemList[itemKey], 1, true)}, bet tu to nevari saņemt, jo tev ir pilns inventārs`;
  } else {
    const { ok } = await mongoTransaction((session) => [
      () =>
        editItemAttribute(
          userId,
          guildId,
          specialItem!._id!,
          { ...specialItem!.attributes, lastUsed: Date.now(), foundItemKey: getRandFreeSpin() },
          session,
        ),
      () => addItems(userId, guildId, { [itemKey]: 1 }, session),
    ]);

    if (!ok) {
      return intReply(i, errorEmbed);
    }

    text =
      `Pētnieks tev uzdāvināja ${itemString(itemList[itemKey], 1, true)}\n` +
      `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - 1)}\``;
  }

  const initialState: State = {
    user,
    text,
    itemId: specialItem!._id!,
    attributes: specialItem!.attributes,
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot", { time: 30000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const { customId, componentType } = int;

    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    if (customId === "use_different" && componentType === ComponentType.StringSelect) {
      return useDifferentItemHandler(user, "petnieks", int);
    }

    const petnieksInInv = user.specialItems.find(({ _id }) => _id === specialItem!._id);
    if (!petnieksInInv) {
      return {
        end: true,
        after: () => intReply(int, ephemeralReply("Kļūda, šis pētnieks vairs nav tavā inventārā")),
      };
    }

    state.user = user;
    state.attributes = petnieksInInv.attributes;

    if (customId === ComponentId.AddHat && componentType === ComponentType.Button) {
      if (!user.items.find(({ name }) => name === "salaveca_cepure")) {
        intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString("salaveca_cepure")}**`));
        return { edit: true };
      }

      const { ok, values } = await mongoTransaction((session) => [
        () => addItems(userId, guildId, { salaveca_cepure: -1 }, session),
        () =>
          editItemAttribute(
            userId,
            guildId,
            petnieksInInv._id!,
            { ...petnieksInInv.attributes, hat: "salaveca_cepure" },
            session,
          ),
      ]);

      if (!ok) return { error: true };

      const { user: userAfter, newItem } = values[1];

      state.user = userAfter;
      state.attributes = newItem.attributes;

      intReply(int, smallEmbed(`Tu pētniekam uzvilki **${itemString("salaveca_cepure", null, true)}**`, color));
      return { edit: true };
    }

    if (customId === ComponentId.RemoveHat && componentType === ComponentType.Button) {
      if (petnieksInInv.attributes.hat !== "salaveca_cepure") {
        intReply(int, ephemeralReply("Kļūda, šim pētniekam nav uzvilkta cepure"));
        return { edit: true };
      }

      if (!countFreeInvSlots(user)) {
        intReply(int, ephemeralReply("Tu nevari pētniekam novilkt cepuri, jo tev ir pilns inventārs"));
        return { edit: true };
      }

      // prettier-ignore
      const { ok, values } = await mongoTransaction(session => [
            () => addItems(userId, guildId, { salaveca_cepure: 1 }, session),
            () => editItemAttribute(userId, guildId, petnieksInInv._id!, { ...petnieksInInv.attributes, hat: '' }, session),
          ]);

      if (!ok) return { error: true };

      const { user: userAfter, newItem } = values[1];

      state.user = userAfter;
      state.attributes = newItem.attributes;

      // prettier-ignore
      intReply(int, smallEmbed(
        `Tu pētniekam novilki **${itemString('salaveca_cepure', null, true)}**, ` +
        `un tā tika pievienota tavam inventāram`,
        color,
      ));
      return { edit: true };
    }
  });
};

const petnieks = item<
  // prettier-ignore
  AttributeItem<{
    lastUsed: number;
    foundItemKey: string;
    hat: string;
  }> & TirgusItem
>({
  info:
    `Pētnieks vēlās kļūt par tavu labāko draugu!\n` +
    `Viņš ir tik draudzīgs, ka pētīs krievu mājaslapas lai **tev** atrastu brīvgriezienus\n\n` +
    'Pētnieks atrod vienu brīvgriezienu ik `12h`, kuru tu vari saņemt pētnieku "izmantojot"',
  addedInVersion: "4.0",
  nameNomVsk: "pētnieks",
  nameNomDsk: "pētnieki",
  nameAkuVsk: "pētnieku",
  nameAkuDsk: "pētniekus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("petnieks"),
  // eslint-disable-next-line func-names
  dynamicEmoji: function ({ hat }) {
    if (hat === "salaveca_cepure") {
      return emoji("petnieks_zsv");
    }

    return this.emoji();
  },
  imgLink: "https://www.ulmanbots.lv/images/items/petnieks.png",
  categories: [ItemCategory.TIRGUS],
  value: 300,
  tirgusPrice: { items: { brivgriez25: 6, brivgriez50: 4, brivgriez100: 2 }, lati: 750 },
  defaultAttributes: () => ({
    lastUsed: 0,
    foundItemKey: getRandFreeSpin(),
    hat: "",
  }),
  displayAttributes: ({ foundItemKey, hat, lastUsed }, inline, currTime) => {
    let str = "";

    if (currTime - lastUsed >= PETNIEKS_COOLDOWN) {
      str += wrapString("Nopētījis: ", "**", !inline);

      if (inline) str += itemList[foundItemKey].nameAkuVsk;
      else str += itemList[foundItemKey].emoji();
    } else {
      const timeStr = millisToReadableTime(PETNIEKS_COOLDOWN - currTime + lastUsed);
      str += `Pēta: ${wrapString(timeStr, "`", !inline)}`;
    }

    if (hat) {
      str += `${inline ? ", " : "\n"}Cepure: `;

      if (inline) str += capitalizeFirst(itemList[hat].nameNomVsk);
      else str += itemList[hat].emoji();
    }

    return str;
  },
  sortBy: { lastUsed: -1 },
  use,
  useMany,
});

export default petnieks;
