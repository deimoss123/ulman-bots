import findUser from '../../economy/findUser';
import { UsableItemFunc } from '../../interfaces/Item';
import { ItemKey } from '../itemList';

interface IZivs {
  attributes: {
    weight: [number, number];
    length: [number, number];
    width: [number, number];
  };
}

// const zivjuKastesZivjuSaraksts: Record<ItemKey, IZivs> = {
//   makrele_a: {
//     attributes: {
//       weight: [5, 10],
//     },
//   },
//   forele_a: {},
// };

const zivju_kaste: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);

  if (!user) return { error: true };

  return {
    text: '',
  };
};

export default zivju_kaste;
