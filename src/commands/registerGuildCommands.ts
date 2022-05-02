import { Client } from 'discord.js'
import { commandList, devCommandList } from './commandList'

export async function registerGuildCommands(client: Client) {
  const guild = client.guilds.cache.get(process.env.DEV_SERVER_ID!)!
  const guildCommands = guild.commands

  for (const command of [...commandList, ...devCommandList]) {
    await guildCommands.create(command.config)
  }
}
