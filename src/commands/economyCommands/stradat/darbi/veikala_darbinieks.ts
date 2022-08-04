import StradatInteractions from '../../../../interfaces/StradatInteraction';

const veikala_darbinieks: StradatInteractions = {
  kase: {
    chance: '*',
    text: 'Tu apkalpo klientus pie kases',
    options: [
      {
        label: 'Skenēt preces',
        customId: 'kase_skenet',
        result: {
          a: {
            chance: '*',
            text: 'Tu noskenēji preces un saņēmi algu',
            reward: { lati: [15, 25] },
          },
        },
      },
      {
        label: 'Paprasīt vai pircējam ir "Paldies" karte',
        customId: 'kase_paldies_karte',
        result: {
          a: {
            chance: '*',
            text: 'Pircējam nebija "Paldies" karte',
            reward: { lati: [15, 25] },
          },
          b: {
            chance: '*',
            text: 'Pircējs izvilka "Paldies" karti un iedeva tev',
            reward: { lati: [15, 25] },
          },
        },
      },
      {
        label: 'No kases aparāta nozagt naudu',
        customId: 'kase_zagt',
        result: {
          a: {
            chance: 0.3,
            text: 'Tev izdevās nozagt nedaudz naudu',
            reward: { lati: [50, 70] },
          },
          b: {
            chance: '*',
            text: 'Tevi pieķēra',
            reward: null,
          },
        },
      },
    ],
  },
};

export default veikala_darbinieks;
