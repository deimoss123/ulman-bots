import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import Command from '../../../interfaces/Command';
import { Dialogs } from '../../../utils/Dialogs';
import intReply from '../../../utils/intReply';
import errorEmbed from '../../../embeds/errorEmbed';

type State = {
  text: string;
  count: number;
};

function view(state: State, i: BaseInteraction) {
  return embedTemplate({
    i,
    description: `${state.text}\n${state.count}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('iestatit-skaitit').setLabel('+1').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('iestatit-testa-poga').setLabel('Tests').setStyle(ButtonStyle.Primary),
      ),
    ],
  });
}

const iestatit: Command = {
  description: 'Kruķīt lietotāja īpašības (testēšanai)',
  color: 0xffffff,
  data: {
    name: 'iestatit',
    description: 'Kruķīt lietotāja īpašības (testēšanai)',
  },
  async run(i) {
    const defaultState: State = {
      text: 'noklusējuma',
      count: 0,
    };

    const dialogs = new Dialogs(i, defaultState, view, 'iestatit');

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async int => {
      console.log('click');
      if (int.componentType !== ComponentType.Button) return;

      if (int.customId === 'iestatit-skaitit') {
        dialogs.state.count++;
        return { update: true };
      }

      if (int.customId === 'iestatit-testa-poga') {
        //
        return;
      }
    });
  },
};

export default iestatit;
