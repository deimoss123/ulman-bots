import { ChatInputCommandInteraction } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import millisToReadableTime from '../../../embeds/helpers/millisToReadableTime';
import iconEmojis from '../../../embeds/iconEmojis';
import Item, { TirgusItem } from '../../../interfaces/Item';
import UserProfile from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';
import { calcReqItems } from './tirgus';

function mapPrice(itemObj: Item, user: UserProfile): string {
  const tirgusPrice = (itemObj as Item & TirgusItem).tirgusPrice;

  const { items: reqItemsInv } = calcReqItems(user, itemObj);
  const reqLati = tirgusPrice.lati;

  const maxHasLen = `${Object.values(reqItemsInv).reduce((p, a) => (a > p ? a : p), 0)}`.length;
  const maxReqLen = `${Object.values(tirgusPrice.items).reduce((p, a) => (a > p ? a : p), 0)}`.length;

  return (
    (reqLati
      ? `${user.lati >= reqLati ? iconEmojis.checkmark : iconEmojis.cross} \` ${user.lati}/${reqLati} \` lati\n`
      : '') +
    Object.entries(reqItemsInv)
      .map(([key, amount]) => {
        const reqAmount = tirgusPrice.items[key];

        return (
          `${amount >= reqAmount ? iconEmojis.checkmark : iconEmojis.cross} ` +
          `\` ${' '.repeat(maxHasLen - `${amount}`.length)}${amount}/` +
          `${reqAmount}${' '.repeat(maxReqLen - `${reqAmount}`.length)} \` ${itemString(itemList[key])}`
        );
      })
      .join('\n')
  );
}

export default function tirgusEmbed(
  i: ChatInputCommandInteraction,
  listings: ItemKey[],
  user: UserProfile,
  itemsBought: ItemKey[]
) {
  const resetTime = new Date().setHours(24, 0, 0, 0);
  const timeUntilReset = resetTime - Date.now();

  return embedTemplate({
    i,
    color: commandColors.veikals,
    title: 'Tirgus',
    description:
      '\n' +
      `Tirgus preces mainās katru dienu plkst. \n` +
      `<t:${Math.floor(resetTime / 1000)}:t> (pēc ${millisToReadableTime(timeUntilReset)})`,
    fields: listings.map((key, index) => {
      const itemObj = itemList[key];
      return {
        name: itemString(itemObj),
        value:
          `Pieejams: ${itemsBought.includes(key) ? iconEmojis.cross : iconEmojis.checkmark}\n` +
          '**Cena:**\n' +
          mapPrice(itemObj, user) +
          (index !== listings.length - 1 ? `\n__${'\u2800'.repeat(20)}__` : ''),
        inline: false,
      };
    }),
  }).embeds;
}
