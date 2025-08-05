import { BaseInteraction, ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import capitalizeFirst from "../strings/capitalizeFirst";

type Options = {
  author?: boolean;
  title?: string;
  commandName?: string;
  color?: number;
};

export class CommandDisplayBox {
  public container: ContainerBuilder;

  public viewReturn() {
    return {
      components: [this.container],
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
    } as const;
  }

  constructor(interaction: BaseInteraction, options?: Options) {
    this.container = new ContainerBuilder();

    if (!options) return;

    const { author = true, title, commandName, color } = options;

    if (author) {
      this.container.addTextDisplayComponents(
        // @ts-ignore
        new TextDisplayBuilder().setContent(`-# ${interaction.member?.displayName} (@${interaction.user.username})`),
      );
    }

    if (title) {
      let titleText = `### `;
      if (commandName) titleText += `[${capitalizeFirst(commandName)}] `;
      titleText += title;

      this.container.addTextDisplayComponents(new TextDisplayBuilder().setContent(titleText));
    }

    if (color) {
      this.container.setAccentColor(color);
    }
  }
}
