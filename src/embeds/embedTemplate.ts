import {
  ActionRowData,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ButtonInteraction,
  CommandInteraction,
  EmbedField,
  GuildMember,
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
          name: (options.i.member as GuildMember).displayName,
          icon_url: (options.i.member as GuildMember).displayAvatarURL(),
        },
        footer: {
          icon_url: 'https://i.postimg.cc/Hnp1BG37/ulmanis-footer1.png',
          text: `Versija: 4.0.0\u2800|\u2800Veidotājs: Deimoss#1984`,
        },
      },
    ],
    components: options.components ?? [],
    fetchReply: true,
  };
}
