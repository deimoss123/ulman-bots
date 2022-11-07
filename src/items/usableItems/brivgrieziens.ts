import feniksRun from '../../commands/economyCommands/feniks/feniksRun';
import { UsableItemFunc } from '../../interfaces/Item';

export const brivgriezInfo = `Ko šeit uzrakstīt... nosaukums ir diezgan pašsaprotams :^)`;

export default function brivgrieziens(likme: number): UsableItemFunc {
  return () => ({
    custom: i => {
      feniksRun(i, likme, true, `brivgriez${likme}`);
    },
  });
}
