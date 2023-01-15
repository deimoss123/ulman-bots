const akcijasList = {
  latvijasPiens: {
    name: 'Latvijas Piens'
  },
  martinsonaVelo: {
    name: 'Martinsona Velosipēdi'
  },
  bachaKazino: {
    name: 'Bahmaņa Kazino'
  },
} as const satisfies Record<string, { name: string }>

export type AkcijaId = keyof typeof akcijasList

export default akcijasList