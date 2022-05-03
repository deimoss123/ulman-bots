import { Client, Intents } from 'discord.js'
import { commandList, devCommandList } from './commands/commandList'
import dotenv from 'dotenv'
import validateEnv from './utils/validateEnv'

async function registerGuildCommands(client: Client) {
  const guild = await client.guilds.fetch(process.env.DEV_SERVER_ID!)
  const guildCommands = guild.commands

  for (const command of [...commandList, ...devCommandList]) {
    await guildCommands.create(command.config)
  }
  console.log('Guild commands registered')
  process.exit(0)
}

dotenv.config()

if (!validateEnv()) process.exit(1)

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.login(process.env.BOT_TOKEN).then(async () => {
  await registerGuildCommands(client)
})



