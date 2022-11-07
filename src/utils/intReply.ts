import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  SelectMenuInteraction,
} from 'discord.js';

function intReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction,
  options: InteractionReplyOptions & { fetchReply: true }
): Promise<Message | null>;
function intReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction,
  options: InteractionReplyOptions | string
): Promise<InteractionResponse | null>;

async function intReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction,
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
