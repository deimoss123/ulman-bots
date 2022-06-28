import Command from '../interfaces/Command';
import maks from './economyCommands/maks/maks';
import _addLati from './_devCommands/_addLati/_addLati';
import maksat from './economyCommands/maksat/maksat';
import _addItem from './_devCommands/_addItem/_addItem';
import inventars from './economyCommands/inventars/inventars';
import iedot from './economyCommands/iedot/iedot';
import veikals from './economyCommands/veikals/veikals';
import pirkt from './economyCommands/pirkt/pirkt';
import pardot from './economyCommands/pardot/pardot';
import izmantot from './economyCommands/izmantot/izmantot';
import profils from './economyCommands/profils/profils';
import _addXP from './_devCommands/_addXP/_addXP';
import vakances from './economyCommands/vakances/vakances';

// komandu objektu saraksts
export const commandList: Command[] = [
  maks,
  maksat,
  inventars,
  iedot,
  veikals,
  pirkt,
  pardot,
  izmantot,
  profils,
  vakances,
];

export const devCommandList: Command[] = [_addLati, _addItem, _addXP];