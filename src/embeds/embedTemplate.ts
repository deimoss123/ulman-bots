import { CommandInteraction, EmbedField, MessageOptions } from 'discord.js'

interface EmbedTemplateOptions {
  i: CommandInteraction
  content?: string
  title?: string
  description?: string
  fields?: EmbedField[]
  color?: number
}

export default function(options: EmbedTemplateOptions): MessageOptions {
  const {
    i,
    content, // = '\u200B',
    title = '',
    description = '',
    fields = [],
    color = 0x000000,
  } = options

  return {
    content,
    embeds: [
      {
        title,
        description,
        color,
        fields,
        author: {
          name: i.user.username,
          icon_url: i.user.displayAvatarURL({ dynamic: true }),
        },
      },
    ],
  }
}