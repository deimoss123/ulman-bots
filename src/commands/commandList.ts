import Command from '../interfaces/Command';
import maks from './economyCommands/maks';
import _addLati from './devCommands/_addLati';
import maksat from './economyCommands/maksat';
import _addItem from './devCommands/_addItem';
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
import ubagot from './economyCommands/ubagot';
import feniks from './economyCommands/feniks/feniks';
import zvejot from './economyCommands/zvejot/zvejot';
import _clearCache from './devCommands/_clearCache';
import top from './economyCommands/top/top';
import info from './economyCommands/info/info';
import zagt from './economyCommands/zagt';
import tirgus from './economyCommands/tirgus/tirgus';
import statistika from './economyCommands/statistika/statistika';
import palidziba from './economyCommands/palidziba/palidziba';
import rulete from './economyCommands/rulete/rulete';
import pabalsts from './economyCommands/pabalsts';
import izsole from './devCommands/izsole/izsole';
import kamPieder from './economyCommands/kamPieder/kamPieder';
import akcijas from './economyCommands/akcijas/akcijas';

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
  ubagot,
  feniks,
  zvejot,
  top,
  info,
  zagt,
  tirgus,
  statistika,
  palidziba,
  rulete,
  pabalsts,
  kamPieder,
  akcijas,
];

export const devCommandList: Command[] = [_addLati, _addItem, _addXP, _clearCache, izsole];
