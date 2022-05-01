import { commandList } from './commandList'
import { CommandInteraction } from 'discord.js'

export default async function(interaction: CommandInteraction) {
  const command = commandList.find(cmd => cmd.config.name === interaction.commandName)!
  await command.run(interaction)
}