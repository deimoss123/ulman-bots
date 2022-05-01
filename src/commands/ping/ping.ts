import Command from '../../interfaces/Command'
import { CommandInteraction, InteractionReplyOptions } from 'discord.js'

const embed1: InteractionReplyOptions = {
  content: '\u200B',
  embeds: [{
    title: 'Pong :D'
  }]
}

const embed2: InteractionReplyOptions = {
  content: '\u200B',
  embeds: [{
    title: 'Pong? :( <a:_divainazivs:927210108654587905>'
  }]
}

export const ping: Command = {
  title: 'Ping',
  description: 'Atbild ar pong',
  config: {
    name: 'ping',
    description: 'atbild ar ping?????'
  },
  async run(i: CommandInteraction) {
    await i.reply(embed1)
    setTimeout(() => i.editReply(embed2), 1000)
  }
}