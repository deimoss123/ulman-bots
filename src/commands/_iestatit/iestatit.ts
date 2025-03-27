import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import embedTemplate from '@/embeds/embedTemplate';
import Command from '@/interfaces/Command';
import { Dialogs } from '@/utils/Dialogs';
import intReply from '@/utils/intReply';
import errorEmbed from '@/embeds/errorEmbed';

type State = {
  text: string;
  count: number;
};

const enum ComponentId {
  Skaitit = 'iestatit_skaitit',
  Tests = 'iestatit_testa_poga',
}

function view(state: State, i: BaseInteraction) {
  return embedTemplate({
    i,
    description: `${state.text}\n${state.count}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(ComponentId.Skaitit).setLabel('+1').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(ComponentId.Tests).setLabel('Tests').setStyle(ButtonStyle.Primary),
      ),
    ],
  });
}

const iestatit: Command = {
  devOnly: true,
  description: () => 'Kruķīt lietotāja īpašības (testēšanai)',
  color: 0xffffff,
  data: {
    name: 'iestatit',
    description: 'Kruķīt lietotāja īpašības (testēšanai)',
  },
  async run(i) {
    const initialState: State = {
      text: 'noklusējuma',
      count: 0,
    };

    const dialogs = new Dialogs(i, initialState, view, 'iestatit');

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async int => {
      console.log('click');
      if (int.componentType !== ComponentType.Button) return;

      if (int.customId === ComponentId.Skaitit) {
        dialogs.state.count++;
        return { update: true };
      }

      if (int.customId === ComponentId.Tests) {
        //
        return;
      }
    });
  },
};

export default iestatit;
