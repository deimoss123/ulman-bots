import { bold, ComponentType, EmbedBuilder } from 'discord.js';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import addSpecialItems from '../../../economy/addSpecialItems';
import addXp from '../../../economy/addXp';
import findUser from '../../../economy/findUser';
import removeItemsById from '../../../economy/removeItemsById';
import setFishing from '../../../economy/setFishing';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import xpAddedEmbed from '../../../embeds/helpers/xpAddedEmbed';
import smallEmbed from '../../../embeds/smallEmbed';
import Command from '../../../interfaces/Command';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../../../items/itemList';
import maksekeresData from './makskeresData';
import syncFishing from './syncFishing';
import zvejotComponents from './zvejotComponents';
import { zvejotEmbed } from './zvejotEmbeds';

export function calcRepairCost(itemKey: ItemKey, usesLeft: number) {
  const price = itemList[itemKey].value * 2;
  if (usesLeft <= 0) return price;

  const { maxDurability } = maksekeresData[itemKey];
  if (usesLeft === maxDurability) return 0;

  return Math.ceil(((maxDurability - usesLeft) / maxDurability) * price);
}

export const ZVEJOT_MIN_LEVEL = 0;

const zvejot: Command = {
  description:
    'Copēt zivis DižLatvijas ūdeņos\n\n' +
    'Lai zvejotu tev ir nepieciešama makšķere, kad esi ieguvis makšķeri izvēlies to ar `/zvejot` komandu un sāc zvejot\n' +
    'Zvejošana notiek automātiski, līdz brīdim kad makšķerei beigsies izturība, vai arī zvejošanas inventārs ir pilns\n' +
    'Zvejošanas ietilpība ir **6**, bet to var palielināt sasniedzot noteiktus līmeņus\n' +
    'Katra nozvejotā manta dod **1** UlmaņPunktu\n\n' +
    'Par katru makšķeri var apskatīt zvejošanas informāciju ar komandu `/info`\n' +
    'Makšķeres ir atribūtu mantas - katrai makšķerei ir izturības atribūts kas ietekmē tās vērtību\n' +
    'Dažas makšķeres ir iespējams salabot par latiem vai nu tās izmantojot ar `/izmantot` komandu, vai arī caur `/zvejot`, kad tā ir izvēlēta zvejošanai',
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

    const userCheckLevel = await findUser(userId, guildId);
    if (!userCheckLevel) return i.reply(errorEmbed);

    if (userCheckLevel.level < ZVEJOT_MIN_LEVEL) {
      return i.reply(
        ephemeralReply(
          `Lai zvejotu tev ir nepieciešams **${ZVEJOT_MIN_LEVEL}**. līmenis\n` +
            'Savu līmeni var apskatīt ar komandu `/profils`'
        )
      );
    }

    const user = await syncFishing(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const msg = await i.reply({
      content: '\u200B',
      embeds: zvejotEmbed(i, user),
      components: zvejotComponents(user, selectedFishingRod),
      fetchReply: true,
    });

    await buttonHandler(
      i,
      'zvejot',
      msg,
      async interaction => {
        switch (interaction.customId) {
          case 'select_fishing_rod': {
            if (interaction.componentType !== ComponentType.SelectMenu) return;
            [selectedFishingRod, selectedFishingRodId] = interaction.values[0].split(' ');

            const user = await findUser(userId, guildId);
            if (!user) return { error: true };

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
              interaction.reply(ephemeralReply('Hmmm, šī maksķere ir maģiski pazudusi no tava inventāra'));
              return { end: true };
            }

            if (!(await removeItemsById(userId, guildId, [selectedFishingRodId]))) {
              return { error: true };
            }

            await setFishing(userId, guildId, {
              selectedRod: rod.name,
              usesLeft: rod.attributes.durability!,
            });

            const userAfter = await syncFishing(userId, guildId, true, true);
            if (!userAfter) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, userAfter),
                components: zvejotComponents(userAfter),
              },
            };
          }
          case 'collect_fish_btn': {
            if (interaction.componentType !== ComponentType.Button) return;
            const user = await syncFishing(userId, guildId);
            if (!user || !user.fishing.caughtFishes) return { error: true };

            const fishesToAdd = user.fishing.caughtFishes;
            const fishCount = Object.values(fishesToAdd).reduce((p, c) => p + c, 0);
            const xpToAdd = fishCount;

            const freeSlots = countFreeInvSlots(user);
            if (freeSlots < fishCount) {
              return {
                edit: {
                  embeds: zvejotEmbed(i, user),
                  components: zvejotComponents(user),
                },
                after: async () => {
                  await interaction.reply(
                    ephemeralReply(
                      `Tev nav vietas inventārā lai savāktu **${fishCount}** mantas no copes\n` +
                        `Tev ir **${freeSlots}** brīvas vietas`
                    )
                  );
                },
              };
            }

            const specialItemsToAdd = Object.entries(fishesToAdd).filter(([name]) => itemList[name].attributes);
            if (specialItemsToAdd.length) {
              for (const [name, amount] of specialItemsToAdd) {
                const checkRes = checkUserSpecialItems(user, name, amount);
                if (!checkRes.valid) {
                  interaction.reply(ephemeralReply(`Tu nevari savāk zveju, jo ${checkRes.reason}`));
                  return { end: true };
                }
              }
            }

            await setFishing(userId, guildId, { caughtFishes: null });
            await addItems(userId, guildId, fishesToAdd);

            await syncFishing(userId, guildId, true);

            const leveledUser = await addXp(userId, guildId, xpToAdd);
            if (!leveledUser) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, leveledUser.user),
                components: zvejotComponents(leveledUser.user),
              },
              after: async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder().setColor(this.color).setFields({
                      name: 'Tu savāci copi:',
                      value: Object.entries(fishesToAdd)
                        .map(([key, amount]) => `> ${itemString(itemList[key], amount, true)}`)
                        .join('\n'),
                    }),
                    xpAddedEmbed(leveledUser, xpToAdd, 'No zvejošanas tu ieguvi'),
                  ],
                });
              },
            };
          }
          case 'remove_fishing_rod': {
            if (interaction.componentType !== ComponentType.Button) return;

            const user = await syncFishing(userId, guildId);
            if (!user) return { error: true };

            const { fishing } = user;
            const { selectedRod, usesLeft } = fishing;

            if (!selectedRod) return { error: true };

            if (!countFreeInvSlots(user)) {
              interaction.reply(ephemeralReply('Tu nevari noņemt maksķeri, jo tev inventārā nav vietas'));
              return { end: true };
            }

            const checkRes = checkUserSpecialItems(user, selectedRod);
            if (!checkRes.valid) {
              interaction.reply(ephemeralReply(`Tu nevari noņemt makšķeri, jo ${checkRes.reason}`));
              return { end: true };
            }

            if (!(await setFishing(userId, guildId, { selectedRod: null, usesLeft: 0, futureFishList: [] }))) {
              return { error: true };
            }

            const specialItemObj = { name: selectedRod, attributes: { durability: usesLeft } };

            const userAfter = await addSpecialItems(userId, guildId, [specialItemObj]);
            if (!userAfter) return { error: true };

            selectedFishingRod = '';
            selectedFishingRodId = '';

            return {
              edit: {
                embeds: zvejotEmbed(i, userAfter),
                components: zvejotComponents(userAfter, selectedFishingRodId),
              },
              after: async () => {
                interaction.reply({
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
          case 'fix_fishing_rod': {
            if (interaction.componentType !== ComponentType.Button) return;
            const user = await syncFishing(userId, guildId);
            if (!user || !user.fishing.selectedRod) return { error: true };

            const selectedRod = user.fishing.selectedRod;

            if (!maksekeresData[selectedRod].repairable) {
              interaction.reply(ephemeralReply(`${itemString(itemList[selectedRod])} nav salabojama`));
              return { doNothing: true };
            }

            const { fishing, lati } = user;

            const repairCost = calcRepairCost(fishing.selectedRod!, fishing.usesLeft);
            if (!repairCost) return { error: true };

            if (lati < repairCost) {
              return {
                edit: {
                  embeds: zvejotEmbed(i, user),
                  components: zvejotComponents(user),
                },
                after: async () => {
                  interaction.reply(
                    ephemeralReply(
                      `Tev nepietiek nauda lai salabotu makšķeri - ${latiString(repairCost, false, true)}\n` +
                        `Tev ir ${latiString(lati, false, true)}`
                    )
                  );
                },
              };
            }

            const { maxDurability } = maksekeresData[fishing.selectedRod!];

            await setFishing(userId, guildId, { usesLeft: maxDurability });
            await addLati(userId, guildId, -repairCost);

            const userAfter = await syncFishing(userId, guildId, true);
            if (!userAfter) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, userAfter),
                components: zvejotComponents(userAfter),
              },
              after: async () => {
                interaction.reply(
                  smallEmbed(
                    `Tu salaboji ${bold(itemString(itemList[fishing.selectedRod!], null, true))} - ` +
                      latiString(repairCost),
                    this.color
                  )
                );
              },
            };
          }
          case 'test_button': {
            if (interaction.componentType !== ComponentType.Button) return;
            const user = await syncFishing(userId, guildId);
            if (!user) return { error: true };

            return {
              edit: {
                embeds: zvejotEmbed(i, user),
                components: zvejotComponents(user),
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

export default zvejot;
