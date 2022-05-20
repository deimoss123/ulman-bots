import UsableItemReturn from '../../interfaces/UsableItemReturn';
import laimestiDizloto from '../../casino/laimesti/laimestiDizloto';
import loto from '../../casino/loto';

export default async function dizloto(userId: string): Promise<UsableItemReturn> {
  return await loto(userId, laimestiDizloto);
}