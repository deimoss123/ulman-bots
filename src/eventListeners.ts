import { Client } from 'discord.js'
import commandHandler from './commands/commandHandler'
import mongo from './economy/mongo'

export default function(client: Client): void {
  client.on('ready', async () => {
    console.log('bot ready')
    await mongo().then(() => {
      console.log('connected to mongo')
    })
    //await registerGuildCommands(client)
  })

  // bots gaida komandas
  client.on('interactionCreate', async i => {
    if (i.isCommand()) {
      await commandHandler(i)
    }
  })
}