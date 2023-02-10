const akcijasList = {
  latvijasPiens: {
    name: 'Latvijas Piens'
  },
  latvijasRadio: {
    name: 'Latvijas Radio',
  },
  martinsonaVelo: {
    name: 'Martinsona Velosipēdi'
  },
  bachaKazino: {
    name: 'Bahmaņa Kazino'
  },
} as const satisfies Record<string, { name: string }>

export type AkcijaId = keyof typeof akcijasList
export type AkcijaChartTimes = '2h' | '8h' | '24h' | '7d'

export default akcijasList