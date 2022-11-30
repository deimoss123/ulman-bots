import axios from 'axios';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import iconEmojis from '../embeds/iconEmojis';
import smallEmbed from '../embeds/smallEmbed';
import { ULMANBOTA_ROLE_ID } from '../izsoles/izsoleEmbed';
import generateCalendarImage from './generateCalendarImage';

export default async function adventeMsgHandler(msg: Message, apiCommand: string, content: string[]) {
  if (!process.env.ADVENTE_CHANNEL) return;

  const adventeChannel = msg.client.channels.cache.get(process.env.ADVENTE_CHANNEL);
  if (!adventeChannel || !adventeChannel.isTextBased()) {
    return msg.reply(
      smallEmbed(`${iconEmojis.cross} Adventes kanāls ar id \`${process.env.ADVENTE_CHANNEL}\` neeksistē`, 0xee0000)
    );
  }

  if (apiCommand === 'advente-start') {
    const date = +content[0] || 25;

    console.log(apiCommand);

    try {
      const img = await generateCalendarImage(date);
      const attachment = new AttachmentBuilder(img, { name: 'adventes-kalendars.png' });

      const components = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('advente_claim_btn')
            .setStyle(date > 24 ? ButtonStyle.Secondary : ButtonStyle.Success)
            .setLabel(date > 24 ? 'Adventes kalendārs ir beidzies' : 'Saņemt dāvanu')
            .setDisabled(date > 24)
        ),
      ];

      const res = await axios.get(`${process.env.UPSTASH_REDIS_URL}/get/adventeMessageId`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
      });

      const messageToEdit = await adventeChannel.messages.fetch(res.data.result).catch(() => null);

      if (!messageToEdit) {
        const message = await adventeChannel.send({
          content: `<@&${ULMANBOTA_ROLE_ID}>`,
          files: [attachment],
          components,
        });

        await axios.get(`${process.env.UPSTASH_REDIS_URL}/set/adventeMessageId/${message.id}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}` },
        });

        return msg.reply(smallEmbed(`${iconEmojis.checkmark} Aizsūtīts jauns adventes kalendārs`, 0x00ff00));
      }

      await messageToEdit.edit({ files: [attachment], components });
      return msg.reply(smallEmbed(`${iconEmojis.checkmark} Rediģēts adventes kalendārs`, 0x00ff00));
    } catch (e) {
      console.log(e);
      return msg.reply(
        smallEmbed(`${iconEmojis.cross} Neizdevās aizsūtīt ziņu adventes kanālā (${adventeChannel.id})`, 0xee0000)
      );
    }
  }
}
