import { AutocompleteInteraction } from 'discord.js';
import { commandList } from './commandList';

export default async function autocompleteHandler(interaction: AutocompleteInteraction) {
  const command = commandList.find(command => command.config.name === interaction.commandName);
  command?.autocomplete?.(interaction);
}