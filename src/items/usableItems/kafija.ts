import UsableItemReturn from '../../interfaces/UsableItemReturn';

export default async function kafija(userId: string): Promise<UsableItemReturn> {
  return {
    text:
      'Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n' +
      'Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz',
  };
}
