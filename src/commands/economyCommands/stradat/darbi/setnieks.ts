import StradatInteractions from '../../../../interfaces/StradatInteraction';

const setnieks: StradatInteractions = {
  pietura: {
    chance: '*',
    text: 'Tu atrodies pie autobusa pieturas un redzi kā vīrietis uz zemes nomet plastmasas pudeli',
    options: [
      {
        label: 'Palūdz viņam lai savāc',
        customId: 'pietura_paludz_savakt',
        result: {
          a: {
            chance: '*',
            text: 'Viņš pacēla pudeli un neapmierināts iemeta miskastē',
            reward: { lati: [10, 15] },
          },
          b: {
            chance: 0.4,
            text: 'Viņš izvilka nazi, tev iedūra un aizskrēja prom',
            reward: null,
          },
        },
      },
      {
        label: 'Pacel pudeli un ieliec miskastē',
        customId: 'pietura_pacel_pudeli',
      },
      {
        label: 'Piekauj viņu',
        customId: 'pietura_piekauj',
      },
    ],
  },
};

export default setnieks;
