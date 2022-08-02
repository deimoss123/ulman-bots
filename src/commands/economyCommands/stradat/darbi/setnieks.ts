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
            text: 'Viņš pacēla pudeli un neapmierināts to iemeta miskastē',
            reward: { lati: [10, 15] },
          },
          b: {
            chance: 0.2,
            text: 'Viņš izvilka nazi, tev iedūra un aizskrēja prom',
            reward: { items: { nazis: 1 } },
          },
        },
      },
    ],
  },
  plava: {
    chance: '*',
    text: 'Tu atrodies pļavā pie nomestas kartona kastes',
    options: [
      {
        label: 'Pacelt kasti',
        customId: 'plava_pacelt',
        result: {
          a: {
            chance: '*',
            text: 'Tu pacel kasti un aiznes to uz tuvāko miskasti',
            reward: { lati: [10, 15] },
          },
          b: {
            chance: '*',
            text: 'Tev iepatīkas šī kaste un tu to izdomāji aiznest mājās',
            reward: null, // TODO: kartona kaste
          },
          c: {
            chance: 0.3,
            text: 'Tu pacēli kasti, bet zem tās dzīvoja bomzis, viņš nav ļoti priecīgs un uzbļauj tev virsū',
            reward: { lati: [5, 20] },
          },
        },
      },
      {
        label: 'Iespert pa kasti',
        customId: 'plava_iespert',
        result: {
          a: {
            chance: '*',
            text: 'Tu iespēri pa kasti, bet nekas nenotika',
            reward: { lati: [5, 10] },
          },
          b: {
            chance: 0.3,
            text: 'Tu iespēri pa kasti, no tās izlīda bomzis un tevi piekāva',
            reward: null,
          },
        },
      },
    ],
  },
};

export default setnieks;
