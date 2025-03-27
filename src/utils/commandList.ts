import Command from '@/interfaces/Command';
import maks from '@/commands/maks';
import _addLati from '@/commands/_addLati';
import maksat from '@/commands/maksat';
import _addItem from '@/commands/_addItem';
import inventars from '@/commands/inventars/inventars';
import iedot from '@/commands/iedot/iedot';
import veikals from '@/commands/veikals';
import pirkt from '@/commands/pirkt/pirkt';
import pardot from '@/commands/pardot/pardot';
import izmantot from '@/commands/izmantot/izmantot';
import profils from '@/commands/profils';
import _addXP from '@/commands/_addXP';
import vakances from '@/commands/vakances';
import stradat from '@/commands/stradat/stradat';
import ubagot from '@/commands/ubagot';
import feniks from '@/commands/feniks/feniks';
import zvejot from '@/commands/zvejot/zvejot';
import _clearCache from '@/commands/_clearCache';
import top from '@/commands/top/top';
import info from '@/commands/info/info';
import zagt from '@/commands/zagt';
import tirgus from '@/commands/tirgus/tirgus';
import statistika from '@/commands/statistika/statistika';
import palidziba from '@/commands/palidziba/palidziba';
import rulete from '@/commands/rulete/rulete';
import pabalsts from '@/commands/pabalsts';
import izsole from '@/commands/_izsole/izsole';
import iestatit from '@/commands/_iestatit/iestatit';
import ipasumi from '@/commands/ipasumi/ipasumi';
// import kamPieder from './economyCommands/kamPieder/kamPieder';

// komandu objektu saraksts
export const commandList: Command[] = [
  _addLati,
  _addItem,
  _addXP,
  _clearCache,
  izsole,
  iestatit,

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
  ipasumi,
  // kamPieder,
];
