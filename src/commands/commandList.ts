import Command from '../interfaces/Command';
import maks from './economyCommands/maks';
import _addLati from './devCommands/_addLati';
import maksat from './economyCommands/maksat';
import _addItem from './devCommands/_addItem/_addItem';
import inventars from './economyCommands/inventars';
import iedot from './economyCommands/iedot/iedot';
import veikals from './economyCommands/veikals/veikals';
import pirkt from './economyCommands/pirkt/pirkt';
import pardot from './economyCommands/pardot/pardot';
import izmantot from './economyCommands/izmantot/izmantot';
import profils from './economyCommands/profils';
import _addXP from './devCommands/_addXP';
import vakances from './economyCommands/vakances/vakances';
import stradat from './economyCommands/stradat/stradat';

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
  stradat,
];

export const devCommandList: Command[] = [_addLati, _addItem, _addXP];
