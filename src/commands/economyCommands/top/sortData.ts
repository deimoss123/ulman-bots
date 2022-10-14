import UserProfile from '../../../interfaces/UserProfile';
import { ProjectionType } from 'mongoose';
import { getInvValue } from '../inventars';
import latiString from '../../../embeds/helpers/latiString';
import levelsList, { MAX_LEVEL } from '../../../levelingSystem/levelsList';
import StatsProfile from '../../../interfaces/StatsProfile';
import { spinCountDisplayValue } from '../statistika/statsList';

export interface SortDataProfileEntry<T extends UserProfile | StatsProfile> {
  projection: ProjectionType<T>;
  sortFunc: (a: T, b: T) => number;
  displayValue: (user: T) => string;
  totalReduceFunc?: (prev: number, curr: T) => number;
  partOfTotal?: (total: number, user: T) => number;
  topDescription?: (total: number) => string;
}

export const sortDataProfile: Record<string, SortDataProfileEntry<UserProfile>> = {
  maks: {
    projection: { lati: 1 },
    sortFunc: (a, b) => b.lati - a.lati,
    displayValue: user => latiString(user.lati),
    totalReduceFunc: (p, c) => p + c.lati,
    partOfTotal: (total, { lati }) => lati / total,
    topDescription: total => `Cirkulācijā ir ${latiString(total, false, true)}`,
  },
  inv: {
    projection: { items: 1, specialItems: 1 },
    sortFunc: (a, b) => getInvValue(b) - getInvValue(a),
    displayValue: user => latiString(getInvValue(user)),
    totalReduceFunc: (p, c) => p + getInvValue(c),
    partOfTotal: (total, user) => getInvValue(user) / total,
    topDescription: total => `Visu lietotāju inventāru vērtība ir ${latiString(total, false, true)}`,
  },
  total: {
    projection: { lati: 1, items: 1, specialItems: 1 },
    sortFunc: (a, b) => b.lati + getInvValue(b) - (a.lati + getInvValue(a)),
    displayValue: user => latiString(user.lati + getInvValue(user)),
    totalReduceFunc: (p, c) => p + c.lati + getInvValue(c),
    partOfTotal: (total, user) => (user.lati + getInvValue(user)) / total,
    topDescription: total => `Visu lietotāju kopējā vērtība ir ${latiString(total, false, true)}`,
  },
  level: {
    projection: { level: 1, xp: 1 },
    sortFunc: (a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level),
    displayValue: ({ level, xp }) =>
      `Līmenis: **${level}** ` +
      (level === MAX_LEVEL ? '(maksimālais)' : ` | UlmaņPunkti: ${xp}/${levelsList[level + 1].xp}`),
  },
};

function defaultSortFunc(key: keyof StatsProfile): SortDataProfileEntry<StatsProfile>['sortFunc'] {
  return (a, b) => (b[key] as number) - (a[key] as number);
}

function defaultReduceFunc(key: keyof StatsProfile): SortDataProfileEntry<StatsProfile>['totalReduceFunc'] {
  return (p, c) => p + (c[key] as number);
}

function defaultPartOfTotal(key: keyof StatsProfile): SortDataProfileEntry<StatsProfile>['partOfTotal'] {
  return (total, user) => (user[key] as number) / total;
}

export const sortDataStats: Record<string, SortDataProfileEntry<StatsProfile>> = {
  fenkaSpent: {
    projection: { fenkaSpent: 1, fenkaSpinCount: 1 },
    sortFunc: defaultSortFunc('fenkaSpent'),
    displayValue: ({ fenkaSpent, fenkaSpinCount }) =>
      `${latiString(fenkaSpent)} | ${spinCountDisplayValue(fenkaSpinCount)}`,
    totalReduceFunc: defaultReduceFunc('fenkaSpent'),
    partOfTotal: defaultPartOfTotal('fenkaSpent'),
    topDescription: total => `Kopā feniksā ir nogriezti ${latiString(total, false, true)}`,
  },
  fenkaSpinCount: {
    projection: { fenkaSpent: 1, fenkaSpinCount: 1 },
    sortFunc: defaultSortFunc('fenkaSpinCount'),
    displayValue: ({ fenkaSpent, fenkaSpinCount }) =>
      `${spinCountDisplayValue(fenkaSpinCount)} | ${latiString(fenkaSpent)}`,
    totalReduceFunc: defaultReduceFunc('fenkaSpinCount'),
    partOfTotal: defaultPartOfTotal('fenkaSpinCount'),
    topDescription: total => `Kopā fēniksā ir veikti ${spinCountDisplayValue(total)}`,
  },
  rulSpent: {
    projection: { rulSpent: 1, rulSpinCount: 1 },
    sortFunc: defaultSortFunc('rulSpent'),
    displayValue: ({ rulSpent, rulSpinCount }) => `${latiString(rulSpent)} | ${spinCountDisplayValue(rulSpinCount)}`,
    totalReduceFunc: defaultReduceFunc('rulSpent'),
    partOfTotal: defaultPartOfTotal('rulSpent'),
    topDescription: total => `Kopā ruletē ir nogriezti ${latiString(total, false, true)}`,
  },
  rulSpinCount: {
    projection: { rulSpent: 1, rulSpinCount: 1 },
    sortFunc: defaultSortFunc('rulSpinCount'),
    displayValue: ({ rulSpent, rulSpinCount }) => `${spinCountDisplayValue(rulSpinCount)} | ${latiString(rulSpent)}`,
    totalReduceFunc: defaultReduceFunc('rulSpinCount'),
    partOfTotal: defaultPartOfTotal('rulSpinCount'),
    topDescription: total => `Kopā rulētē ir veikti ${spinCountDisplayValue(total)}`,
  },
};
