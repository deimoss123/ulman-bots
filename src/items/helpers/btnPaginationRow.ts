import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import emoji from '@/utils/emoji';

export default function btnPaginationRow(cmd: string, currentPage: number, totalPages: number) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage + 1 >= totalPages;

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${cmd}_first_page`)
      .setEmoji(emoji('icon_page_first'))
      .setDisabled(isFirstPage)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_prev_page`)
      .setEmoji(emoji('icon_page_prev'))
      .setDisabled(isFirstPage)
      .setStyle(isFirstPage ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_next_page`)
      .setEmoji(emoji('icon_page_next'))
      .setDisabled(isLastPage)
      .setStyle(isLastPage ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_last_page`)
      .setEmoji(emoji('icon_page_last'))
      .setDisabled(isLastPage)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('_')
      .setLabel(`${currentPage + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );
}
