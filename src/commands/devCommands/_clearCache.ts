import Command from '../../interfaces/Command';
import intReply from '../../utils/intReply';
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
    intReply(i, 'Cache iztīrīts!');
  },
};

export default _clearCache;
