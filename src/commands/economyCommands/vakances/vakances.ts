import Command from '../../../interfaces/Command';
import { ChatInputCommandInteraction, ComponentType } from 'discord.js';
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
  emojiId: string;
  minLevel: number;
}

export const JobPositions: Record<string, JobPosData> = {
  setnieks: {
    name: 'Sētnieks',
    description: 'Tīrīt Latvijas netīrās ietves',
    emojiId: '1009557051455848528',
    minLevel: 0,
  },
  veikala_darbinieks: {
    name: 'Veikala darbinieks',
    description: 'Strādāt pārtikas veikalā un nožēlot dzīvi',
    emojiId: '1009557052282118155',
    minLevel: 10,
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
  async run(i: ChatInputCommandInteraction) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const { jobPosition, level } = user;

    let chosenJob = '';

    const msg = await i.reply(
      embedTemplate({
        i,
        title: 'Vakances',
        color: this.color,
        description: `Pašreizējā profesija: **${
          jobPosition
            ? `<:${jobPosition}:${JobPositions[jobPosition]!.emojiId}> ${JobPositions[jobPosition]!.name}`
            : 'Bezdarbnieks'
        }**`,
        fields: [
          ...Object.entries(JobPositions).map(([key, vakance]) => ({
            name: `<:${key}:${vakance.emojiId}> ${vakance.name} | ${vakance.minLevel}. līmenis`,
            value: vakance.description,
            inline: false,
          })),
          {
            name: '\u200b',
            value: '_Papildus darbi tiks pievienoti jau pavisam drīz..._',
            inline: false,
          },
        ],
        components: vakancesComponents(chosenJob, level, jobPosition),
      })
    );

    await buttonHandler(
      i,
      'vakances',
      msg,
      async int => {
        switch (int.customId) {
          case 'vakances_select':
            if (int.componentType !== ComponentType.StringSelect) return;
            chosenJob = int.values[0]!;

            return {
              edit: {
                components: vakancesComponents(chosenJob, level, jobPosition),
              },
            };
          case 'vakances_button':
            if (int.componentType !== ComponentType.Button) return;

            return {
              end: true,
              edit: {
                components: vakancesComponents(chosenJob, level, jobPosition),
              },
              after: async () => {
                await Promise.all([
                  setJobPosition(userId, guildId, chosenJob),
                  int.reply(
                    smallEmbed(
                      `Tu nomainīji profesiju uz ` +
                        `<:${chosenJob}:${JobPositions[chosenJob]!.emojiId}> ` +
                        `**${JobPositions[chosenJob]!.name}**`,
                      this.color
                    )
                  ),
                ]).catch(_ => _);
              },
            };
        }
      },
      60000
    );
  },
};

export default vakances;
