import Command from "@/types/Command";
import { ApplicationCommandOptionType } from "discord.js";
import findUser from "@/db/findUser";
import mainEmbed from "@/utils/embeds/mainEmbed";
import errorEmbed from "@/utils/embeds/errorEmbed";
import latiString from "@/utils/strings/latiString";
import userString from "@/utils/strings/userString";
import commandColors from "@/utils/commandColors";
import intReply from "@/utils/intReply";

const maks: Command = {
  description: () => "Apskatīties savu vai kāda lietotāja maku (latu daudzumu)",
  color: commandColors.maks,
  data: {
    name: "maks",
    description: "Apskatīties savu vai kāda lietotāja maku (latu daudzumu)",
    options: [
      {
        name: "lietotājs",
        description: "Lietotājs kam apskatīt maku",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser("lietotājs") ?? i.user;

    const user = await findUser(target.id, i.guildId!);
    if (!user) return intReply(i, errorEmbed);

    let targetText = "Tev";
    if (target.id === i.client.user?.id) targetText = "Valsts bankai";
    else if (target.id !== i.user.id) targetText = `${userString(target)}`;

    intReply(
      i,
      mainEmbed({
        i,
        title: "Maks",
        description: `${targetText} ir ${latiString(user.lati, false, true)}`,
        color: this.color,
      }),
    );
  },
};

export default maks;
