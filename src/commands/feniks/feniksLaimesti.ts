import { ChanceValue } from "@/items/helpers/chance";
import emoji from "@/utils/emoji";

export interface Laimests {
  chance: ChanceValue;
  emoji: () => string;
  multipliers: Record<number, number>;
}

const feniksLaimesti: Record<string, Laimests> = {
  varde: {
    chance: "*", // 0.28
    emoji: () => emoji("f_varde"),
    multipliers: {
      2: 0.05,
      3: 0.1,
      4: 0.3,
      5: 0.8,
    },
  },
  zoss: {
    chance: 0.19,
    emoji: () => emoji("f_zoss"),
    multipliers: {
      2: 0.1,
      3: 0.25,
      4: 0.75,
      5: 2,
    },
  },
  trolaseja: {
    chance: 0.15,
    emoji: () => emoji("f_trolaseja"),
    multipliers: {
      2: 0.5,
      3: 1.2,
      4: 3.5,
      5: 8,
    },
  },
  tjz: {
    chance: 0.12,
    emoji: () => emoji("f_tjz"),
    multipliers: {
      2: 1,
      3: 3,
      4: 7,
      5: 15,
    },
  },
  vacaps: {
    chance: 0.09,
    emoji: () => emoji("f_vacaps"),
    multipliers: {
      2: 2,
      3: 5,
      4: 12,
      5: 30,
    },
  },
  radio: {
    chance: 0.07,
    emoji: () => emoji("f_radio"),
    multipliers: {
      2: 4,
      3: 10,
      4: 25,
      5: 60,
    },
  },
  kabacis: {
    chance: 0.05,
    emoji: () => emoji("f_kabacis"),
    multipliers: {
      2: 6,
      3: 14,
      4: 32,
      5: 75,
    },
  },
  ulmanis: {
    chance: 0.035,
    emoji: () => emoji("f_ulmanis"),
    multipliers: {
      2: 10,
      3: 25,
      4: 60,
      5: 140,
    },
  },
  petnieks: {
    chance: 0.015,
    emoji: () => emoji("f_petnieks"),
    multipliers: {
      2: 15,
      3: 35,
      4: 80,
      5: 200,
    },
  },
};

export default feniksLaimesti;
