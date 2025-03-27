import { BaseInteraction, ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { IpasumiState } from './ipasumi';
import embedTemplate from '../../embeds/embedTemplate';

type State = {};

async function init(state: IpasumiState): Promise<{ ok: boolean }> {
  return { ok: true };
}

function defaultState(): State {
  return {};
}

function view(state: IpasumiState, i: BaseInteraction) {
  return embedTemplate({
    i,
    content: 'ievarijumuStends',
  });
}

async function handler(i: ButtonInteraction | StringSelectMenuInteraction, state: IpasumiState) {
  return;
}

export { init, State, defaultState, view, handler };
