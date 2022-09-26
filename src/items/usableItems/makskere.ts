import maksekeresData from '../../commands/economyCommands/zvejot/makskeresData';
import ephemeralReply from '../../embeds/ephemeralReply';
import Item, { UsableItemFunc } from '../../interfaces/Item';
import itemList from '../itemList';

export function makskereCustomValue(itemKey: string): Item['customValue'] {
  return ({ durability }) => {
    const { value } = itemList[itemKey];
    const { maxDurability } = maksekeresData[itemKey];

    if (durability! <= 0) return 1;

    if (durability! < maxDurability) {
      return Math.floor((durability! / maxDurability) * value);
    }

    return value;
  };
}

const makskere: UsableItemFunc = async () => {
  return {
    text: '',
    custom: async i => {
      await i.reply(ephemeralReply('Makšķeres ir izmantojamas priekš zvejošanas\nSāc zvejot ar komandu `/zvejot`'));
    },
  };
};

export default makskere;
