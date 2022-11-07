import { UsableItemFunc } from '../../interfaces/Item';

const kafija: UsableItemFunc = () => {
  return {
    text:
      'Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n' +
      'Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz',
  };
};

export default kafija;
