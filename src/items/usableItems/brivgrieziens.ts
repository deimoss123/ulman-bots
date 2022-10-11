import feniksRun from '../../commands/economyCommands/feniks/feniksRun';
import { UsableItemFunc } from '../../interfaces/Item';

export default function brivgrieziens(likme: number): UsableItemFunc {
  return async () => {
    return {
      text: '',
      custom: async i => {
        feniksRun(i, likme, true, `brivgriez${likme}`);
      },
    };
  };
}
