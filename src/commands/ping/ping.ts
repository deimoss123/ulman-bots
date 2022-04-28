import { Command } from '../../interfaces/Command'

export const ping: Command = {
  title: 'Ping',
  description: 'Atbild ar pong',
  devCommand: true,
  aliases: ['ping'],
  async run(message, args) {
    await message.reply(`Pong - ${args.join(' ')}`)
  }
}