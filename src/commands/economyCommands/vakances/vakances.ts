import Command from '../../../interfaces/Command';
import { CommandInteraction, Message } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import embedTemplate from '../../../embeds/embedTemplate';
import vakancesComponents from './vakancesComponents';
import buttonHandler from '../../../embeds/buttonHandler';
import setJobPosition from '../../../economy/setJobPosition';
import smallEmbed from '../../../embeds/smallEmbed';

interface JobPosData {
  name: string;
  description: string;
  minLevel: number;
}

export const JobPositions: Record<string, JobPosData> = {
  setnieks: {
    name: 'Sētnieks',
    description: 'Tīrīt Latvijas netīrās ietves',
    minLevel: 0,
  },
  veikala_darbinieks: {
    name: 'Veikala darbinieks',
    description: 'Strādāt pārtikas veikalā un nožēlot dzīvi',
    minLevel: 2,
  },
  it_specialists: {
    name: 'IT speciālists',
    description: 'Labot printerus un grozīt aparātus',
    minLevel: 5,
  },
  velo_labotajs: {
    name: 'Velosipēdu labotājs',
    description: 'Labot padomju laiku velosipēdus',
    minLevel: 9,
  },
};

const vakances: Command = {
  title: 'Vakances',
  description: 'Apskatīties pieejamās darba vakances',
  color: commandColors.vakances,
  config: {
    name: 'vakances',
    description: 'Apskatīties pieejamās darba vakances',
  },
  async run(i: CommandInteraction) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const { jobPosition, xp } = user;

    let chosenJob = '';

    const interactionReply = await i.reply(
      embedTemplate({
        i,
        title: 'Vakances',
        color: this.color,
        description: `Pašreizējā profesija: **${
          jobPosition ? JobPositions[jobPosition].name : 'nav'
        }**`,
        fields: Object.values(JobPositions).map((vakance) => ({
          name: `${vakance.name} | ${vakance.minLevel}. līmenis`,
          value: vakance.description,
          inline: false,
        })),
        components: vakancesComponents(chosenJob, xp, jobPosition),
      })
    );

    await buttonHandler(
      i,
      'vakances',
      interactionReply! as Message,
      async (componentInteraction) => {
        switch (componentInteraction.customId) {
          case 'vakances_select':
            if (componentInteraction.componentType !== 'SELECT_MENU') return;
            chosenJob = componentInteraction.values[0];

            return {
              edit: {
                components: vakancesComponents(chosenJob, xp, jobPosition),
              },
            };
          case 'vakances_button':
            if (componentInteraction.componentType !== 'BUTTON') return;

            return {
              end: true,
              edit: {
                components: vakancesComponents(chosenJob, xp, jobPosition),
              },
              after: async () => {
                await Promise.all([
                  setJobPosition(i.user.id, chosenJob),
                  componentInteraction.reply(
                    smallEmbed(
                      `Tu nomainīji profesiju uz **${JobPositions[chosenJob].name}**`,
                      this.color
                    )
                  ),
                ]).catch((_) => _);
              },
            };
        }
      },
      60000
    );
  },
};

export default vakances;
