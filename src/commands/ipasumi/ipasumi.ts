import { ActionRowBuilder, BaseInteraction, ComponentType, StringSelectMenuBuilder } from "discord.js";
import findUser from "@/db/findUser";
import errorEmbed from "@/embeds/errorEmbed";
import Command from "@/interfaces/Command";
import UserProfile from "@/interfaces/UserProfile";
import { Dialogs } from "@/utils/Dialogs";
import intReply from "@/utils/intReply";
import embedTemplate from "@/embeds/embedTemplate";
import capitalizeFirst from "@/embeds/helpers/capitalizeFirst";
import * as metalluznuNodosanasPunkts from "@/commands/ipasumi/metalluznuNodosanasPunkts";
import * as ievarijumuStends from "@/commands/ipasumi/ievarijumuStends";

const ALL_PROPERTIES = {
  metalluznuNodosanasPunkts: {
    name: "metāllūžņu nodošanas punkts",
    emoji: "❓",
    ...metalluznuNodosanasPunkts,
    // defaultState: metalluznuNodosanasPunkts.defaultState,
    // view: metalluznuNodosanasPunkts.view,
    // handler: metalluznuNodosanasPunkts.handler
  },
  ievarijumuStends: {
    name: "ievārījumu stends",
    emoji: "❓",
    ...ievarijumuStends,
    // defaultState: ievarijumuStends.defaultState,
    // view: ievarijumuStends.view,
    // handler: ievarijumuStends.handler
  },
} satisfies Record<
  string,
  {
    name: string;
    emoji: string;
    init: (state: IpasumiState) => Promise<{ ok: boolean }>;
    defaultState: () => Record<string, unknown>;
    view: Dialogs<IpasumiState>["viewFunc"];
    handler: Parameters<Dialogs<IpasumiState>["onClick"]>[0]; // Dialogs.onClick callback
  }
>;

export type IpasumiState = {
  temp: boolean;

  userId: string;
  guildId: string;
  user: UserProfile;
  screen: "default" | keyof typeof ALL_PROPERTIES;
  selectedProperty: null | keyof typeof ALL_PROPERTIES;

  metalluznuNodosanasPunkts: metalluznuNodosanasPunkts.State;
  ievarijumuStends: ievarijumuStends.State;
};

const enum ComponentId {
  Select = "ipasumi_select",
}

function ipasumiView(state: IpasumiState, i: BaseInteraction) {
  if (state.screen !== "default") {
    return ALL_PROPERTIES[state.screen].view(state, i);
  }

  return embedTemplate({
    i,
    title: "Īpašumi",
    content: "\u200B",
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(ComponentId.Select)
          .setPlaceholder("Izvēlies īpašumu")
          .addOptions(
            Object.entries(ALL_PROPERTIES).map(([key, { name, emoji }]) => {
              return {
                label: `${capitalizeFirst(name)}`,
                value: key,
                emoji,
                default: state.selectedProperty === key,
              };
            }),
          ),
      ),
    ],
  });
}

const ipasumi: Command = {
  description: () => "...",
  color: 0x000000,
  data: {
    name: "ipasumi",
    description: "Tavi īpašumi",
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const initialState = {
      temp: false,
      userId,
      guildId,
      user,
      screen: "default",
      selectedProperty: null,
    } as IpasumiState;

    for (const [k, v] of Object.entries(ALL_PROPERTIES)) {
      // @ts-ignore
      initialState[k] = v.defaultState();
    }

    const dialogs = new Dialogs(i, initialState, ipasumiView, "ipasumi", { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async (int, state) => {
      if (state.screen !== "default") {
        return ALL_PROPERTIES[state.screen].handler(int, state);
      }

      if (int.componentType !== ComponentType.StringSelect) return;
      if (!Object.keys(ALL_PROPERTIES).includes(int.values[0])) return;

      const selected = int.values[0] as keyof typeof ALL_PROPERTIES;

      if (!(await ALL_PROPERTIES[selected].init(state)).ok) {
        return { edit: true, error: true };
      }

      state.screen = selected;

      return { update: true };
    });
  },
};

export default ipasumi;
