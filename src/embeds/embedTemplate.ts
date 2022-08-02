import {
  ActionRowData,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ButtonInteraction,
  CommandInteraction,
  EmbedField,
  InteractionReplyOptions,
  JSONEncodable,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
} from 'discord.js';

interface EmbedTemplateOptions {
  i: CommandInteraction | ButtonInteraction;
  content?: string;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  color?: any;
  components?: (
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>
  )[];
}

export default function embedTemplate(
  options: EmbedTemplateOptions
): InteractionReplyOptions & { fetchReply: true } {
  return {
    content: options.content,
    embeds: [
      {
        title: options.title ?? '',
        description: options.description ?? '',
        color: options.color ?? 0x000000,
        fields: options.fields ?? [],
        author: {
          name: options.i.user.username,
          icon_url: options.i.user.displayAvatarURL(),
        },
      },
    ],
    components: options.components ?? [],
    fetchReply: true,
  };
}
