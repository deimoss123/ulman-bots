import { Client } from 'discord.js'
import { commandList } from './commandList'

export async function registerGuildCommands(client: Client) {
  const guild = client.guilds.cache.get(process.env.DEV_SERVER_ID!)!
  const guildCommands = guild.commands

  for (const command of commandList) {
    await guildCommands.create(command.config)
  }
}
