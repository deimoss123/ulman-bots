const akcijasList = {
  latvijasPiens: {
    name: 'Latvijas Piens',
    color: 0x5fb1e8,
  },
  latvijasRadio: {
    name: 'Latvijas Radio',
    color: 0xf23844,
  },
  martinsonaVelo: {
    name: 'Martinsona Velosipēdi',
    color: 0xf2c83f,
  },
  bachaKazino: {
    name: 'Bahmaņa Kazino',
    color: 0xf56dfc,
  },
} as const satisfies Record<string, { name: string, color: number }>;

export type AkcijaId = keyof typeof akcijasList;
export type AkcijaChartTimes = '2h' | '8h' | '24h' | '7d';

export default akcijasList;