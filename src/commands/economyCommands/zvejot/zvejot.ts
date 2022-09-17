import { CommandInteraction, ComponentType, EmbedBuilder, InteractionType } from 'discord.js';
import findUser from '../../../economy/findUser';
import setFishing from '../../../economy/setFishing';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import { UserFishing } from '../../../interfaces/UserProfile';
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
      components: zvejotComponents(false, selectedFishingRod, user),
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
                components: zvejotComponents(false, selectedFishingRodId, user),
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

            // TODO: noņemt makšķeri no inv
            const userAfter = await setFishing(userId, guildId, {
              selectedRod: rod.name,
              usesLeft: rod.attributes.durability!,
            });
            if (!userAfter) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, this.color, userAfter),
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
