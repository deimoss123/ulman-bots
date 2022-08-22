import { SpecialItemInProfile } from '../../interfaces/UserProfile';

const attributesLat: Record<string, Record<string, (...args: any) => string>> = {
  divainais_burkans: {
    timesUsed: (n: number) => `Nokosts ${n} reiz${n % 10 === 1 && n % 100 !== 11 ? 'i' : 'es'}`,
  },
};

const hiddenAttributes = ['customName'];

export function displayAttributes(item: SpecialItemInProfile, inline = false) {
  const attributes = Object.entries(item.attributes).filter(
    (item) => !hiddenAttributes.includes(item[0])
  );

  const textArr = attributes.map(([key, value]) => attributesLat[item.name][key](value));
  if (inline) return textArr.join(', ');
  return textArr.join('\n');
}
