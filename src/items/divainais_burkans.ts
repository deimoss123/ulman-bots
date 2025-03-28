import addLati from "@/db/addLati";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import { item, AttributeItem, ShopItem, ItemCategory, UsableAttributeItemFunc } from "@/types/Item";
import UserProfile, { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import { Dialogs } from "@/utils/dialogs";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import smallEmbed from "@/utils/embeds/smallEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import daudzskaitlis from "@/utils/strings/daudzkaitlis";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";
import latiString from "@/utils/strings/latiString";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
  ModalBuilder,
  ModalActionRowComponentBuilder,
  TextInputBuilder,
  TextInputStyle,
  BaseInteraction,
} from "discord.js";

const BURKANS_CHANGE_NAME_COST = 250;

type State = {
  user: UserProfile;
  itemId: string;
  attributes: ItemAttributes;
  currTime: number;
};

const enum ComponentId {
  ChangeName = "divainais_burkans_change_name",
}

function view({ user, attributes }: State, i: BaseInteraction) {
  return mainEmbed({
    i,
    color: commandColors.izmantot,
    // stulbi sanāk, jo es neglabāju pašu mantu, tāpēc jātaisa objekts pašam
    title: izmantotTitle({ name: "divainais_burkans", attributes }),
    description:
      "Tu nokodies dīvaino burkānu, **mmmm** tas bija ļoti garšīgs\n" +
      `Šis burkāns ir nokosts **${attributes.timesUsed}** ` +
      daudzskaitlis(attributes.timesUsed!, "reizi", "reizes"),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(ComponentId.ChangeName)
          .setLabel(`Mainīt burkāna nosaukumu (${latiString(BURKANS_CHANGE_NAME_COST)})`)
          .setStyle(user.lati >= BURKANS_CHANGE_NAME_COST ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(user.lati < BURKANS_CHANGE_NAME_COST),
      ),
    ],
  });
}

async function handleModal(
  i: ModalSubmitInteraction,
  currTime: number,
): Promise<{ user: UserProfile; newItem: SpecialItemInProfile } | undefined> {
  const user = await findUser(i.user.id, i.guildId!);
  if (!user) {
    intReply(i, errorEmbed);
    return;
  }

  if (user.lati < BURKANS_CHANGE_NAME_COST) {
    intReply(
      i,
      ephemeralReply(`Tev nepietiek naudas, lai nomainītu burkāna nosaukumu\nTev ir ${latiString(user.lati)}`),
    );
    return;
  }

  const split = i.customId.split("_");
  const itemId = split[split.length - 2];
  const modalCurrTime = +split[split.length - 1];

  if (modalCurrTime !== currTime) {
    return;
  }

  const newName = i.fields.getTextInputValue("burkans_modal_input").trim();

  const itemInInv = user.specialItems.find((item) => item._id === itemId);
  if (!itemInInv) {
    intReply(i, errorEmbed);
    return;
  }

  if (newName === itemInInv.attributes.customName) {
    intReply(i, ephemeralReply("Jaunajam burkāna nosaukumam ir jāatšķiras no vecā"));
    return;
  }

  // prettier-ignore
  const { ok, values } = await mongoTransaction((session) => [
    () => editItemAttribute(i.user.id, i.guildId!, itemId, { ...itemInInv.attributes, customName: newName }, session),
    () => addLati(i.user.id, i.guildId!, -BURKANS_CHANGE_NAME_COST, session),
  ]);

  if (!ok) {
    intReply(i, errorEmbed);
    return;
  }

  const { newItem, user: newUser } = values[0];

  intReply(
    i,
    smallEmbed(
      "Burkāna nosakums veiksmīgi nomainīts\n" +
        `No: ${itemString("divainais_burkans", null, false, itemInInv.attributes)}\n` +
        `Uz: **${itemString("divainais_burkans", null, false, newItem.attributes)}**`,
      0xffffff,
    ),
  );

  return { newItem, user: newUser };
}

const use: UsableAttributeItemFunc = async (i, _, __, specialItem) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const res = await editItemAttribute(userId, guildId, specialItem._id!, {
    ...specialItem.attributes,
    timesUsed: specialItem.attributes.timesUsed! + 1,
  });
  if (!res) return intReply(i, errorEmbed);

  const initialState: State = {
    user: res.user,
    itemId: res.newItem._id!,
    attributes: res.newItem.attributes,
    currTime: Date.now(),
  };

  const dialogs = new Dialogs(i, initialState, view, "izmantot", { time: 30000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    const itemInInv = user.specialItems.find(({ _id }) => _id === specialItem?._id);
    if (!itemInInv) {
      intReply(int, ephemeralReply(`Šis **${itemString("divainais_burkans")}** vairs nav tavā inventārā`));
      return { end: true };
    }

    if (int.customId === ComponentId.ChangeName && int.isButton()) {
      if (user.lati < BURKANS_CHANGE_NAME_COST) {
        intReply(
          int,
          ephemeralReply(`Tev nepietiek naudas, lai nomainītu burkāna nosaukumu\nTev ir ${latiString(user.lati)}`),
        );
        return { end: true };
      }

      const modalId = `burkans_modal_${specialItem!._id}_${state.currTime}`;

      await int.showModal(
        new ModalBuilder()
          .setCustomId(modalId)
          .setTitle("Mainīt dīvainā burkāna nosaukumu")
          .addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("burkans_modal_input")
                .setLabel("Jaunais nosaukums")
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(10),
            ),
          ),
      );

      try {
        const modalInt = await int.awaitModalSubmit({
          filter: (i) => i.customId == modalId,
          time: 50000,
        });

        const res = await handleModal(modalInt, state.currTime);
        if (!res) {
          return {};
        }

        state.user = res.user;
        state.attributes = res.newItem.attributes;
      } catch (_) {
        return {};
      }

      state.currTime = Date.now();

      return { edit: true };
    }
  });
};

type Attributes = {
  timesUsed: number;
  customName: string;
};

const divainais_burkans = item<AttributeItem<Attributes> & ShopItem>({
  info:
    "Šis burkāns ir ne tikai dīvains, bet arī garšīgs!\n" +
    "Burkānam piemīt atrībuts, kas uzskaita cik reizes tas ir bijis nokosts (izmantots)\n\n" +
    "_burkānam piemīt vēlviens atribūts, par kuru uzzinās tikai tie kas to ir nopirkuši_",
  addedInVersion: "4.0",
  nameNomVsk: "dīvainais burkāns",
  nameNomDsk: "dīvainie burkāni",
  nameAkuVsk: "dīvaino burkānu",
  nameAkuDsk: "dīvainos burkānus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("divainais_burkans"),
  imgLink: "https://www.ulmanbots.lv/images/items/divainais_burkans.gif",
  categories: [ItemCategory.VEIKALS],
  value: 5000,
  // eslint-disable-next-line func-names
  customValue: function ({ customName }) {
    // humors
    if (customName!.toLowerCase().includes("seks")) return 6969;

    // pārbauda kirilicu
    if (/[а-яА-ЯЁё]/.test(customName!)) return 0;

    return this.value;
  },
  defaultAttributes: () => ({
    timesUsed: 0,
    customName: "",
  }),
  sortBy: { timesUsed: 1 },
  allowDiscount: true,
  use,
});

export default divainais_burkans;
