import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
  SelectMenuComponentOptionData,
} from 'discord.js';
import { JobPositions } from './vakances';

export default function vakancesComponents(
  chosen: string,
  level: number,
  currentJob: string | null
) {
  const options: SelectMenuComponentOptionData[] = Object.entries(JobPositions)
    .filter(([key, value]) => key !== currentJob && level >= value.minLevel)
    .map(([key, value]) => ({
      label: value.name,
      emoji: value.emojiId,
      value: key,
      default: key === chosen,
    }));

  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('vakances_select')
        .setPlaceholder('Izvēlies vakanci')
        .setDisabled(!options.length)
        .addOptions(options.length ? options : [{ label: '-', value: '-' }])
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('vakances_button')
        .setLabel('Mainīt darbu')
        .setStyle(chosen ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!chosen)
    ),
  ];
}
