import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from 'discord.js';

type InteractionTypes =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | SelectMenuInteraction
  | ModalSubmitInteraction;

function intReply(
  interaction: InteractionTypes,
  options: InteractionReplyOptions & { fetchReply: true }
): Promise<Message | null>;
function intReply(
  interaction: InteractionTypes,
  options: InteractionReplyOptions | string
): Promise<InteractionResponse | null>;

async function intReply(
  interaction: InteractionTypes,
  options: (InteractionReplyOptions & { fetchReply: true }) | InteractionReplyOptions | string
): Promise<InteractionResponse | Message | null> {
  try {
    if (typeof options !== 'string' && 'fetchReply' in options && options.fetchReply === true) {
      const res = await interaction.reply(options);
      return res;
    }

    const res = await interaction.reply(options);
    return res;
  } catch (_) {
    return null;
  }
}

export default intReply;
