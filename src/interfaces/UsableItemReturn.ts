import { ButtonInteraction, ChatInputCommandInteraction, CommandInteraction, EmbedField } from 'discord.js';

interface UsableItemReturn {
  text: string;
  fields?: EmbedField[];
  color?: string;
  custom?: (
    // i: CommandInteraction | ButtonInteraction,
    i: ChatInputCommandInteraction | ButtonInteraction,
    color: number
  ) => Promise<any>;
}

export default UsableItemReturn;
