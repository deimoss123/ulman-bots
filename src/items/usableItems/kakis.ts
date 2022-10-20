import { UsableItemFunc } from '../../interfaces/Item';
import { ItemKey } from '../itemList';

export const kakisObj = {};

// kaķa maksimālais pabarošanas laiks, 2d
export const KAKIS_MAX_FEED = 172_800_000;

export const kakisFoodData: Record<ItemKey, { feedTimeMs: number }> = {
  lidaka: {
    feedTimeMs: 57_600_000, // 16h
  },
  asaris: {
    feedTimeMs: 72_000_000, // 20h
  },
  lasis: {
    feedTimeMs: 86_400_000, // 24h
  },
  // TODO: kaķu barība 48h, 40 lati veikalā
};

const kakis: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  return {
    text: '',
    custom: i => {
      return i.reply('');
    },
  };
};

export default kakis;
