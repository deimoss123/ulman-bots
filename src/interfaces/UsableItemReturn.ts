import { EmbedField } from 'discord.js';

interface UsableItemReturn {
  text: string;
  fields?: EmbedField[];
  color?: string;
}

export default UsableItemReturn;