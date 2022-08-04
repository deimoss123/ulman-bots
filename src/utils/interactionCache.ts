import { ButtonInteraction, InteractionCollector, SelectMenuInteraction } from 'discord.js';

/*
Interaction Cache glabā visas ziņas kurās pogas nav izslēgtas un kurās strādā collectori

interactionsCache struktūra:
{
  '222631002265092096': {
    'veikals': {
      collector: ...
      isInteractionActive: false
    }
    'fenikss': {
      collector: ...
      isInteractionActive: true
    }
    'pirkt': {
      ...
    }
  }
  '515267450929938434': {
    ...
  }
}

*/

export interface InteractionInCache {
  collector: InteractionCollector<ButtonInteraction | SelectMenuInteraction>;

  // nosaka vai komanda ir aktīva, piemēram ja griežas fenikss, tad tā IR aktīva
  // kad fēnikss ir beidzis griezties tā vairs nav aktīva
  isInteractionActive: boolean;
}

const interactionCache = new Map<
  string, // userId
  Map<
    string, // interaction nosaukums (veikals, izmantot_velreiz, fenikss, ...)
    InteractionInCache
  >
>();

export default interactionCache;
