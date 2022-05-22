import { AutocompleteInteraction } from 'discord.js';
import { commandList, devCommandList } from './commandList';

export default async function autocompleteHandler(interaction: AutocompleteInteraction) {
  const command = [...commandList, ...devCommandList].find(command => command.config.name === interaction.commandName);
  command?.autocomplete?.(interaction);
}