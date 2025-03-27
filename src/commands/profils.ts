import Command from "@/interfaces/Command";
import commandColors from "@/utils/commandColors";
import { ApplicationCommandOptionType, codeBlock } from "discord.js";
import findUser from "@/db/findUser";
import errorEmbed from "@/utils/embeds/errorEmbed";
import userString from "@/utils/strings/userString";
import embedTemplate from "@/utils/embeds/embedTemplate";
import levelsList, { MAX_LEVEL } from "@/levelingSystem/levelsList";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import { JobPositions } from "@/commands/vakances";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { UserStatusName } from "@/interfaces/UserProfile";
import intReply from "@/utils/intReply";

export const statusList: Record<UserStatusName, string> = {
  aizsargats: "Aizsargāts",
  laupitajs: "Laupītājs",
  juridisks: "Juridiska persona",
  veiksmigs: "Veiksmīgs",
};

const profils: Command = {
  description: () =>
    "Apskatīties savu vai kāda lietotāja profilu\n" +
    "Profilā ir iespējams redzēt:\n" +
    "- Darba profesiju\n" +
    "- Maksāšanas un iedošanas nodokli\n" +
    "- Līmeni un UlmaņPunktus\n" +
    "- Statusus",
  color: commandColors.profils,
  data: {
    name: "profils",
    description: "Apskatīties savu vai kāda lietotāja profilu",
    options: [
      {
        name: "lietotājs",
        description: "Lietotājs kam apskatīt profilu",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser("lietotājs") ?? i.user;

    const user = await findUser(target.id, i.guildId!);
    if (!user) return intReply(i, errorEmbed);

    if (target.id === i.guild?.members?.me?.id) {
      return intReply(i, ephemeralReply("Tu nevari apskatīt Valsts Bankas profilu"));
    }

    const { level, xp, jobPosition, payTax, giveTax, status } = user;

    const targetText = target.id === i.user.id ? "Tavs" : userString(target);

    const XP_BAR_LENGTH = 20;

    let maxLevelText = "**Sasniegts maksimālais līmenis!**\n";
    let maxLevelEmoji = "🔥";
    let xpText = "";

    let xpBar = "";
    if (level !== MAX_LEVEL) {
      maxLevelText = "";
      maxLevelEmoji = "";
      xpText = `| UlmaņPunkti: ${xp}/${levelsList[level + 1]!.xp}`;

      const filledSlots = "#".repeat(Math.round((XP_BAR_LENGTH / levelsList[user.level + 1].xp) * xp));
      xpBar += filledSlots + "-".repeat(XP_BAR_LENGTH - filledSlots.length);
      xpBar = `**${user.level}** \`[${xpBar}]\` **${user.level + 1}**`;
    }

    const currentTime = Date.now();

    let payTaxText = `**${Math.floor(payTax * 100)}%**`;
    let giveTaxText = `**${Math.floor(giveTax * 100)}%**`;

    if (status.juridisks > currentTime) {
      payTaxText = `~~${Math.floor(payTax * 100)}%~~ **0%**`;
      giveTaxText = `~~${Math.floor(giveTax * 100)}%~~ **0%**`;
    }

    intReply(
      i,
      embedTemplate({
        i,
        color: this.color,
        title: `${targetText} profils`,
        description:
          `Profesija: **${
            jobPosition ? `${JobPositions[jobPosition]!.emoji} ${JobPositions[jobPosition]!.name}` : "Bezdarbnieks"
          }**\n` +
          `Maksāšanas nodoklis: ${payTaxText}\n` +
          `Iedošanas nodoklis: ${giveTaxText}\n\n` +
          `${maxLevelText}Līmenis: **${level}** ${maxLevelEmoji} ${xpText}\n${xpBar}\n\n` +
          "**Statusi: **",
        fields: Object.entries(statusList).map(([key, latName]) => {
          const time = status[key as UserStatusName];

          return {
            name: latName,
            value: codeBlock(time < currentTime ? "-" : millisToReadableTime(time - currentTime)),
            inline: true,
          };
        }),
      }),
    );
  },
};

export default profils;
