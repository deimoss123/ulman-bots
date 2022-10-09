import { UserStats } from '../../../interfaces/UserProfile';

type StatsList = Partial<Record<keyof UserStats, string>>;

const statsList: StatsList = {
  spentShop: 'Iztērēts veikalā',
  soldShop: 'Pārdots veikalā',
  taxPaid: 'Samaksāts nodoklis',
  paidLati: 'Samaksātātā nauda',
  receivedLati: 'Saņemtā nauda',
  itemsGiven: 'Iedotais mantu daudzums',
  itemsReceived: 'Saņemtais mantu daudzums',
  stolenLati: 'Nozagts',
  lostStealingLati: 'Pazaudēts zogot',
  stolenFromBanka: 'Nozagts no bankas',
};

export default statsList;
