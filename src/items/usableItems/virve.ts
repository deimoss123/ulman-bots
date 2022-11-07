import findUser from '../../economy/findUser';
import setLati from '../../economy/setLati';
import { UsableItemFunc } from '../../interfaces/Item';

const virve: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  if (user.lati < 0) {
    return {
      text: 'Tu nevari pakārties, jo tev ir negatīvs latu daudzums (nezinu kā tev tas izdevās)',
    };
  }

  await setLati(userId, guildId, 0);

  return { text: 'Tu pakāries un pazaudēji **visu** savu naudu' };
};

export default virve;
