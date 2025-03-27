import commandColors from "@/utils/commandColors";
import Command from "@/types/Command";
import buttonHandler from "@/utils/buttonHandler";
import findUser from "@/db/findUser";
import errorEmbed from "@/utils/embeds/errorEmbed";
import tirgusEmbed from "@/commands/tirgus/tirgusEmbed";
import UserProfile from "@/types/UserProfile";
import Item, { ItemCategory, TirgusItem } from "@/types/Item";
import itemList, { ItemKey } from "@/utils/itemList";
import tirgusComponents from "@/commands/tirgus/tirgusComponents";
import { ComponentType } from "discord.js";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import itemString from "@/utils/strings/itemString";
import addItems from "@/db/addItems";
import addLati from "@/db/addLati";
import smallEmbed from "@/utils/embeds/smallEmbed";
import checkUserSpecialItems from "@/items/helpers/checkUserSpecialItems";
import setTirgus from "@/db/setTirgus";
import midNightStr from "@/utils/strings/midnightStr";
import axios from "axios";
import intReply from "@/utils/intReply";

export function calcReqItems({ items, lati }: UserProfile, itemObj: Item) {
  const tirgusPrice = (itemObj as Item & TirgusItem).tirgusPrice;

  let hasAll = true;
  if (tirgusPrice.lati && lati < tirgusPrice.lati) hasAll = false;

  const reqItemsInv: Record<ItemKey, number> = {};
  for (const [key, amount] of Object.entries(tirgusPrice.items)) {
    const amountInInv = items.find((i) => i.name === key)?.amount ?? 0;
    reqItemsInv[key] = amountInInv;
    if (amountInInv < amount) hasAll = false;
  }

  return {
    items: reqItemsInv,
    hasAll,
  };
}

async function getTirgusData(): Promise<ItemKey[] | null> {
  try {
    const res = await axios.get(`${process.env.ULMANBOTS_API_URL}/api/get-tirgus`);
    return res.data as ItemKey[];
  } catch (e) {
    return null;
  }
}

function getBoughtItems({ tirgus }: UserProfile) {
  const today = new Date().toLocaleDateString("en-GB");
  if (tirgus.lastDayUsed !== today) return [];
  return tirgus.itemsBought;
}

const tirgus: Command = {
  description: () =>
    "Tirgū var nopirkt īpašas mantas, kas nav pieejamas nekur citur (ar retiem izņēmumiem)\n\n" +
    "Atšķirībā no veikala, tirgus preces ir nopērkamas par citām mantām (dažām mantām cenā ir arī lati)\n" +
    "Katrs lietotājs var nopirkt katru no tirgus mantām tikai **VIENU** reizi noteiktā dienā\n" +
    `Katru dienu (plkst. ${midNightStr()}) nejauši tiek izvēlētas **3** mantas kas būs nopērkamas tirgū\n\n` +
    "**Visas tirgū pieejamās mantas:**\n>>> " +
    Object.values(itemList)
      .filter((i) => i.categories.includes(ItemCategory.TIRGUS))
      .map((i) => itemString(i))
      .join("\n"),
  color: commandColors.veikals,
  data: {
    name: "tirgus",
    description: "Apskatīt šodienas tirgus preces",
  },
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const [user, tirgusListings] = await Promise.all([findUser(userId, guildId), getTirgusData()]);

    if (!user || !tirgusListings) return intReply(i, errorEmbed);
    if (!tirgusListings) return intReply(i, errorEmbed);

    let selectedListing: string;
    const itemsBought = getBoughtItems(user);

    const msg = await intReply(i, {
      content: "\u200B",
      embeds: tirgusEmbed(i, tirgusListings, user, itemsBought),
      components: tirgusComponents(tirgusListings, user, itemsBought),
      fetchReply: true,
    });

    if (!msg) return;

    buttonHandler(i, "tirgus", msg, async (int) => {
      if (int.customId === "tirgus_select_menu") {
        if (int.componentType !== ComponentType.StringSelect) return;
        selectedListing = int.values[0];

        const [newUser, newListings] = await Promise.all([findUser(userId, guildId), getTirgusData()]);
        if (!newUser || !newListings) return { error: true };

        const itemsBought = getBoughtItems(newUser);

        return {
          edit: {
            embeds: tirgusEmbed(i, newListings, newUser, itemsBought),
            components: tirgusComponents(newListings, newUser, itemsBought, selectedListing),
          },
        };
      }
      if (int.customId === "tirgus_pirkt") {
        if (int.componentType !== ComponentType.Button) return;
        if (!selectedListing) return;

        const itemObj = itemList[selectedListing];

        const [newUser, newListings] = await Promise.all([findUser(userId, guildId), getTirgusData()]);
        if (!newUser || !newListings) return { error: true };

        const itemsBought = getBoughtItems(newUser);
        if (itemsBought.includes(selectedListing)) {
          intReply(
            int,
            ephemeralReply(
              `Tu nevari nopirkt **${itemString(itemObj, null, true)}**, jo tu jau šodien to esi nopircis`,
            ),
          );
          return { doNothing: true };
        }

        if (!newListings.includes(selectedListing)) {
          return {
            end: true,
            after: () => {
              intReply(int, "Kļūda: šī manta vairs nepārdodas tirgū");
            },
          };
        }

        const { hasAll } = calcReqItems(newUser, itemObj);
        if (!hasAll) {
          return {
            end: true,
            after: () => {
              intReply(int, ephemeralReply(`Tu nevari atļauties nopirkt **${itemString(itemObj, 1, true)}**`));
            },
          };
        }

        if ("defaultAttributes" in itemObj) {
          const specialRes = checkUserSpecialItems(newUser, selectedListing);
          if (!specialRes.valid) {
            return {
              end: true,
              after: () => {
                intReply(
                  int,
                  ephemeralReply(`Tu nevari nopirkt **${itemString(itemObj, 1, true)}**, jo ${specialRes.reason}`),
                );
              },
            };
          }
        }

        const tirgusPrice = (itemObj as Item & TirgusItem).tirgusPrice;

        const itemsToRemove = Object.fromEntries(
          Object.entries(tirgusPrice.items).map(([key, amount]) => [key, -amount]),
        );

        await addItems(userId, guildId, { ...itemsToRemove, [selectedListing]: 1 });
        await setTirgus(userId, guildId, selectedListing);

        if (tirgusPrice?.lati) {
          await addLati(userId, guildId, -tirgusPrice.lati);
        }

        const userAfter = await findUser(userId, guildId);
        if (!userAfter) return { error: true };

        const itemsBoughtAfter = getBoughtItems(userAfter);

        return {
          edit: {
            embeds: tirgusEmbed(i, newListings, userAfter, itemsBoughtAfter),
            components: tirgusComponents(newListings, userAfter, itemsBought),
          },
          after: () => {
            intReply(int, smallEmbed(`Tu nopirki **${itemString(itemObj, 1, true)}**`, this.color));
          },
        };
      }
    });
  },
};

export default tirgus;
