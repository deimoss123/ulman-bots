import { ApplicationCommandOptionType } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import Akcija from '../../../schemas/Akcija';
import intReply from '../../../utils/intReply';
import akcijasList, { AkcijaChartTimes, AkcijaId } from './akcijasList';

const chartTimes: AkcijaChartTimes[] = ['2h', '8h', '24h', '7d'];

const akcijas: Command = {
  description: 'Akcijas',
  color: commandColors.maks,
  data: {
    name: 'akcijas',
    description: 'Griezt akciju aparātu',
    options: [
      {
        name: 'grafiks',
        description: 'Apskatīt akcijas grafiku',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'nosaukums',
            description: 'Akcijas nosaukums',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Object.entries(akcijasList).map(([key, v]) => ({ name: v.name, value: key })),
          },
          {
            name: 'laiks',
            description: 'Cik sens būs grafiks',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: chartTimes.map(t => ({ name: t, value: t })),
          },
        ],
      },
    ],
  },
  async run(i) {
    const currTime = 1675977240;

    switch (i.options.getSubcommand()) {
      case 'grafiks': {
        const akcijaId = i.options.getString('nosaukums') as AkcijaId;
        const selectedTime = i.options.getString('laiks') as AkcijaChartTimes;

        const foundAkcija = await Akcija.findOne({ time: currTime, akcijaId });
        if (!foundAkcija) return intReply(i, errorEmbed);

        console.log(foundAkcija);

        return intReply(i, embedTemplate({ i, image: foundAkcija.imgUrls[selectedTime] }));
      }
    }

    intReply(i, 'akcijas');
  },
};

export default akcijas;
