import {
  ButtonInteraction,
  CommandInteraction,
  EmbedField,
  InteractionReplyOptions,
  MessageActionRow,
} from 'discord.js';

interface EmbedTemplateOptions {
  i: CommandInteraction | ButtonInteraction;
  content?: string;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  color?: any;
  components?: MessageActionRow[];
}

export default function embedTemplate(options: EmbedTemplateOptions): InteractionReplyOptions {
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
    components: options.components ?? [],
    fetchReply: true,
  };
}