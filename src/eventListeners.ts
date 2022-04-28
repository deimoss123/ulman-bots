import {
  Client,
  Guild,
  GuildChannelResolvable,
  GuildMember,
  Message,
  Permissions,
} from 'discord.js'
import commandHandler from './commands/commandHandler'

// pārbauda vai botam ir atļauja sūtīt ziņas
function checkPerms(msg: Message): boolean {
  const perms = [Permissions.FLAGS.SEND_MESSAGES]

  const guild = msg.guild as Guild
  const bot = guild.me as GuildMember
  return bot.permissionsIn(msg.channel as GuildChannelResolvable).has(perms)
}

// komandām būs nomaināms prefikss (PRIEDĒKLIS) katrā serverī, pagaidām tas tiek iestatīts kā punkts
export const tempPrefix = '.'

export default function(client: Client): void {
  // bots ir gatavs
  client.on('ready', () => {
    console.log('bot ready')
  })

  // bots gaida ziņas
  client.on('messageCreate', message => {
    if (message.author.bot || !message.content || !checkPerms(message)) {
      return
    }

    if (message.content.startsWith(tempPrefix)) {
      commandHandler(message)
    }
  })
}