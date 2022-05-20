import UsableItemReturn from '../../interfaces/UsableItemReturn';
import increaseInvCap from '../../economy/increaseInvCap';

export default async function mugursoma(userId: string): Promise<UsableItemReturn> {
  const INCREASE_AMOUNT = 5;
  const user = await increaseInvCap(userId, INCREASE_AMOUNT);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta no **${user!.itemCap - INCREASE_AMOUNT}** uz **${user!.itemCap}**`,
  };
}