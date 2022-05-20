import UsableItemReturn from '../../interfaces/UsableItemReturn';
import loto from '../../casino/loto';
import laimestiLatloto from '../../casino/laimesti/laimestiLatloto';

export default async function latloto(userId: string): Promise<UsableItemReturn> {
  return await loto(userId, laimestiLatloto);
}