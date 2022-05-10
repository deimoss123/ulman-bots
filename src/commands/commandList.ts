import Command from '../interfaces/Command';
import maks from './economy/maks/maks';
import _addLati from './_devCommands/_addLati/_addLati';
import maksat from './economy/maksat/maksat';
import _addItem from './_devCommands/_addItem/_addItem';
import inventars from './economy/inventars/inventars';
import iedot from './economy/iedot/iedot';
import veikals from './economy/veikals/veikals';
import pirkt from './economy/pirkt/pirkt';
import pardot from './economy/pardot/pardot';

// komandu objektu saraksts
export const commandList: Command[] = [
  maks, maksat, inventars, iedot, veikals, pirkt, pardot,
];

export const devCommandList: Command[] = [
  _addLati, _addItem,
];