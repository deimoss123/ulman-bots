import chalk from "chalk";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from "discord.js";

type InteractionTypes =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | SelectMenuInteraction
  | ModalSubmitInteraction;

function intReply(
  interaction: InteractionTypes,
  options: InteractionReplyOptions & { withResponse: true },
): Promise<InteractionCallbackResponse | null>;
function intReply(
  interaction: InteractionTypes,
  options: InteractionReplyOptions | string,
): Promise<InteractionResponse | null>;

async function intReply(
  interaction: InteractionTypes,
  options: (InteractionReplyOptions & { withResponse: true }) | InteractionReplyOptions | string,
): Promise<InteractionResponse | InteractionCallbackResponse | null> {
  try {
    const res = await interaction.reply(options);
    return res;
  } catch (e: any) {
    console.log(new Date().toLocaleString("en-GB") + chalk.redBright(" [Error] ") + chalk.bold(e.message));
    return null;
  }
}

export default intReply;
