import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import iconEmojis from '../../embeds/iconEmojis';

export default function btnPaginationRow(cmd: string, currentPage: number, totalPages: number) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage + 1 >= totalPages;

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('_')
      .setLabel(`${currentPage + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${cmd}_first_page`)
      .setEmoji(iconEmojis.pageFirst)
      .setDisabled(isFirstPage)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_prev_page`)
      .setEmoji(iconEmojis.pagePrev)
      .setDisabled(isFirstPage)
      .setStyle(isFirstPage ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_next_page`)
      .setEmoji(iconEmojis.pageNext)
      .setDisabled(isLastPage)
      .setStyle(isLastPage ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_last_page`)
      .setEmoji(iconEmojis.pageLast)
      .setDisabled(isLastPage)
      .setStyle(ButtonStyle.Secondary)
  );
}
