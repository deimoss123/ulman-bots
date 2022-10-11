import Command from '../../interfaces/Command';
import { clearCache } from '../../utils/userCache';

const _clearCache: Command = {
  description: 'Iztīrīt ulmaņbota cache',
  color: 0xffffff,
  data: {
    name: 'clearcache',
    description: 'Iztīrīt ulmaņbota cache',
  },
  async run(i) {
    // ej n
    clearCache();
    await i.reply('Cache iztīrīts!');
  },
};

export default _clearCache;
