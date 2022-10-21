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
        label: 'Paprasīt "Paldies" karti',
        customId: 'kase_paldies_karte',
        result: {
          a: {
            chance: '*',
            text: 'Pircējam nebija "Paldies" karte',
            reward: { lati: [15, 25] },
          },
          b: {
            chance: '*',
            text: 'Pircējs izvilka "Paldies" karti un to iedeva tev',
            reward: { lati: [15, 25] },
          },
          c: {
            chance: '*',
            text: 'Pircējs tev paskaidroja ka jūs pašlaik atrodaties veikalā "Rimi"',
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
            text: 'Tevi pieķēra un aizsūtīja mājās',
            reward: null,
          },
        },
      },
      {
        label: 'Nozagt Latloto biļeti',
        customId: 'kase_latloto',
        result: {
          a: {
            chance: 0.2,
            text: 'Tev izdevās nozagt latloto biļeti',
            reward: { items: { latloto: 1 } },
          },
          b: {
            chance: '*',
            text: 'Tevi pieķēra un aizsūtīja mājās',
            reward: null,
          },
        },
      },
    ],
  },
  plaukti: {
    chance: '*',
    text: 'Tev šodien ir jākrāmē veikala plaukti',
    options: [
      {
        label: 'Ielikt plauktā preces',
        customId: 'plaukti_preces',
        result: {
          a: {
            chance: '*',
            text: 'Tu ieliki plauktā preces un saņēmi algu',
            reward: { lati: [15, 25] },
          },
        },
      },
      {
        label: 'No plaukta censties kaut ko nozagt',
        customId: 'plaukti_zagt',
        result: {
          a: {
            chance: '*',
            text: 'Tevi pieķēra un aizsūtīja mājās',
            reward: null,
          },
          b: {
            chance: 0.2,
            text: 'No plaukta tev izdevās nozagt rasenu',
            reward: { items: { zemenu_rasens: 1 } },
          },
          c: {
            chance: 0.1,
            text: 'No plaukta tev izdevās nozagt nazi',
            reward: { items: { nazis: 1 } },
          },
        },
      },
    ],
  },
  partraukums: {
    chance: 0.2,
    text: 'Tu pašlaik esi pusdienu pārtraukumā, šeit arī stāv kafijas aparāts',
    options: [
      {
        label: 'Godīgi paēst pusdienas',
        customId: 'partraukums_paest',
        result: {
          a: {
            chance: '*',
            text: 'Pusdienās tu apēdi burkānu salātus kas bija **mmmm** garšīgi',
            reward: null,
          },
        },
      },
      {
        label: 'Nozagt kafiju no aparāta',
        customId: 'partraukums_kafija',
        result: {
          a: {
            chance: 0.5,
            text: 'Tev izdevās nozagt kafiju, bet kolēģis uz tevi dīvaini paskatījās',
            reward: { items: { kafija: 1 } },
          },
          b: {
            chance: '*',
            text: 'Tu centies nozagt kafiju, bet nervozi to izlēji uz grīdas',
            reward: null,
          },
        },
      },
    ],
  },
  tualete: {
    chance: 0.2,
    text: 'Priekšniekam šodien ir slikts garastāvoklis un tev ir licis tīrīt darbinieku tualetes',
    options: [
      {
        label: 'Tīrīt tualeti',
        customId: 'tualete_tirit',
        result: {
          a: {
            chance: '*',
            text: 'Tu nelaimīgs iztīrīji tualetes podu',
            reward: { lati: [20, 30] },
          },
        },
      },
      {
        label: 'Pateikt priekšniekam "nē"',
        customId: 'tualete_atteikties',
        result: {
          a: {
            chance: '*',
            text: 'Priekšnieks tevi aizsūtīja mājās',
            reward: null,
          },
        },
      },
    ],
  },
};

export default veikala_darbinieks;
