import { IpasumiState } from "@/commands/ipasumi/ipasumi";
import mainEmbed from "@/utils/embeds/mainEmbed";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";

type State = {};

async function init(state: IpasumiState): Promise<{ ok: boolean }> {
  return { ok: true };
}

function defaultState(): State {
  return {};
}

const view: DialogsViewFunc<IpasumiState> = (state, i) => {
  return mainEmbed({
    i,
    content: "ievarijumuStends",
  });
};

const handler: Parameters<Dialogs<IpasumiState>["onClick"]>[0] = async (i, state) => {
  return;
};

export { init, State, defaultState, view, handler };
