import Command from '../interfaces/Command';
import maks from './maks/maks';
import _addLati from './_addLati/_addLati';
import maksat from './maksat/maksat';
import _addItem from './_addItem/_addItem';
import inventars from './inventars/inventars';
import iedot from './iedot/iedot';
import veikals from './veikals/veikals';

// komandu objektu saraksts
export const commandList: Command[] = [
  maks, maksat, inventars, iedot, veikals,
];

export const devCommandList: Command[] = [
  _addLati, _addItem,
];