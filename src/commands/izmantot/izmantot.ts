import Command from "@/types/Command";
import commandColors from "@/utils/commandColors";
import { ApplicationCommandOptionType } from "discord.js";
import izmantotRun from "@/commands/izmantot/izmantotRun";
import izmantotAutocomplete from "@/commands/izmantot/izmantotAutocomplete";
import itemList from "@/utils/itemList";
import wrongKeyEmbed from "@/utils/embeds/wrongKeyEmbed";
import { UsableItem } from "@/types/Item";
import intReply from "@/utils/intReply";

const izmantot: Command = {
  description: () =>
    "Izmantot kādu (izmantojamu) mantu no inventāra\n\n" +
    "Ja vēlies uzzināt ko dara kāda noteikta manta izmanto komandu `/info`",
  color: commandColors.izmantot,
  autocomplete: izmantotAutocomplete,
  data: {
    name: "izmantot",
    description: "Izmantot kādu mantu no inventāra",
    options: [
      {
        name: "nosaukums",
        description: "Manta ko izmantot",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  async run(i) {
    const itemToUseKey = i.options.getString("nosaukums")!;

    const itemToUse = itemList[itemToUseKey] as UsableItem;
    if (!itemToUse) return intReply(i, wrongKeyEmbed);

    izmantotRun(i, itemToUseKey);
  },
};

export default izmantot;
