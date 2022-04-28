import { Message } from 'discord.js'
import { commandList } from './commandList'
import { tempPrefix } from '../eventListeners'

export default function(message: Message): void {
  // noņem mīkstinājuma zīmes un garumzīmes
  const messageText = message.content.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // sadala tekstu masīvā atdalot ar tukšumiem
  let args = messageText.split(/[ ]+/)

  // noņem komandas prefiksu
  const userCommand = args.shift()!.slice(tempPrefix.length)

  console.log(`Command: ${userCommand}`)
  console.log('Command args:', args)

  // atrod un izpilda komandu
  for (const command of commandList) {
    for (const alias of command.aliases) {
      if (alias === userCommand) {
        // pārbauda vai komanda nav dev komanda
        if (
          command.devCommand &&
          message.author.id !== process.env.DEV_ID ||
          message.guildId !== process.env.DEV_SERVER_ID
        ) return

        command.run(message, args)
        return
      }
    }
  }
}