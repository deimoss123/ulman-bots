import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import { getTirgusFilePath } from '../../../items/tirgus/createTirgus';
import * as fs from 'fs';
import { TirgusListings, TIRGUS_COUNT } from '../../../items/tirgus/generateTirgus';
import buttonHandler from '../../../embeds/buttonHandler';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import tirgusEmbed from './tirgusEmbed';
import UserProfile from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import itemList, { ItemCategory, ItemKey } from '../../../items/itemList';
import tirgusComponents from './tirgusComponents';
import { ComponentType } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import smallEmbed from '../../../embeds/smallEmbed';
import countFreeInvSlots from '../../../items/helpers/countFreeInvSlots';
import checkUserSpecialItems from '../../../items/helpers/checkUserSpecialItems';
import setTirgus from '../../../economy/setTirgus';
import midNightStr from '../../../embeds/helpers/midnightStr';

export function calcReqItems({ items, lati }: UserProfile, itemObj: Item) {
  const tirgusPrice = itemObj.tirgusPrice!;
  let hasAll = true;
  if (tirgusPrice.lati && lati < tirgusPrice.lati) hasAll = false;

  const reqItemsInv: Record<ItemKey, number> = {};
  for (const [key, amount] of Object.entries(tirgusPrice.items)) {
    const amountInInv = items.find(i => i.name === key)?.amount ?? 0;
    reqItemsInv[key] = amountInInv;
    if (amountInInv < amount) hasAll = false;
  }

  return {
    items: reqItemsInv,
    hasAll,
  };
}

function getTirgusData() {
  const tirgusData = fs.readFileSync(getTirgusFilePath());
  return JSON.parse(tirgusData as any) as TirgusListings;
}

function getBoughtItems({ tirgus }: UserProfile) {
  const today = new Date().toLocaleDateString('en-GB');
  if (tirgus.lastDayUsed !== today) return [];
  return tirgus.itemsBought;
}

const tirgus: Command = {
  description:
    'Tirgū var nopirkt īpašas mantas, kas nav pieejamas nekur citur (ar retiem izņēmumiem)\n\n' +
    'Atšķirībā no veikala, tirgus preces ir nopērkamas par citām mantām (dažām mantām cenā ir arī lati)\n' +
    'Katrs lietotājs var nopirkt katru no tirgus mantām tikai **VIENU** reizi noteiktā dienā\n' +
    `Katru dienu (plkst. ${midNightStr()}) nejauši tiek izvēlētas **${TIRGUS_COUNT}** mantas kas būs nopērkamas tirgū\n\n` +
    '**Visas tirgū pieejamās mantas:**\n>>> ' +
    Object.values(itemList)
      .filter(i => i.categories.includes(ItemCategory.TIRGUS))
      .map(i => itemString(i))
      .join('\n'),
  color: commandColors.veikals,
  data: {
    name: 'tirgus',
    description: 'Apskatīt šodienas tirgus preces',
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const tirgusListings = getTirgusData();
    if (!tirgusListings) return i.reply(errorEmbed);

    let selectedListing: string;
    const itemsBought = getBoughtItems(user);

    const msg = await i.reply({
      content: '\u200B',
      embeds: tirgusEmbed(i, tirgusListings, user, itemsBought),
      components: tirgusComponents(tirgusListings, user, itemsBought),
      fetchReply: true,
    });

    buttonHandler(i, 'tirgus', msg, async int => {
      if (int.customId === 'tirgus_select_menu') {
        if (int.componentType !== ComponentType.SelectMenu) return;
        selectedListing = int.values[0];

        const newUser = await findUser(userId, guildId);
        if (!newUser) return { error: true };

        const newListings = getTirgusData();
        if (!newListings) return { error: true };

        const itemsBought = getBoughtItems(newUser);

        return {
          edit: {
            embeds: tirgusEmbed(i, newListings, newUser, itemsBought),
            components: tirgusComponents(newListings, newUser, itemsBought, selectedListing),
          },
        };
      }
      if (int.customId === 'tirgus_pirkt') {
        if (int.componentType !== ComponentType.Button) return;
        if (!selectedListing) return;

        const itemObj = itemList[selectedListing];

        const newUser = await findUser(userId, guildId);
        if (!newUser) return { error: true };

        const newListings = getTirgusData();
        if (!newListings) return { error: true };

        const itemsBought = getBoughtItems(newUser);
        if (itemsBought.includes(selectedListing)) {
          int.reply(
            ephemeralReply(`Tu nevari nopirkt **${itemString(itemObj, null, true)}**, jo tu jau šodien to esi nopircis`)
          );
          return { doNothing: true };
        }

        if (!newListings.includes(selectedListing)) {
          return {
            end: true,
            after: async () => {
              int.reply('Kļūda: šī manta vairs nepārdodas tirgū');
            },
          };
        }

        const { hasAll } = calcReqItems(newUser, itemObj);
        if (!hasAll) {
          return {
            end: true,
            after: async () => {
              int.reply(ephemeralReply(`Tu nevari atļauties nopirkt **${itemString(itemObj, 1, true)}**`));
            },
          };
        }

        if (!countFreeInvSlots(newUser)) {
          return {
            end: true,
            after: async () => {
              int.reply(
                ephemeralReply(`Tu nevari nopirkt **${itemString(itemObj, 1, true)}**, jo tev ir pilns inventārs`)
              );
            },
          };
        }

        if (itemObj.attributes) {
          const specialRes = checkUserSpecialItems(newUser, selectedListing);
          if (!specialRes.valid) {
            return {
              end: true,
              after: async () => {
                int.reply(
                  ephemeralReply(`Tu nevari nopirkt **${itemString(itemObj, 1, true)}**, jo ${specialRes.reason}`)
                );
              },
            };
          }
        }

        const itemsToRemove = Object.fromEntries(
          Object.entries(itemObj.tirgusPrice!.items).map(([key, amount]) => [key, -amount])
        );

        const promises = [
          addItems(userId, guildId, { ...itemsToRemove, [selectedListing]: 1 }),
          setTirgus(userId, guildId, selectedListing),
        ];
        if (itemObj.tirgusPrice?.lati) promises.push(addLati(userId, guildId, -itemObj.tirgusPrice.lati));

        const res = await Promise.all(promises);
        const userAfter = await findUser(userId, guildId);
        if (res.includes(undefined) || !userAfter) return { error: true };

        const itemsBoughtAfter = getBoughtItems(userAfter);

        return {
          edit: {
            embeds: tirgusEmbed(i, newListings, userAfter, itemsBoughtAfter),
            components: tirgusComponents(newListings, userAfter, itemsBought),
          },
          after: async () => {
            int.reply(smallEmbed(`Tu nopirki **${itemString(itemObj, 1, true)}**`, this.color));
          },
        };
      }
    });
  },
};

export default tirgus;
