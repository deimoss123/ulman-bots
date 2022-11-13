import { Embed, time } from 'discord.js';
import itemString from '../embeds/helpers/itemString';
import latiString from '../embeds/helpers/latiString';
import AuctionType from '../interfaces/AuctionType';
import itemList from '../items/itemList';

export default function izsoleEmbed({
  itemKey,
  itemAmount,
  startPrice,
  attributes,
  startDate,
  endDate,
  currentBid,
  bidHistory,
}: AuctionType): Partial<Embed>[] {
  return [
    {
      title: 'Izsole',
      description:
        `Sākuma datums: **${time(new Date(startDate), 't')}** ${time(new Date(startDate), 'd')}\n` +
        `Beigu datums: **${time(new Date(endDate), 't')}** ${time(new Date(endDate), 'd')}`,
      fields: [
        {
          name: `**${itemString(itemList[itemKey])}**`,
          value: '',
        },
        {
          name: currentBid ? 'Augstākā likme' : 'Sākuma likme',
          value: currentBid ? `` : latiString(startPrice),
        },
        {
          name: 'Likmju vēsture',
          value: bidHistory.length
            ? bidHistory
                .map(
                  ({ userTag, lati, date }) =>
                    `${time(new Date(date), 't')} ${userTag} - ${latiString(lati, false, true)}`
                )
                .join('\n')
            : '-',
        },
      ],
    },
  ];
}
