import ephemeralReply from '../../embeds/ephemeralReply';
import { UsableItemFunc } from '../../interfaces/Item';

const makskere: UsableItemFunc = async () => {
  return {
    text: '',
    custom: async i => {
      await i.reply(ephemeralReply('Makšķeres ir izmantojamas priekš zvejošanas\nSāc zvejot ar komandu `/zvejot`'));
    },
  };
};

export default makskere;
