import addItems from "@/db/addItems";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import { BerryProperties, berryProperties, propertiesLat } from "@/items/shared/oga";
import { calcIevarijumsPrice } from "@/items/ievarijums";
import Item, { item, AttributeItem, TirgusItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import UserProfile from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import smallEmbed from "@/utils/embeds/smallEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import itemList, { ItemKey } from "@/utils/itemList";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import itemString from "@/utils/strings/itemString";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import mongoTransaction from "@/utils/mongoTransaction";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import wrapString from "@/utils/strings/wrapString";

export type GazesPlitsActionType = "" | "cook" | "boil_ievarijums" | "boil_special_ievarijums";

interface CookableItem {
  input: ItemKey;
  output: ItemKey;
  time: number; // millis
}

export const cookableItems: CookableItem[] = [
  {
    input: "lidaka",
    output: "cepta_lidaka",
    time: 7_200_000, // 2h
  },
  {
    input: "asaris",
    output: "cepts_asaris",
    time: 10_800_000, // 3h
  },
  {
    input: "lasis",
    output: "cepts_lasis",
    time: 14_400_000, // 4h
  },
];

type BerryInInv = {
  name: ItemKey;
  amount: number;
  itemObj: Item;
};

type State = {
  user: UserProfile;

  selectedMenu: null | "cook" | "boil";

  boil: {
    berriesInInv: BerryInInv[];
    selectedBerry: ItemKey;
    chosenBerries: Record<ItemKey, number>;
    combinedProperties: Record<keyof BerryProperties, number>;
  };
};

function makeCombinedProperties(chosenBerries: Record<ItemKey, number>) {
  const combinedProperties: Record<keyof BerryProperties, number> = {
    saldums: 0,
    skabums: 0,
    rugtums: 0,
    slapjums: 0,
  };

  Object.keys(chosenBerries).forEach((berry) => {
    const properties = berryProperties[berry];
    Object.keys(properties).forEach((prop) => {
      // @ts-ignore
      combinedProperties[prop] += properties[prop] * chosenBerries[berry];
    });
  });

  return combinedProperties;
}

function getBoilDuration() {
  return 60 * 1000; // 1 min
}

const enum ComponentId {
  SelectBoil = "plits_select_menu_boil",
  SelectCook = "plits_select_menu_cook",

  SelectBerry = "plits_select_berry",
  AddBerry = "plits_add_berry",
  RemoveBerry = "plits_remove_berry",
  RemoveAllBerries = "plits_remove_all_berries",
  Boil = "plits_boil_ievarijums",
}

const view: DialogsViewFunc<State> = (state, i) => {
  if (!state.selectedMenu) {
    return mainEmbed({
      i,
      title: `Izmantot: ${itemString("gazes_plits")}`,
      color: commandColors.izmantot,
      description: "Ko tu vēlies darīt?",
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(ComponentId.SelectCook).setLabel("Cept").setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(ComponentId.SelectBoil)
            .setLabel("Vārīt ievārījumu")
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
  }

  if (state.selectedMenu === "boil") {
    if (!state.boil.berriesInInv.length) {
      return mainEmbed({
        i,
        color: commandColors.izmantot,
        description: "Tev inventārā nav ogu ko vārīt",
      });
    }

    let description = "";

    if (!Object.keys(state.boil.chosenBerries).length) {
      description = "No izvēlnes izvēlies ogas, kuras pievienot vārīšanai";
    } else {
      const { distance, value, normalizedDistance } = calcIevarijumsPrice(state.boil.combinedProperties);
      description += `Distance: ${distance} \nVērtība: ${value} lati \nNormalized distance: ${normalizedDistance}`;
    }

    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(ComponentId.SelectBerry)
          .setPlaceholder("Izvēlies ogu")
          .addOptions(
            ...state.boil.berriesInInv // @ts-ignore jo stringu salīdzināšana
              .toSorted((a, b) => a.name > b.name)
              .map(({ name, itemObj, amount }) => ({
                label: `${capitalizeFirst(itemObj.nameNomVsk)} (tev ir ${amount})`,
                description:
                  `Sald. ${berryProperties[name].saldums} | ` +
                  `Skāb. ${berryProperties[name].skabums} | ` +
                  `Rūgt. ${berryProperties[name].rugtums} | ` +
                  `Slapj. ${berryProperties[name].slapjums}`,
                value: name,
                emoji: itemObj.emoji() || "❓",
                default: name === state.boil.selectedBerry,
              })),
          ),
      ),
    ];

    if (state.boil.selectedBerry) {
      const selectedBerryInInv = state.boil.berriesInInv.find(({ name }) => name === state.boil.selectedBerry)!;

      const row = [
        new ButtonBuilder()
          .setCustomId(ComponentId.AddBerry)
          .setLabel("Mest katlā")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(selectedBerryInInv.amount <= state.boil.chosenBerries[state.boil.selectedBerry]),
      ];

      if (state.boil.chosenBerries[state.boil.selectedBerry] > 0) {
        row.push(
          new ButtonBuilder()
            .setCustomId(ComponentId.RemoveBerry)
            .setLabel(`Izņemt ${selectedBerryInInv.itemObj.nameAkuDsk}`)
            .setStyle(ButtonStyle.Danger),
        );
      }

      if (Object.keys(state.boil.chosenBerries).length) {
        row.push(
          new ButtonBuilder()
            .setCustomId(ComponentId.RemoveAllBerries)
            .setLabel("Izņemt visas ogas")
            .setStyle(ButtonStyle.Danger),
        );
      }

      components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(row));

      const totalBerryCount = Object.values(state.boil.chosenBerries).reduce((a, b) => a + b, 0);

      components.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(ComponentId.Boil)
            .setLabel("Vārīt")
            .setStyle(totalBerryCount < 3 ? ButtonStyle.Secondary : ButtonStyle.Success)
            .setDisabled(totalBerryCount < 3),
        ),
      );
    }

    return mainEmbed({
      i,
      title: `${itemString("gazes_plits")} - Vārīt ievārījumu`,
      color: commandColors.izmantot,
      description,
      fields: [
        {
          name: "Izvēlētās ogas",
          value: Object.entries(state.boil.chosenBerries) // @ts-ignore jo stringu salīdzināšana
            .toSorted((a, b) => a[0] > b[0])
            .map(([key, amount]) => `${itemString(key)}: ${amount}`)
            .join("\n"),
          inline: false,
        },
        {
          name: "Kombinētās īpašības",
          value: Object.keys(state.boil.combinedProperties)
            .map(
              (prop) =>
                // neliela TS putra
                `${propertiesLat[prop as keyof BerryProperties]}: ` +
                `${state.boil.combinedProperties[prop as keyof BerryProperties]}`,
            )
            .join("\n"),
          inline: false,
        },
      ],
      components,
    });
  }

  // TODO: uztaisīt cepšanu
  if (state.selectedMenu === "cook") {
    return mainEmbed({
      i,
      description: "Cept",
    });
  }

  // šim nekad nevajadzētu notikt, bet atgriežu, lai TS nebļauj
  return mainEmbed({ i, description: "ja tu redzi šo ziņu, tad kaut kas ir nogājis galīgi greizi" });
};

const use: UsableAttributeItemFunc = async (i, user, _, specialItem) => {
  const berriesInInv: BerryInInv[] = [];

  Object.keys(berryProperties).forEach((berry) => {
    const inInv = user.items.find(({ name }) => name === berry);
    if (inInv && inInv.amount > 0) {
      berriesInInv.push({ name: berry, amount: inInv.amount, itemObj: itemList[berry] });
    }
  });

  const initialState: State = {
    user,
    selectedMenu: null,
    boil: {
      berriesInInv,
      selectedBerry: "",
      chosenBerries: {},
      combinedProperties: makeCombinedProperties({}),
    },
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot_gazes_plits", { time: 60000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    // pirmā izvēlne ========================================
    if (int.customId === ComponentId.SelectCook && int.isButton()) {
      dialogs.state.selectedMenu = "cook";
      return { update: true };
    }

    if (int.customId === ComponentId.SelectBoil && int.isButton()) {
      dialogs.state.selectedMenu = "boil";

      if (!dialogs.state.boil.berriesInInv.length) {
        return { update: true, end: true };
      }

      return { update: true };
    }

    // vārīšana ========================================
    if (int.customId === ComponentId.SelectBerry && int.isStringSelectMenu()) {
      dialogs.state.boil.selectedBerry = int.values[0];
      return { update: true };
    }

    if (int.customId === ComponentId.AddBerry && int.isButton()) {
      const selectedBerry = dialogs.state.boil.selectedBerry;
      if (!selectedBerry) return { errror: true };

      if (dialogs.state.boil.chosenBerries[selectedBerry]) {
        dialogs.state.boil.chosenBerries[selectedBerry]++;
      } else {
        dialogs.state.boil.chosenBerries[selectedBerry] = 1;
      }

      dialogs.state.boil.combinedProperties = makeCombinedProperties(dialogs.state.boil.chosenBerries);

      return { update: true };
    }

    if (int.customId === ComponentId.RemoveBerry && int.isButton()) {
      const selectedBerry = dialogs.state.boil.selectedBerry;

      if (!selectedBerry || !dialogs.state.boil.chosenBerries[selectedBerry]) {
        return { errror: true };
      }

      delete dialogs.state.boil.chosenBerries[selectedBerry];
      dialogs.state.boil.combinedProperties = makeCombinedProperties(dialogs.state.boil.chosenBerries);
      // dialogs.state.boil.selectedBerry = '';

      return { update: true };
    }

    if (int.customId === ComponentId.RemoveAllBerries && int.isButton()) {
      dialogs.state.boil.chosenBerries = {};
      dialogs.state.boil.combinedProperties = makeCombinedProperties({});
      dialogs.state.boil.selectedBerry = "";

      return { update: true };
    }

    if (int.customId === ComponentId.Boil && int.isButton()) {
      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      // pārbaudam, vai plīts ir inventarā
      const isPlitsInInv = user.specialItems.find(({ _id }) => _id === specialItem._id);
      if (!isPlitsInInv) {
        await intReply(int, ephemeralReply(`Kļūda: Šī **${itemString("gazes_plits")}** vairs nav tavā inventārā`));
        return { end: true };
      }

      // pārbauda, vai izvēlētās ogas ir inventarā
      let hasInInv = true;
      for (const [key, amount] of Object.entries(dialogs.state.boil.chosenBerries)) {
        const inInv = user.items.find(({ name }) => name === key);
        if (!inInv || inInv.amount < amount) {
          hasInInv = false;
          break;
        }
      }

      if (!hasInInv) {
        // prettier-ignore
        await intReply(int, ephemeralReply(
          "Kļūda: Tava inventāra saturs ir mainījies, tev nav nepieciešamo ogu, lai uzvārītu šo ievārījumu",
        ));
        return { end: true };
      }

      const itemsToRemove = Object.fromEntries(
        Object.entries(dialogs.state.boil.chosenBerries).map(([key, amount]) => [key, -amount]),
      );

      // prettier-ignore
      const { ok } = await mongoTransaction(session => [
        () => addItems(userId, guildId, itemsToRemove, session),
        () => editItemAttribute(userId, guildId, specialItem._id!, {
          actionType: "boil_ievarijums",
          boilIevarijums: {
            boilStarttime: Date.now(),
            boilDuration: getBoilDuration(),
            berries: dialogs.state.boil.chosenBerries,
            properties: dialogs.state.boil.combinedProperties,
          },
        }, session)
      ])

      if (!ok) return { error: true };

      intReply(int, smallEmbed("Ievārījuma vārīšana uzsākta veiksmīgi!", commandColors.izmantot));
      return { end: true };
    }
  });
};

type Attributes = {
  actionType: GazesPlitsActionType;
  boilIevarijums?: {
    boilStarttime: number;
    boilDuration: number;
    berries: Record<ItemKey, number>;
    properties: BerryProperties;
  };
};

const gazes_plits = item<AttributeItem<Attributes> & TirgusItem>({
  info: "", // TODO
  addedInVersion: "4.3",
  nameNomVsk: "gāzes plīts",
  nameNomDsk: "gāzes plītis",
  nameAkuVsk: "gāzes plīti",
  nameAkuDsk: "gāzes plītis",
  isVirsiesuDzimte: false,
  emoji: () => emoji("gazes_plits"),
  imgLink: null,
  categories: [ItemCategory.TIRGUS],
  value: 50,
  tirgusPrice: { items: { metalluznis: 10 } },
  defaultAttributes: () => ({
    actionType: "",
  }),
  displayAttributes: (attr, inline, currTime) => {
    const { actionType } = attr;

    if (actionType === "boil_ievarijums") {
      const boilIevarijums = attr.boilIevarijums!;

      if (boilIevarijums.boilStarttime + boilIevarijums.boilDuration < currTime) {
        return "Ievārījums ir izvārīts!";
      }

      let str = "Vāra ievārījumu...\n";

      if (!inline) {
        str +=
          Object.entries(boilIevarijums.berries)
            .map(([name, amount]) => `${amount} ${itemList[name].emoji() || "❓"}`)
            .join(", ") + "\n";
      }

      const millis = millisToReadableTime(boilIevarijums.boilStarttime + boilIevarijums.boilDuration - currTime);

      str += `Gatavs pēc: ${wrapString(millis, "", !inline)}`;

      return str;
    }

    return "Tukšs!";

    /*
      const { output, time } = cookableItems.find(({ input }) => input === cookingItem)!;
      const timeWhenDone = cookingStartedTime! + time;
      const isDoneCooking = timeWhenDone < currTime;

      const itemStr = (key: ItemKey) => (inline ? capitalizeFirst(itemList[key].nameNomVsk) : `**${itemString(key)}**`);

      if (isDoneCooking) {
        return `Izcepts: ${itemStr(output)}`;
      }

      return (
        `Cepjas: ${itemStr(cookingItem)}` +
        (inline ? `, ` : '\n') +
        `Gatavs pēc: ${inline ? '' : '`'}${millisToReadableTime(timeWhenDone - currTime)}${inline ? '' : '`'}`
      );
      */
  },
  sortBy: (attrA, attrB) => attrB.actionType.localeCompare(attrA.actionType),
  use,
});

export default gazes_plits;
