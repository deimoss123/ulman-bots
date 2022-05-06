import { CommandInteraction, EmbedField, MessageOptions } from 'discord.js';

interface EmbedTemplateOptions {
  i: CommandInteraction;
  content?: string;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  color?: number;
}

export default function(options: EmbedTemplateOptions): MessageOptions {
  return {
    content: options.content,
    embeds: [
      {
        title: options.title ?? '',
        description: options.description ?? '',
        color: options.color ?? '#000000',
        fields: options.fields ?? [],
        author: {
          name: options.i.user.username,
          icon_url: options.i.user.displayAvatarURL({ dynamic: true }),
        },
      },
    ],
  };
}