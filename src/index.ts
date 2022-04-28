import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
import validateEnv from './utils/validateEnv'
import eventListeners from './eventListeners'

dotenv.config()

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
})

// bots ielogojas
client.login(process.env.BOT_TOKEN).then(() => {
  console.log('logged in')
  eventListeners(client)
})

