export type UserStats = Record<
  // veikals
  | 'spentShop'
  | 'soldShop'
  | 'taxPaid'
  // maksāt/iedot
  | 'paidLati'
  | 'receivedLati'
  | 'itemsGiven'
  | 'itemsReceived'
  // zagšana
  | 'stolenLati'
  | 'lostStealingLati'
  | 'stolenFromBanka'
  // zveja
  | 'caughtFishCount'
  | 'timeSpentFishing'
  // feniks
  | 'fenkaBiggestWin'
  | 'fenkaBiggestBet'
  | 'fenkaSpent'
  | 'fenkaWon'
  | 'fenkaSpinCount'
  // rulete
  | 'rulBiggestWin'
  | 'rulBiggestBet'
  | 'rulSpent'
  | 'rulWon'
  | 'rulSpinCount',
  number
>;

type StatsProfile = {
  userId: string;
  guildId: string;
} & UserStats;

export default StatsProfile;
