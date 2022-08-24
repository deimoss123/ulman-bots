import { ButtonInteraction, CommandInteraction, EmbedField } from 'discord.js';

interface UsableItemReturn {
  text: string;
  fields?: EmbedField[];
  color?: string;
  custom?: (
    // i: CommandInteraction | ButtonInteraction,
    i: CommandInteraction | ButtonInteraction,
    color: number
  ) => Promise<any>;
}

export default UsableItemReturn;
