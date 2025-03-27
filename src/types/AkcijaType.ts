import { AkcijaId } from "@/commands/akcijas/akcijasList";

interface AkcijaType {
  akcijaId: AkcijaId;
  time: number;
  price: number;
}

export default AkcijaType;
