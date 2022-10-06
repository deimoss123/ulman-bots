import UserProfile from '../../../interfaces/UserProfile';
import { ProjectionType } from 'mongoose';
import { getInvValue } from '../inventars';
import latiString from '../../../embeds/helpers/latiString';
import levelsList, { MAX_LEVEL } from '../../../levelingSystem/levelsList';

export interface SortDataEntry {
  title: string;
  projection: ProjectionType<UserProfile>;
  sortFunc: (a: UserProfile, b: UserProfile) => number;
  displayValue: (user: UserProfile) => string;
  totalReduceFunc?: (prev: number, curr: UserProfile) => number;
  partOfTotal?: (total: number, user: UserProfile) => number;
  topDescription?: (total: number) => string;
}

const sortData: Record<string, SortDataEntry> = {
  maks: {
    title: 'Maku',
    projection: { lati: 1 },
    sortFunc: (a, b) => b.lati - a.lati,
    displayValue: user => latiString(user.lati),
    totalReduceFunc: (p, c) => p + c.lati,
    partOfTotal: (total, { lati }) => lati / total,
    topDescription: total => `Cirkulācijā ir ${latiString(total, false, true)}`,
  },
  inv: {
    title: 'Inventāra vērtības',
    projection: { items: 1, specialItems: 1 },
    sortFunc: (a, b) => getInvValue(b) - getInvValue(a),
    displayValue: user => latiString(getInvValue(user)),
    totalReduceFunc: (p, c) => p + getInvValue(c),
    partOfTotal: (total, user) => getInvValue(user) / total,
    topDescription: total => `Visu lietotāju inventāru vērtība ir ${latiString(total, false, true)}`,
  },
  total: {
    title: 'Kopējās vērtības',
    projection: { lati: 1, items: 1, specialItems: 1 },
    sortFunc: (a, b) => b.lati + getInvValue(b) - (a.lati + getInvValue(a)),
    displayValue: user => latiString(user.lati + getInvValue(user)),
    totalReduceFunc: (p, c) => p + c.lati + getInvValue(c),
    partOfTotal: (total, user) => (user.lati + getInvValue(user)) / total,
    topDescription: total => `Visu lietotāju kopējā vērtība ir ${latiString(total, false, true)}`,
  },
  level: {
    title: 'Līmeņu',
    projection: { level: 1, xp: 1 },
    sortFunc: (a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level),
    displayValue: ({ level, xp }) =>
      `Līmenis: **${level}** ` +
      (level === MAX_LEVEL ? '(maksimālais)' : ` | UlmaņPunkti: ${xp}/${levelsList[level + 1].xp}`),
  },
};

export default sortData;
