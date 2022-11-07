import { UsableItemFunc } from '../../interfaces/Item';

const naudas_maiss: UsableItemFunc = () => ({
  text:
    `Naudas maiss glabā no Valsts bankas (UlmaņBota) nozagto naudu\n\n` +
    'Lai zagtu no valsts bankas izmanto komandu `/zagt @UlmaņBots` un pārliecinies ka tavā inventārā ir **tukšs** naudas maiss',
});

export default naudas_maiss;
