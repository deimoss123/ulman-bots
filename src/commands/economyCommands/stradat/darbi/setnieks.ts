import StradatInteractions from '../../../../interfaces/StradatInteraction';

const setnieks: StradatInteractions = {
  pietura: {
    chance: '*',
    text: 'Tu atrodies pie autobusa pieturas un redzi kā vīrietis uz zemes nomet stikla pudeli',
    options: [
      {
        label: 'Palūgt viņam lai savāc',
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
      {
        label: 'Pacelt pudeli un izmest miskastē',
        customId: 'pietura_pacelt',
        result: {
          a: {
            chance: '*',
            text: 'Tu pacel pudeli un to iemet miskastē',
            reward: { lati: [10, 20] },
          },
        },
      },
      {
        label: 'Ielikt pudeli mugursomā',
        customId: 'pietura_mugursoma',
        result: {
          a: {
            chance: '*',
            text: 'Tu ieliki pudeli mugursomā',
            reward: { items: { pudele: 1 } },
          },
          b: {
            chance: 0.3,
            text: 'Viņš bija neapmierināts ka tu centies nozagt viņa pudeli, bet tu paspēji aizskriet prom, un pa ceļam atradi vēlvienu pudeli',
            reward: { items: { pudele: 2 } },
          },
          c: {
            chance: 0.1,
            text: 'Viņš tevi piekāva par centienu nozagt viņa pudeli',
            reward: { lati: [5, 10] },
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
            reward: { items: { kartona_kaste: 1 } },
          },
          c: {
            chance: '*',
            text: 'Tu pacēli kasti, bet zem tās dzīvoja bomzis, viņš nav ļoti priecīgs un uzbļauj tev virsū',
            reward: { lati: [10, 20] },
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
            reward: { lati: [10, 20] },
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
  metalluzni: {
    chance: 0.2,
    text: 'Tu atrodies pie metāllūžņu izgāztuves sētas, pie tās ir uzraksts "Privātīpašums"',
    options: [
      {
        label: 'Kāp pāri sētai un zodz metāllūžņus',
        customId: 'metalluzni_zagt',
        result: {
          a: {
            chance: '*',
            text: 'Tu nozagi pāris metāllūžņus un laimīgs aizbēgi prom',
            reward: { items: { metalluznis: 3 } },
          },
          b: {
            chance: 0.2,
            text: 'Pārkāpjot pāri sētai tevi sakoda suns',
            reward: null,
          },
        },
      },
      {
        label: 'Atturies un paej garām',
        customId: 'metalluzni_attureties',
        result: {
          a: {
            chance: '*',
            text: 'Tu neapmierināts pagāji garām izgāztuvei',
            reward: null,
          },
        },
      },
    ],
  },
};

export default setnieks;
