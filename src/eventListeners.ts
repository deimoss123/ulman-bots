import { Client } from 'discord.js'
import commandHandler from './commands/commandHandler'
import { registerGuildCommands } from './commands/registerGuildCommands'
import mongo from './economy/mongo'

// pārbauda vai botam ir atļauja sūtīt ziņas
// function checkPerms(msg: Message): boolean {
//   const perms = [Permissions.FLAGS.SEND_MESSAGES]
//   const guild = msg.guild as Guild
//   const bot = guild.me as GuildMember
//   return bot.permissionsIn(msg.channel as GuildChannelResolvable).has(perms)
// }

export default function(client: Client): void {
  // bots ir gatavs
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