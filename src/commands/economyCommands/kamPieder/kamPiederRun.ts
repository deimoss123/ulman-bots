import { APIEmbedField, ButtonInteraction, ChatInputCommandInteraction, Collection } from 'discord.js';
import errorEmbed from '../../../embeds/errorEmbed';
import iconEmojis from '../../../embeds/iconEmojis';
import itemList, { ItemKey } from '../../../items/itemList';
import User from '../../../schemas/User';
import intReply from '../../../utils/intReply';
import kamPiederEmbed from './kamPiederEmbed';

const FIELD_COUNT = 15;

export default async function kamPiederRun(i: ChatInputCommandInteraction | ButtonInteraction, itemKey: ItemKey) {
  const defer = i.deferReply();
  if (!defer) return intReply(i, errorEmbed);

  const guildId = i.guildId!;

  const itemObj = itemList[itemKey];

  // parastās mantas (bez atribūtiem)
  if (!('attributes' in itemObj)) {
    const users = (await User.find(
      { guildId, items: { $elemMatch: { name: itemKey } } },
      { userId: 1, items: { $elemMatch: { name: itemKey } } }
    )) as { userId: string; items: { name: ItemKey; amount: number }[] }[];

    if (!users.length) {
      await defer;
      return i.editReply({ embeds: kamPiederEmbed(i, itemKey, []) }).catch(console.error);
    }

    await Promise.all([i.guild!.members.fetch({ user: users.map(({ userId }) => userId) }), defer]);

    const fields: APIEmbedField[] = users
      .sort((a, b) => b.items[0].amount - a.items[0].amount)
      .map(({ userId, items }) => ({
        name:
          (userId === i.user.id ? `${iconEmojis.blueArrowRight} ` : '') +
          (i.guild!.members.cache.get(userId)?.user?.tag || 'Nezināms lietotājs'),
        value: `Daudzums: ${items[0].amount}`,
      }));

    const total = users.reduce((p, { items }) => p + items[0].amount, 0);

    return i.editReply({ embeds: kamPiederEmbed(i, itemKey, fields, total) }).catch(console.error);
  }

  // atribūtu mantas
}
