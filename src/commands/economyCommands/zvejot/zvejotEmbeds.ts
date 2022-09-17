import { CommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import UserProfile from '../../../interfaces/UserProfile';
import itemList from '../../../items/itemList';
import maksekeresData from './makskeresData';

export function zvejotEmbed(i: CommandInteraction, color: number, { fishing }: UserProfile) {
  const { selectedRod, usesLeft } = fishing;

  return embedTemplate({
    i,
    color,
    content: '\u200B',
    fields: [
      {
        name: 'Izvēlētā makšķere',
        value: selectedRod
          ? `${itemString(itemList[selectedRod])} ${usesLeft}/${maksekeresData[selectedRod].maxDurability}`
          : '-',
        inline: false,
      },
      {
        name: 'Nākamais ķēriens',
        value: '-',
        inline: true,
      },
      {
        name: 'Pēdējais ķēriens',
        value: '-',
        inline: true,
      },
    ],
  }).embeds;
}
