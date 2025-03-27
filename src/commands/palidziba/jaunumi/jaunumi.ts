import {
  ActionRowBuilder,
  BaseInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedField,
  StringSelectMenuBuilder,
} from "discord.js";
import commandColors from "@/utils/commandColors";
import mainEmbed, { ULMANBOTA_VERSIJA } from "@/utils/embeds/mainEmbed";
import intReply from "@/utils/intReply";
import updatesList, { VersionString } from "@/commands/palidziba/jaunumi/updatesList";
import { Dialogs } from "@/utils/dialogs";
import errorEmbed from "@/utils/embeds/errorEmbed";

type State = {
  selectedVersion: VersionString;
};

const enum ComponentId {
  Select = "jaunumi_select",
}

function view(state: State, i: BaseInteraction) {
  const { date, description, fields } = updatesList[state.selectedVersion]();

  const updates = Object.entries(updatesList).map(([k, v]) => [k, v()] as const);

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ComponentId.Select)
        .addOptions(
          updates
            .map(([v, { date }]) => ({ label: v, description: date, value: v, default: state.selectedVersion === v }))
            .toReversed(),
        ),
    ),
  ];

  return mainEmbed({
    i,
    color: commandColors.info,
    title: `Jaunumi - Versija ${state.selectedVersion} (${date})`,
    description,
    fields: fields as EmbedField[],
    components,
  });
}

export default async function jaunumi(i: ChatInputCommandInteraction) {
  const dialogs = new Dialogs<State>(i, { selectedVersion: ULMANBOTA_VERSIJA }, view, "palidziba", { time: 300000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    if (int.customId === ComponentId.Select && int.componentType === ComponentType.StringSelect) {
      state.selectedVersion = int.values[0] as VersionString;
      return {
        update: true,
      };
    }
  });
}
