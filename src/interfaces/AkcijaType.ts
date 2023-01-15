import { AkcijaId } from '../commands/economyCommands/akcijas/akcijasList';

interface AkcijaType {
  akcijaId: AkcijaId;
  time: number;
  price: number;
}

export default AkcijaType;
