import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import itemString from '../../../embeds/helpers/itemString';
import embedTemplate from '../../../embeds/embedTemplate';
import addItems from '../../../economy/addItems';
import commandColors from '../../../embeds/commandColors';
import iedotAutocomplete from './iedotAutocomplete';
import itemList from '../../../items/itemList';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import latiString from '../../../embeds/helpers/latiString';
import addLati from '../../../economy/addLati';
import iedotRunSpecial, { noInvSpaceEmbed } from './iedotRunSpecial';
import Item from '../../../interfaces/Item';
import UserProfile from '../../../interfaces/UserProfile';
import setStats from '../../../economy/stats/setStats';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';

export function cantPayTaxEmbed(itemToGive: Item, amountToGive: number, totalTax: number, user: UserProfile) {
  return ephemeralReply(
    `Tev nepietiek naudas lai samaksātu iedošanas nodokli (${itemString(itemToGive, amountToGive)})\n` +
      `Nodoklis ko maksāt - **${latiString(totalTax)}** ` +
      `(${Math.floor(user.giveTax * 100)}% no mantu kopējās vērtības)\n` +
      `Tev ir ${latiString(user.lati)}`
  );
}

const iedot: Command = {
  description:
    'Iedot kādam lietotājam kādu no savām mantām (vai vairākas)\n\n' +
    '__**Par nodokli:**__\n' +
    'Lai dotu mantas ir jāmaksā nodoklis - **15%** no dodamo mantu vērtības\n' +
    'Sasniedzot noteiktu līmeņus iedošanas nodoklis samazināsies\n' +
    'Savu pašreizējo nodokli var apskatīt ar komandu `/profils`\n\n' +
    '__**Par mantu daudzumu:**__\n' +
    'Mantu daudzums nav jāievada ja vēlies iedot tikai 1 mantu\n' +
    'Ja daudzums ko dot būs ievadīts lielāks nekā tas ir tavā inventārā, tad tiks iedotas visas noteiktās mantas\n' +
    '**Piemērs:** tev ir 14 virves, tu ievadi 99 daudzumu, tiks iedotas 14 virves\n\n' +
    'Atribūtu mantām iedošanas daudzums nav jāievada, jo tām ir atsevišķs dialogs lai izvēletos kuras tieši tu vēlies iedot',
  color: commandColors.iedot,
  data: {
    name: 'iedot',
    description: 'Iedot citam lietotājam kādu lietu',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam iedot',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'nosaukums',
        description: 'Lieta ko vēlies iedot',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: 'daudzums',
        description: 'Cik lietas daudz iedot',
        type: ApplicationCommandOptionType.Integer,
        min_value: 1,
      },
    ],
  },
  autocomplete: iedotAutocomplete,
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const itemToGiveKey = i.options.getString('nosaukums')!;
    let amountToGive = i.options.getInteger('daudzums') ?? 1;

    const userId = i.user.id;
    const guildId = i.guildId!;

    if (target.id === userId) {
      return i.reply(ephemeralReply('Tu nevari iedot sev'));
    }

    if (target.id === i.client.user?.id) {
      return i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
    }

    const itemToGive = itemList[itemToGiveKey];
    if (!itemToGive) return i.reply(wrongKeyEmbed);

    const [user, targetUser] = await Promise.all([findUser(userId, guildId), findUser(target.id, guildId)]);
    if (!user || !targetUser) return i.reply(errorEmbed);

    const { items, specialItems, status } = user;
    const hasJuridisks = status.juridisks > Date.now();

    if (itemToGive.attributes) {
      const specialItemInv = specialItems.filter(({ name }) => name === itemToGiveKey);
      if (!specialItemInv.length) {
        return i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
      }
      return iedotRunSpecial(i, user, targetUser, itemToGiveKey, specialItemInv, hasJuridisks);
    }

    const itemInInv = items.find(({ name }) => name === itemToGiveKey);
    if (!itemInInv) {
      return i.reply(ephemeralReply(`Tavā inventārā nav ${itemString(itemToGive)}`));
    }

    if (itemInInv.amount < amountToGive) {
      amountToGive = itemInInv.amount;
    }

    const totalTax = hasJuridisks ? 0 : Math.floor(itemToGive.value * amountToGive * user.giveTax) || 1;

    if (user.lati < totalTax) {
      return i.reply(cantPayTaxEmbed(itemToGive, amountToGive, totalTax, user));
    }

    if (amountToGive > countFreeInvSlots(targetUser)) {
      return i.reply(noInvSpaceEmbed(targetUser, itemToGive, amountToGive));
    }

    await Promise.all([
      addItems(target.id, guildId, { [itemToGiveKey]: amountToGive }),
      addItems(userId, guildId, { [itemToGiveKey]: -amountToGive }),
      setStats(target.id, guildId, { itemsReceived: amountToGive }),
      setStats(userId, guildId, { itemsGiven: amountToGive, taxPaid: totalTax }),
    ]);

    if (!hasJuridisks) {
      await Promise.all([addLati(userId, guildId, -totalTax), addLati(i.client.user!.id, guildId, totalTax)]);
    }

    const targetUserAfter = await findUser(target.id, guildId);
    if (!targetUserAfter) return i.reply(errorEmbed);

    const targetUserItem = targetUserAfter.items.find(({ name }) => name === itemToGiveKey)!;

    await i.reply(
      embedTemplate({
        i,
        content: `<@${target.id}>`,
        description:
          `Nodoklis: ${latiString(totalTax, false, true)} ` +
          (hasJuridisks
            ? '(juridiska persona)'
            : `(${Math.floor(user.giveTax * 100)}% no iedoto mantu kopējās vērtības)`) +
          `\n<@${target.id}> tu iedevi: ${itemString(itemToGive, amountToGive, true)}`,
        color: this.color,
        fields: [
          {
            name: 'Tev palika',
            value: itemString(itemToGive, itemInInv.amount - amountToGive),
            inline: true,
          },
          {
            name: 'Tagad viņam ir',
            value: itemString(itemToGive, targetUserItem.amount),
            inline: true,
          },
        ],
      })
    );
  },
};

export default iedot;
