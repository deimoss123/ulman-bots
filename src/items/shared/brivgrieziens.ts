import feniksRun from "@/commands/feniks/feniksRun";
import { UsableItemFunc } from "@/types/Item";

export const brivgriezInfo = `Ko šeit uzrakstīt... nosaukums ir diezgan pašsaprotams :^)`;

const brivgrieziens: UsableItemFunc = (i, _, itemKey) => {
  const likme = +itemKey.substring("brivgriez".length);
  feniksRun(i, likme, true, itemKey);
};

export default brivgrieziens;
