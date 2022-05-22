import UsableItemReturn from '../../interfaces/UsableItemReturn';
import setLati from '../../economy/setLati';

export default async function virve(userId: string): Promise<UsableItemReturn> {
  await setLati(userId, 0);

  return { text: 'Tu pakāries un pazaudēji **visu** savu naudu' };
}