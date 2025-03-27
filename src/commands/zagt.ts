import { ApplicationCommandOptionType } from "discord.js";
import addLati from "@/db/addLati";
import addTimeCooldown from "@/db/addTimeCooldown";
import editItemAttribute from "@/db/editItemAttribute";
import findUser from "@/db/findUser";
import setStats from "@/db/stats/setStats";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import { displayAttributes } from "@/utils/strings/displayAttributes";
import itemString from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import Command from "@/types/Command";
import itemList from "@/utils/itemList";
import intReply from "@/utils/intReply";
import { statusList } from "@/commands/profils";
import emoji from "@/utils/emoji";

const ZAGT_MIN_LATI = 100;
const ZAGT_MAX_LATI = 1000;

const BASE_STEAL_CHANCE = 0.35;
const NAZIS_STEAL_CHANCE = 0.6;

const MIN_BANKA_STEAL = 800;
const MAX_BANKA_STEAL = 1500;

const ZAGT_COOLDOWN = 900_000; //15 min

const zagt: Command = {
  description: () =>
    "__**Zagšana no lietotāja**__\n" +
    `Zogot no kāda cita tiek izvēlēta nozagtās naudas summa, kas tiek aprēķināta nejauši\n` +
    `Gan tev, gan lietotājam no kā zodz ir jābūt vismaz **${ZAGT_MIN_LATI}** latiem\n` +
    `Maksimālais latu daudzums ko iespējams nozagt ir **${ZAGT_MAX_LATI}** lati\n\n` +
    `Iespēja nozagt ir ${Math.floor(BASE_STEAL_CHANCE * 100)}% un ` +
    `${Math.floor(NAZIS_STEAL_CHANCE * 100)}% ar "${statusList.laupitajs}" statusu\n` +
    "Ja tev nepaveicās un neizdodas nozagt, tad izrēķinātā nozagtā summa tiks atņemta no tava maka un pievienota lietotājam kuru centies apzagt\n\n" +
    `Zagt nav iespējams, ja tev, vai lietotājam kuru centies apzagt ir "${statusList.aizsargats}" statuss (neattiecas uz bankas apzagšanu)\n\n` +
    "__**Zagšana no Valsts Bankas (UlmaņBota)**__\n" +
    `Lai apzagtu banku, tai ir jābūt vismaz **${MIN_BANKA_STEAL}** latiem, ` +
    `kā arī tavā inventārā ir jābūt **${itemString(itemList.naudas_maiss)}** (tukšs)\n` +
    `No bankas maksimāli var nozagt **${MAX_BANKA_STEAL}** latus\n` +
    `No bankas nozagtā nauda tiks pievienota tukšajam naudas maisam inventārā\n\n` +
    `Zagšanas komandu var izmantot ik \`${millisToReadableTime(ZAGT_COOLDOWN)}\``,
  color: commandColors.zagt,
  cooldown: ZAGT_COOLDOWN,
  data: {
    name: "zagt",
    description: "Zagt no kāda lietotāja, vai Valsts Bankas (UlmaņBota)",
    options: [
      {
        name: "lietotājs",
        description: "Lietotājs kuru apzagt",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },
  async run(i) {
    const guildId = i.guildId!;

    const target = i.options.getUser("lietotājs");
    if (!target) return intReply(i, ephemeralReply("Izvēlies no kā zagt"));

    if (target.id === i.user.id) {
      return intReply(i, ephemeralReply("Tu nevari zagt no sevis"));
    }

    const [user, targetUser] = await Promise.all([findUser(i.user.id, guildId), findUser(target.id, guildId)]);
    if (!user || !targetUser) return intReply(i, errorEmbed);

    const currentTime = Date.now();

    // zagt no valsts bankas
    if (target.id === i.client.user!.id) {
      if (targetUser.lati < MIN_BANKA_STEAL) {
        return intReply(
          i,
          ephemeralReply(`Lai apzagtu Valsts banku, tai ir jābūt vismaz ${latiString(MIN_BANKA_STEAL, false, true)}`),
        );
      }

      const maiss = user.specialItems.find(
        (item) => item.name === "naudas_maiss" && item.attributes.latiCollected === 0,
      );
      if (!maiss) {
        return intReply(
          i,
          ephemeralReply(`Lai apzagtu Valsts banku tev ir nepieciešams tukšs **${itemString(itemList.naudas_maiss)}**`),
        );
      }

      const maxSteal = targetUser.lati > MAX_BANKA_STEAL ? MAX_BANKA_STEAL : targetUser.lati;
      const stolenAmount = Math.floor(Math.random() * (maxSteal - MIN_BANKA_STEAL)) + MIN_BANKA_STEAL;

      const [userAfter, bankaUser] = await Promise.all([
        editItemAttribute(i.user.id, guildId, maiss._id!, { latiCollected: stolenAmount }),
        addLati(i.client.user!.id, guildId, -stolenAmount),
      ]);
      if (!userAfter || !bankaUser) return intReply(i, errorEmbed);

      await addTimeCooldown(i.user.id, guildId, "zagt");
      await setStats(i.user.id, guildId, { stolenFromBanka: stolenAmount });

      return intReply(
        i,
        mainEmbed({
          i,
          color: this.color,
          title: `${emoji("icon_check1")} Zagt no Valsts Bankas`,
          description:
            `No Valsts bankas tu nozagi ${latiString(stolenAmount, true, true)}\n\n` +
            `Tavam inventāram tika pievienots:\n` +
            `**${itemString(itemList.naudas_maiss)}** (${displayAttributes(userAfter.newItem)})`,
          fields: [
            {
              name: "Valsts bankai palika",
              value: latiString(bankaUser.lati),
              inline: true,
            },
          ],
        }),
      );
    }

    if (targetUser.status.aizsargats > currentTime) {
      return intReply(i, ephemeralReply(`Tu nevari zagt kamēr ${target} ir **"${statusList.aizsargats}"** statuss`));
    }

    if (user.status.aizsargats > currentTime) {
      return intReply(i, ephemeralReply(`Tu nevari zagt kamēr tev ir **"${statusList.aizsargats}"** statuss`));
    }

    if (user.lati < ZAGT_MIN_LATI) {
      return intReply(
        i,
        ephemeralReply(
          `Tev vajag vismaz ${latiString(ZAGT_MIN_LATI, true, true)} lai zagtu no kāda\n` +
            `Tev ir ${latiString(user.lati)}`,
        ),
      );
    }

    if (targetUser.lati < ZAGT_MIN_LATI) {
      return intReply(
        i,
        ephemeralReply(
          `${target} vajag vismaz ${latiString(ZAGT_MIN_LATI, true, true)} lai tu varētu no viņa zagt\n` +
            `Viņam ir ${latiString(targetUser.lati)}`,
        ),
      );
    }

    let maxSteal = user.lati > targetUser.lati ? targetUser.lati : user.lati;
    if (maxSteal > ZAGT_MAX_LATI) maxSteal = ZAGT_MAX_LATI;

    const stolenAmount = Math.floor(Math.random() * (maxSteal - ZAGT_MIN_LATI)) + ZAGT_MIN_LATI;

    const hasLaupitajs = user.status.laupitajs > currentTime;
    const stealChance = hasLaupitajs ? NAZIS_STEAL_CHANCE : BASE_STEAL_CHANCE;
    const didSteal = Math.random() < stealChance;

    await addTimeCooldown(i.user.id, guildId, "zagt");

    const [userAfter, targetUserAfter] = await Promise.all([
      addLati(i.user.id, guildId, stolenAmount * (didSteal ? 1 : -1)),
      addLati(target.id, guildId, stolenAmount * (didSteal ? -1 : 1)),
      setStats(i.user.id, guildId, didSteal ? { stolenLati: stolenAmount } : { lostStealingLati: stolenAmount }),
    ]);
    if (!userAfter || !targetUserAfter) return intReply(i, errorEmbed);

    const text = didSteal
      ? `Tev izdevās nozagt ${latiString(stolenAmount, true, true)} no ${target}`
      : `Zogot no ${target} tu pazaudēji ${latiString(stolenAmount, true, true)}`;

    intReply(
      i,
      mainEmbed({
        i,
        color: this.color,
        content: `${target}`,
        title:
          `${didSteal ? emoji("icon_check1") : emoji("icon_cross")} Zagt ` +
          (hasLaupitajs ? `(ar "${statusList.laupitajs}" statusu)` : ""),
        description: text,
        fields: [
          {
            name: "Tev tagad ir",
            value: latiString(userAfter.lati),
            inline: true,
          },
          {
            name: `${target.tag} tagad ir`,
            value: latiString(targetUserAfter.lati),
            inline: true,
          },
        ],
      }),
    );
  },
};

export default zagt;
