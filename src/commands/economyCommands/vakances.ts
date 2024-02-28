import Command from '../../interfaces/Command';
import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
} from 'discord.js';
import commandColors from '../../embeds/commandColors';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import embedTemplate from '../../embeds/embedTemplate';
import intReply from '../../utils/intReply';
import { Dialogs } from '../../utils/Dialogs';
import UserProfile from '../../interfaces/UserProfile';
import smallEmbed from '../../embeds/smallEmbed';
import setJobPosition from '../../economy/setJobPosition';

interface JobPosData {
  name: string;
  description: string;
  emoji: string;
  minLevel: number;
}

export const JobPositions: Record<string, JobPosData> = {
  setnieks: {
    name: 'Sētnieks',
    description: 'Tīrīt Latvijas netīrās ietves',
    emoji: '<:setnieks:1009557051455848528>',
    minLevel: 0,
  },
  veikala_darbinieks: {
    name: 'Veikala darbinieks',
    description: 'Strādāt pārtikas veikalā un nožēlot dzīvi',
    emoji: '<:veikala_darbinieks:1009557052282118155>',
    minLevel: 10,
  },
  automehanikis: {
    name: 'Automehāniķis',
    description: 'Labot mašīnas un nožēlot savu dzīvi dubultā',
    emoji: '<:automehanikis:1199705677338251324>',
    minLevel: 20,
  },
  // velo_labotajs: {
  //   name: 'Velosipēdu labotājs',
  //   description: 'Labot padomju laiku velosipēdus',
  //   emojiId: '1009557053741748324',
  //   minLevel: 20,
  // },
  // it_specialists: {
  //   name: 'IT speciālists',
  //   description: 'Labot printerus un grozīt aparātus',
  //   emojiId: '1009557050222727260',
  //   minLevel: 30,
  // },
};

type State = {
  user: UserProfile;
  chosenJob: string;
  currentJob: string | null;
};

function view({ user, chosenJob, currentJob }: State, i: BaseInteraction) {
  const options: SelectMenuComponentOptionData[] = Object.entries(JobPositions)
    .filter(([key, value]) => key !== currentJob && user.level >= value.minLevel)
    .map(([key, value]) => ({
      label: value.name,
      emoji: value.emoji,
      value: key,
      default: key === chosenJob,
    }));

  return embedTemplate({
    i,
    title: 'Vakances',
    color: commandColors.vakances,
    description: `Pašreizējā profesija: **${
      currentJob ? `${JobPositions[currentJob]!.emoji} ${JobPositions[currentJob]!.name}` : 'Bezdarbnieks'
    }**`,
    fields: Object.entries(JobPositions).map(([_key, vakance]) => ({
      name: `${vakance.emoji} ${vakance.name} | ${vakance.minLevel}. līmenis`,
      value: vakance.description,
      inline: false,
    })),
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('vakances_select')
          .setPlaceholder('Izvēlies vakanci')
          .setDisabled(!options.length)
          .addOptions(options.length ? options : [{ label: '-', value: '-' }]),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('vakances_button')
          .setLabel('Mainīt profesiju')
          .setStyle(chosenJob ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(!chosenJob),
      ),
    ],
  });
}

const vakances: Command = {
  description:
    'Apskatīt visas pieejamās darbu pozīcijas\n' +
    'Darba pozīcija ietekmē strādāšanu (komanda `/stradat`)\n' +
    'Pozīciju var nomainīt jebkurā brīdī',
  color: commandColors.vakances,
  data: {
    name: 'vakances',
    description: 'Apskatīties pieejamās darba vakances',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    let currentJob: string | null = null;
    if (user.jobPosition && JobPositions[user.jobPosition]) {
      currentJob = user.jobPosition;
    }

    const defaultState: State = { user, chosenJob: '', currentJob };

    const dialogs = new Dialogs(i, defaultState, view, 'vakances', { time: 30000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async int => {
      const { customId, componentType } = int;

      if (customId === 'vakances_select' && componentType === ComponentType.StringSelect) {
        dialogs.state.chosenJob = int.values[0];
        return { update: true };
      }

      if (customId === 'vakances_button' && componentType === ComponentType.Button) {
        if (!dialogs.state.chosenJob) return;

        await setJobPosition(userId, guildId, dialogs.state.chosenJob);

        const newJob = JobPositions[dialogs.state.chosenJob]!;

        intReply(
          int,
          smallEmbed(`Tu nomainīji profesiju uz ${newJob.emoji} **${newJob.name}**`, commandColors.vakances),
        );

        return { edit: true, end: true };
      }
    });
  },
};

export default vakances;
