import {
  ActionRowData,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  BaseInteraction,
  BaseMessageOptions,
  EmbedField,
  GuildMember,
  InteractionReplyOptions,
  JSONEncodable,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
} from 'discord.js';
import updatesList, { VersionString } from '../commands/economyCommands/palidziba/jaunumi/updatesList';

interface EmbedTemplateOptions {
  i: BaseInteraction;
  content?: string;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  color?: any;
  thumbnail?: string;
  image?: string;
  components?: (
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>
  )[];
  files?: BaseMessageOptions['files'];
}

export const ULMANBOTA_VERSIJA: VersionString = '4.3';

export default function embedTemplate(options: EmbedTemplateOptions): InteractionReplyOptions & { fetchReply: true } {
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
        image: options.image ? { url: options.image } : undefined,
        footer: {
          // icon_url: 'https://i.postimg.cc/Hnp1BG37/ulmanis-footer1.png',
          text: `UlmaņBots ${ULMANBOTA_VERSIJA} (${updatesList[ULMANBOTA_VERSIJA]().date})`,
        },
        thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
      },
    ],
    components: options.components ?? [],
    files: options.files ?? [],
    fetchReply: true,
  };
}
