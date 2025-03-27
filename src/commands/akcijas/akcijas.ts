import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
} from "discord.js";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import errorEmbed from "@/utils/embeds/errorEmbed";
import latiString from "@/utils/strings/latiString";
import AkcijaType from "@/types/AkcijaType";
import Command from "@/types/Command";
import Akcija from "@/schemas/Akcija";
import intReply from "@/utils/intReply";
import akcijasList, { AkcijaChartTimes, AkcijaId } from "@/commands/akcijas/akcijasList";

const chartTimes: AkcijaChartTimes[] = ["2h", "8h", "24h", "7d"];

const akcijaNameData: Exclude<
  ApplicationCommandOptionData,
  ApplicationCommandSubGroupData | ApplicationCommandSubCommandData
> = {
  name: "nosaukums",
  description: "Akcijas nosaukums",
  type: ApplicationCommandOptionType.String,
  required: true,
  choices: Object.entries(akcijasList).map(([key, v]) => ({ name: v.name, value: key })),
};

const akcijas: Command = {
  description: () => "Akcijas",
  color: commandColors.maks,
  data: {
    name: "akcijas",
    description: "Griezt akciju aparātu",
    options: [
      {
        name: "info",
        description: "Informācija par visām akcijām",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "grafiks",
        description: "Apskatīt akcijas grafiku",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          akcijaNameData,
          {
            name: "laiks",
            description: "Cik sens būs grafiks",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: chartTimes.map((t) => ({ name: t, value: t })),
          },
        ],
      },
      {
        name: "pirkt",
        description: "Pirkt akciju",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          akcijaNameData,
          {
            name: "latu_daudzums",
            description: "Cik latus investēt šajā akcijā",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 100,
          },
        ],
      },

      {
        name: "pārdot",
        description: "Pārdot akciju",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          akcijaNameData,
          {
            name: "latu_daudzums",
            description: "Cik latus investēt šajā akcijā",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 100,
          },
        ],
      },
    ],
  },
  async run(i) {
    const currTime = 1675977240;

    switch (i.options.getSubcommand()) {
      case "info": {
        const fetchedAkcijas = await Akcija.find({ time: currTime });
        if (!fetchedAkcijas || !fetchedAkcijas.length) return intReply(i, errorEmbed);

        return intReply(
          i,
          mainEmbed({
            i,
            title: "Visas Akcijas",
            fields: Object.entries(akcijasList).map(([key, { name }]) => {
              const { price } = fetchedAkcijas.find((akcija) => akcija.akcijaId === key) as AkcijaType;
              return {
                name: `${name} @ ${(Math.floor(price * 100) / 100).toFixed(2)} lati`,
                value: `Pēdējās 24h: `,
                inline: false,
              };
            }),
          }),
        );
      }
      case "grafiks": {
        const akcijaId = i.options.getString("nosaukums") as AkcijaId;
        const selectedTime = i.options.getString("laiks") as AkcijaChartTimes;

        const foundAkcija = await Akcija.findOne({ time: currTime, akcijaId });
        if (!foundAkcija) return intReply(i, errorEmbed);

        const { name, color } = akcijasList[akcijaId];

        return intReply(
          i,
          mainEmbed({
            i,
            title: `Akcijas grafiks - ${name} (${selectedTime})`,
            color,
            image: foundAkcija.imgUrls[selectedTime],
          }),
        );
      }
    }
  },
};

export default akcijas;
