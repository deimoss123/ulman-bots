import { AutocompleteInteraction } from 'discord.js';
import { commandList } from '@/utils/commandList';

export default async function autocompleteHandler(interaction: AutocompleteInteraction) {
  const command = [...commandList].find(command => command.data.name === interaction.commandName);
  command?.autocomplete?.(interaction);
}
