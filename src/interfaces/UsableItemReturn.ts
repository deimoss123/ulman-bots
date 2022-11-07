import { ButtonInteraction, ChatInputCommandInteraction, EmbedField } from 'discord.js';

type UsableItemReturn =
  | {
      text: string;
      fields?: EmbedField[];
      color?: string;
    }
  | {
      custom: (
        // i: ChatInputCommandInteraction | ButtonInteraction,
        i: ChatInputCommandInteraction | ButtonInteraction,
        color: number
      ) => any;
    }
  | {
      error: true;
    };

export default UsableItemReturn;
