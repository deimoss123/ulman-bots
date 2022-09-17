import { ComponentType, EmbedBuilder } from 'discord.js';
import addSpecialItems from '../../../economy/addSpecialItems';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setFishing from '../../../economy/setFishing';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString from '../../../embeds/helpers/itemString';
import Command from '../../../interfaces/Command';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import itemList from '../../../items/itemList';
import zvejotComponents from './zvejotComponents';
import { zvejotEmbed } from './zvejotEmbeds';

export const ZVEJOT_MIN_LEVEL = 0;

export const zvejot: Command = {
  title: 'Zvejot',
  description: 'Copēt zivis',
  color: commandColors.zvejot,
  data: {
    name: 'zvejot',
    description: 'Copēt zivis DižLatvijas ūdeņos',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    let selectedFishingRod = '';
    let selectedFishingRodId = '';

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    if (user.level < ZVEJOT_MIN_LEVEL) {
      return i.reply(
        ephemeralReply(
          `Lai zvejotu tev ir nepieciešams **${ZVEJOT_MIN_LEVEL}**. līmenis\n` +
            'Savu līmeni var apskatīt ar komandu `/profils`'
        )
      );
    }

    const interactionReply = await i.reply({
      embeds: zvejotEmbed(i, this.color, user),
      components: zvejotComponents(user, selectedFishingRod),
      fetchReply: true,
    });

    await buttonHandler(
      i,
      'zvejot',
      interactionReply,
      async interaction => {
        switch (interaction.customId) {
          case 'select_fishing_rod': {
            if (interaction.componentType !== ComponentType.SelectMenu) return;

            [selectedFishingRod, selectedFishingRodId] = interaction.values[0].split(' ');

            return {
              edit: {
                components: zvejotComponents(user, selectedFishingRodId),
              },
            };
          }
          case 'start_fishing_btn': {
            if (interaction.componentType !== ComponentType.Button || !selectedFishingRod) return;

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

            const rod = user.specialItems.find(item => item._id === selectedFishingRodId);

            if (!rod) {
              await interaction.reply(ephemeralReply('Hmmm, šī maksķere ir maģiski pazudusi no tava inventāra'));
              return { end: true };
            }

            if (!(await removeItemsById(userId, guildId, [selectedFishingRodId]))) {
              return { error: true };
            }

            const userAfter = await setFishing(userId, guildId, {
              selectedRod: rod.name,
              usesLeft: rod.attributes.durability!,
            });
            if (!userAfter) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, this.color, userAfter),
                components: zvejotComponents(userAfter),
              },
            };
          }
          case 'remove_fishing_rod': {
            if (interaction.componentType !== ComponentType.Button) return;

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

            const { fishing } = user;
            const { selectedRod, usesLeft } = fishing;

            if (!selectedRod) return { error: true };

            if (countFreeInvSlots(user) < 5) {
              await interaction.reply(
                ephemeralReply(
                  'Tu nevari noņemt maksķeri, jo tev inventārā nav vietas\nTev vajag vismaz **5** brīvas vietas'
                )
              );
              return { end: true };
            }

            if (!(await setFishing(userId, guildId, { selectedRod: null, usesLeft: 0 }))) {
              return { error: true };
            }

            const specialItemObj = { name: selectedRod, attributes: { durability: usesLeft } };

            const userAfter = await addSpecialItems(userId, guildId, [specialItemObj]);
            if (!userAfter) return { error: true };

            selectedFishingRod = '';
            selectedFishingRodId = '';

            return {
              edit: {
                embeds: zvejotEmbed(i, this.color, userAfter),
                components: zvejotComponents(userAfter, selectedFishingRodId),
              },
              after: async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setDescription('Tev inventāram tikai pievienota:')
                      .setFields({
                        name: itemString(itemList[selectedRod]),
                        value: displayAttributes(specialItemObj),
                      })
                      .setColor(this.color),
                  ],
                });
              },
            };
          }
        }
        return;
      },
      60000
    );
  },
};
