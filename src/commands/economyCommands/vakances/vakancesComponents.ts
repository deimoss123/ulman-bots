import { MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import { JobPositions } from './vakances';
import getLevel from '../../../levelingSystem/getLevel';

export default function vakancesComponents(chosen: string, xp: number, currentJob: string) {
  const options = Object.entries(JobPositions)
    .filter(([key, value]) => key !== currentJob && getLevel(xp).level >= value.minLevel)
    .map(([key, value]) => ({
      label: value.name,
      value: key,
      default: key === chosen,
    }));

  return [
    new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('vakances_select')
        .setPlaceholder('Izvēlies vakanci')
        .setDisabled(!options.length)
        .addOptions(options.length ? options : [{ label: '-', value: '-' }])
    ),
    new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('vakances_button')
        .setLabel('Mainīt darbu')
        .setStyle(chosen ? 'PRIMARY' : 'SECONDARY')
        .setDisabled(!chosen)
    ),
  ];
}
