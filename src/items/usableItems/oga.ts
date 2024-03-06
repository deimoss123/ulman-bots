import itemString from '../../embeds/helpers/itemString';
import { UsableItemFunc } from '../../interfaces/Item';
import { ItemKey } from '../itemList';

export type BerryProperties = {
  saldums: number;
  skabums: number;
  rugtums: number;
  slapjums: number;
};

export const propertiesLat: Record<keyof BerryProperties, string> = {
  saldums: 'Saldums',
  skabums: 'Skābums',
  rugtums: 'Rūgtums',
  slapjums: 'Slapjums',
};

export const berryProperties: Record<ItemKey, BerryProperties> = {
  avene: {
    saldums: 5,
    skabums: 3,
    rugtums: 7,
    slapjums: 2,
  },
  janoga: {
    saldums: 4,
    skabums: 7,
    rugtums: 9,
    slapjums: 1,
  },
  mellene: {
    saldums: 8,
    skabums: 6,
    rugtums: 4,
    slapjums: 9,
  },
  vinoga: {
    saldums: 1,
    skabums: 10,
    rugtums: 2,
    slapjums: 6,
  },
  zemene: {
    saldums: 9,
    skabums: 2,
    rugtums: 5,
    slapjums: 3,
  },
};

export function ogaInfo(key: ItemKey) {
  return () =>
    `Ogas var iegūt no **${itemString('ogu_krums')}**\n` +
    `No ogām var vārīt **${itemString('ievarijums', null, true)}**, ` +
    `izmantojot **${itemString('gazes_plits', null, true)}**\n\n` +
    `Katrai ogai ir savas īpašības, kas ietekmē ievārījuma beigu cenu\n\n` +
    `**Šīs ogas īpašības:**\n` +
    Object.entries(berryProperties[key])
      .map(([key, value]) => `${propertiesLat[key as keyof BerryProperties]}: ${value}`)
      .join('\n');
}

export default function oga(key: ItemKey): UsableItemFunc {
  return () => ({
    text: `Oga`,
  });
}
