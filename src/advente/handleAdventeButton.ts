import { ButtonInteraction } from 'discord.js';
import findUser from '../economy/findUser';
import ephemeralReply from '../embeds/ephemeralReply';
import errorEmbed from '../embeds/errorEmbed';
import intReply from '../utils/intReply';

export default async function handleAdventeButton(i: ButtonInteraction) {
  const date = new Date(new Date().setFullYear(2022, 11, 1));

  if (date.getMonth() !== 11 || date.getDate() > 24) {
    return intReply(i, ephemeralReply('Šī gada adventes kalendārs ir beidzies'));
  }

  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  intReply(i, {
    ephemeral: true,
    embeds: [
      {
        title: `Adventes kalendārs - ${date.toLocaleDateString('en-GB')}`,
        description: 'Tu saņēmi šodienas dāvanu',
      },
    ],
  });
}
