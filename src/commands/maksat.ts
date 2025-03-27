import Command from "@/interfaces/Command";
import { ApplicationCommandOptionType } from "discord.js";
import findUser from "@/db/findUser";
import embedTemplate from "@/utils/embeds/embedTemplate";
import latiString from "@/utils/strings/latiString";
import errorEmbed from "@/utils/embeds/errorEmbed";
import addLati from "@/db/addLati";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import commandColors from "@/utils/commandColors";
import setStats from "@/db/stats/setStats";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import addXp from "@/db/addXp";
import addSpecialItems from "@/db/addSpecialItems";
import editItemAttribute from "@/db/editItemAttribute";

const maksat: Command = {
  description: () =>
    "Pārskaitīt citam lietotājam latus\n" +
    `Maksājot naudu citam lietotājam ir arī jāmaksā nodoklis - **10%**\n` +
    "Maksāšanas nodokli ir iespējams samazināt sasniedzot noteiktus līmeņus\n" +
    "Savu maksāšanas nodokli var apskatīt ar komandu `/profils`",
  color: commandColors.maksat,
  data: {
    name: "maksat",
    description: "Pārskaitīt citam lietotājam latus",
    options: [
      {
        name: "lietotājs",
        description: "Lietotājs kam maksāt",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "latu_daudzums",
        description: "Cik latus vēlies samaksāt",
        type: ApplicationCommandOptionType.Integer,
        min_value: 1,
        required: true,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser("lietotājs")!;
    const latiToAdd = i.options.getInteger("latu_daudzums")!;

    const userId = i.user.id;
    const guildId = i.guildId!;

    if (target.id === i.user.id) {
      return intReply(i, ephemeralReply("Tu nevari maksāt sev"));
    }

    if (target.id === i.client.user?.id) {
      return intReply(i, ephemeralReply("Tu nevari maksāt Valsts bankai"));
    }

    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const hasJuridisks = user.status.juridisks > Date.now();

    const totalTax = hasJuridisks ? 0 : Math.floor(latiToAdd * user.payTax) || 1;
    const totalToPay = latiToAdd + totalTax;

    // nepietiek lati
    if (user.lati < totalToPay) {
      const maxPay = Math.floor((1 / (1 + user.payTax)) * user.lati);

      return intReply(
        i,
        ephemeralReply(
          `Tu nevari maksāt **${latiToAdd}** + ` +
            `**${totalTax}** (${Math.floor(user.payTax * 100)}% nodoklis) = ` +
            `**${latiString(totalToPay, true)}**\n` +
            `Tev ir **${latiString(user.lati)}**` +
            (user.lati > 1 ? `\n\nLielākā summa ko tu vari vari maksāt ir **${latiString(maxPay)}**` : ""),
        ),
      );
    }

    const { ok, values } = await mongoTransaction((session) => {
      const arr = [
        () => addLati(userId, guildId, -totalToPay, session),
        () => addLati(target.id, guildId, latiToAdd, session),
        () => setStats(target.id, guildId, { receivedLati: latiToAdd }, session),
        () => setStats(userId, guildId, { paidLati: latiToAdd, taxPaid: totalTax }, session),
      ] as const;

      // @ts-expect-error
      if (!hasJuridisks) arr.push(() => addLati(i.client.user!.id, guildId, totalTax, session));

      return arr;
    });

    if (!ok) return intReply(i, errorEmbed);

    const [resUser, targetUser] = values;

    intReply(
      i,
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description:
          `Tu samaksāji <@${target.id}> **${latiString(latiToAdd, true)}**\n` +
          `Nodoklis: ` +
          (hasJuridisks ? "0 lati (juridiska persona)" : `${latiString(totalTax)} (${Math.floor(user.payTax * 100)}%)`),
        color: this.color,
        fields: [
          {
            name: "Tev palika",
            value: latiString(resUser.lati),
            inline: true,
          },
          {
            name: "Tagad viņam ir",
            value: latiString(targetUser.lati),
            inline: true,
          },
        ],
      }),
    );
  },
};

export default maksat;
