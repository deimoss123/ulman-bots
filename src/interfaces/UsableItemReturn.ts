import { EmbedField } from 'discord.js';

interface UsableItemReturn {
  text: string;
  fields?: EmbedField[];
}

export default UsableItemReturn;