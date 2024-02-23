import { UsableItemFunc } from '../../interfaces/Item';

const redbull: UsableItemFunc = () => {
  return {
    text:
      'Redbulls ir izmantojams, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n' +
      'Komandai `/stradat` ir poga `izdzert redbull` lai strādātu vēlreiz',
  };
};

export default redbull;
