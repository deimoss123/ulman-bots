import latiString from '../../../embeds/helpers/latiString';
import { UserStats } from '../../../interfaces/StatsProfile';

export type StatsTypes = 'veikals' | 'paygive' | 'stolen' | 'feniks' | 'rulete';
interface StatsListEntry {
  name: string;
  displayValue: (n: number) => string;
}

const giveDisplayValue: StatsListEntry['displayValue'] = n => `${n} manta${n % 10 === 1 && n % 100 !== 11 ? '' : 's'}`;
const spinCountDisplayValue: StatsListEntry['displayValue'] = n =>
  `${n} griezien${n % 10 === 1 && n % 100 !== 11 ? 's' : 'i'}`;

type StatsList = Record<StatsTypes, { entries: Partial<Record<keyof UserStats, StatsListEntry>> }>;

const statsList: StatsList = {
  veikals: {
    entries: {
      spentShop: { name: 'Iztērēts veikalā', displayValue: latiString },
      soldShop: { name: 'Pārdots', displayValue: latiString },
      taxPaid: { name: 'Samaksāts nodoklis', displayValue: latiString },
    },
  },
  paygive: {
    entries: {
      paidLati: { name: 'Samaksātāta nauda', displayValue: latiString },
      receivedLati: { name: 'Saņemta nauda', displayValue: latiString },
      itemsGiven: { name: 'Iedotas mantas', displayValue: giveDisplayValue },
      itemsReceived: { name: 'Saņemtas mantas', displayValue: giveDisplayValue },
    },
  },
  stolen: {
    entries: {
      stolenLati: { name: 'Nozagts', displayValue: latiString },
      lostStealingLati: { name: 'Pazaudēts zogot', displayValue: latiString },
      stolenFromBanka: { name: 'Nozagts no bankas', displayValue: latiString },
    },
  },
  feniks: {
    entries: {
      fenkaBiggestWin: { name: 'Lielākais laimests', displayValue: latiString },
      fenkaBiggestBet: { name: 'Lielākā likme', displayValue: latiString },
      fenkaSpent: { name: 'Iztērēts', displayValue: latiString },
      fenkaWon: { name: 'Laimēts', displayValue: latiString },
      fenkaSpinCount: { name: 'Griezienu skaits', displayValue: spinCountDisplayValue },
    },
  },
  rulete: {
    entries: {
      rulBiggestWin: { name: 'Lielākais laimests', displayValue: latiString },
      rulBiggestBet: { name: 'Lielākā likme', displayValue: latiString },
      rulSpent: { name: 'Iztērēts', displayValue: latiString },
      rulWon: { name: 'Laimēts', displayValue: latiString },
      rulSpinCount: { name: 'Griezienu skaits', displayValue: spinCountDisplayValue },
    },
  },
};

export default statsList;
