import { BaseInteraction, ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { IpasumiState } from "@/commands/ipasumi/ipasumi";
import mainEmbed from "@/utils/embeds/mainEmbed";

type State = {};

async function init(state: IpasumiState): Promise<{ ok: boolean }> {
  return { ok: true };
}

function defaultState(): State {
  return {};
}

function view(state: IpasumiState, i: BaseInteraction) {
  return mainEmbed({
    i,
    content: "ievarijumuStends",
  });
}

async function handler(i: ButtonInteraction | StringSelectMenuInteraction, state: IpasumiState) {
  return;
}

export { init, State, defaultState, view, handler };
