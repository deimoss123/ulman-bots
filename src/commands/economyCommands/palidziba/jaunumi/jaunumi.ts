import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedField,
  StringSelectMenuBuilder,
} from 'discord.js';
import buttonHandler from '../../../../embeds/buttonHandler';
import commandColors from '../../../../embeds/commandColors';
import embedTemplate, { ULMANBOTA_VERSIJA } from '../../../../embeds/embedTemplate';
import intReply from '../../../../utils/intReply';
import updatesList, { VersionString } from './updatesList';

function embed(i: ChatInputCommandInteraction, selectedVersion: VersionString) {
  const { date, description } = updatesList[selectedVersion];
  const fields = updatesList[selectedVersion].fields as EmbedField[];

  return embedTemplate({
    i,
    color: commandColors.info,
    title: `Jaunumi - Versija ${selectedVersion} (${date})`,
    description,
    fields,
  }).embeds;
}

function components(selectedVersion: VersionString) {
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder().setCustomId('jaunumi_select').addOptions(
        Object.entries(updatesList)
          .map(([v, { date }]) => ({ label: v, description: date, value: v, default: selectedVersion === v }))
          .reverse(),
      ),
    ),
  ];
}

export default async function jaunumi(i: ChatInputCommandInteraction) {
  let selectedVersion = ULMANBOTA_VERSIJA;

  const msg = await intReply(i, {
    embeds: embed(i, selectedVersion),
    components: components(selectedVersion),
    fetchReply: true,
  });

  if (!msg) return;

  buttonHandler(
    i,
    'palidziba',
    msg,
    async int => {
      const { customId, componentType } = int;
      if (customId === 'jaunumi_select' && componentType === ComponentType.StringSelect) {
        selectedVersion = int.values[0] as VersionString;
        return {
          edit: {
            embeds: embed(i, selectedVersion),
            components: components(selectedVersion),
          },
        };
      }
    },
    300000,
  );
}
