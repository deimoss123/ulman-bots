import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default function btnPaginationRow(cmd: string, currentPage: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('_')
      .setLabel(`${currentPage + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${cmd}_prev_page`)
      .setLabel('Iepriekšējā lapa')
      .setDisabled(currentPage === 0)
      .setStyle(currentPage === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${cmd}_next_page`)
      .setLabel('Nākamā lapa')
      .setDisabled(currentPage + 1 === totalPages)
      .setStyle(currentPage + 1 === totalPages ? ButtonStyle.Secondary : ButtonStyle.Primary)
  );
}
