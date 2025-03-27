import { ApplicationCommandOptionType } from "discord.js";
import commandColors from "@/utils/commandColors";
import wrongKeyEmbed from "@/utils/embeds/wrongKeyEmbed";
import Command from "@/interfaces/Command";
import itemList from "@/items/itemList";
import intReply from "@/utils/intReply";
import allItemAutocomplete from "@/commands/info/allItemAutocomplete";
import kamPiederRun from "@/commands/kamPieder/kamPiederRun";

const kamPieder: Command = {
  description: () => "Redzēt kuriem lietotājiem pieder noteikta manta",
  color: commandColors.info,
  data: {
    name: "kam-pieder",
    description: "Redzēt kuriem lietotājiem pieder noteikta manta",
    options: [
      {
        name: "nosaukums",
        description: "Mantas nosaukums",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  autocomplete: allItemAutocomplete("👁️"),
  async run(i) {
    const itemKey = i.options.getString("nosaukums")!;

    if (!itemList[itemKey]) {
      return intReply(i, wrongKeyEmbed);
    }

    kamPiederRun(i, itemKey);
  },
};

export default kamPieder;
