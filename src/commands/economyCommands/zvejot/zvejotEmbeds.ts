import { bold, CommandInteraction, time, underscore } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import millisToReadableTime from '../../../embeds/helpers/millisToReadableTime';
import UserProfile, { UserFishing } from '../../../interfaces/UserProfile';
import itemList from '../../../items/itemList';
import maksekeresData from './makskeresData';
import { countFish } from './syncFishing';

const zvejaEmojis = {
  cope1: '<a:cope_1:1023406391928565821>',
  cope2: '<a:cope_2:1023406394864582686>',
  cope3: '<a:cope_3:1023406400665305118>',
  cope4: '<a:cope_4:1023406403207041046>',
  cope5: '<a:cope_5:1023406409334919288>',
  udens: '<a:udens:920839237920768050>',
  udenszive: '<a:udenszive:920839478174683136>',
};

function zvejaEmojiString() {
  const { cope1, cope2, cope3, cope4, cope5, udenszive } = zvejaEmojis;
  return udenszive + cope1 + cope2 + cope3 + cope4 + cope5 + udenszive;
}

function tipsString({ selectedRod, usesLeft, caughtFishes, maxCapacity }: UserFishing) {
  const arr: string[] = [];

  if (!selectedRod) {
    arr.push('tu neesi izvēlējies makšķeri');
  } else if (!usesLeft) {
    arr.push('tev ir jāsalabo makšķere');
  }

  if (countFish(caughtFishes) >= maxCapacity) {
    arr.push('tev ir pilns copes inventārs');
  }

  return arr.length ? arr.map(a => `- ${a}\n`).join('') + '\u200B' : '';
}

export function zvejotEmbed(i: CommandInteraction, { fishing }: UserProfile) {
  const { selectedRod, usesLeft, caughtFishes, lastCaughtFish, futureFishList, maxCapacity } = fishing;
  const fields = [
    {
      name: 'Izvēlētā makšķere',
      value: selectedRod
        ? `${itemString(itemList[selectedRod])} ${usesLeft}/${maksekeresData[selectedRod].maxDurability}`
        : '-',
      inline: false,
    },
    {
      name: 'Nākamais ķēriens',
      value:
        futureFishList && futureFishList.length
          ? `**${time(new Date(futureFishList[0].time), 't')}** ${time(new Date(futureFishList[0].time), 'd')}\n` +
            `Pēc ${millisToReadableTime(futureFishList[0].time - Date.now())}`
          : '-',
      inline: true,
    },
    {
      name: 'Pēdējais ķēriens',
      value: lastCaughtFish
        ? `**${time(new Date(lastCaughtFish.time), 't')}** ${time(new Date(lastCaughtFish.time), 'd')}\n` +
          `${itemString(itemList[lastCaughtFish.itemKey], 1)}`
        : '-',
      inline: true,
    },
    {
      name: '\u200B',
      value:
        `${zvejaEmojiString()} (${countFish(caughtFishes)}/${maxCapacity}) ` +
        (countFish(caughtFishes) >= maxCapacity ? underscore(bold('PILNS')) : '') +
        (!caughtFishes || !Object.keys(caughtFishes).length ? '\n-\n\u200B' : ''),
      inline: false,
    },
  ];

  const tips = tipsString(fishing);
  if (tips)
    fields.unshift({
      name: '❗ Tu nevari zvejot, jo',
      value: tips,
      inline: false,
    });

  if (caughtFishes && Object.keys(caughtFishes).length) {
    fields.push(
      ...Object.entries(caughtFishes).map(([key, amount]) => ({
        name: itemString(itemList[key], amount, true),
        value: `Vērtība: ${latiString(itemList[key].value)}`,
        inline: true,
      }))
    );
  }

  return embedTemplate({
    i,
    content: '\u200B',
    color: commandColors.zvejot,
    fields,
  }).embeds;
}
