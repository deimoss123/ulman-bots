import StradatInteractions from '../../../../interfaces/StradatInteraction';

const automehanikis: StradatInteractions = {
  atputa: {
    chance: '*',
    text: 'Tu šobrīd atpūties atpūtas telpā.',
    options: [
      {
        label: 'Godīgi atpūties',
        customId: 'telpa_atpusties',
        result: {
          a: {
            chance: '*',
            text: 'Tu godīgi atpūties.',
            reward: null,
          },
        },
      },
      {
        label: 'Mēģināt nozagt sava kolēģa roltonu.',
        customId: 'roltons_zagt',
        result: {
          a: {
            chance: '*',
            text: 'Kolēģis tevi pieķēra un pasūdzējas menedžerim... tevi aizsūtija mājās.',
            reward: null,
          },
          b: {
            chance: 0.2,
            text: 'Tev izdevās nozagt roltonu no sava kolēģa.',
            reward: { items: { roltons: 1 } },
          },
        },
      },
    ],
  },
  masina: {
    chance: '*',
    text: 'Tev ir jālabo klienta mašīna.',
    options: [
      {
        label: 'Salabo mašīnu',
        customId: 'masina_labot',
        result: {
          a: {
            chance: '*',
            text: 'Tu salaboji mašīnu.',
            reward: { lati: [35, 45] },
          },
          b: {
            chance: 0.05,
            text: 'Kaut kādā veidā tu ieliki motoru otrādāk un priekšnieks uz tevis sabļāva!',
            reward: null,
          },
        },
      },
      {
        label: 'Mēģini no mašīnas kaut ko nočiept',
        customId: 'masina_zagt',
        result: {
          a: {
            chance: '*',
            text: 'Tevi pieķēra un tev pa galvu iemeta ar uzgriežņu atslēgu.',
            reward: null,
          },
          b: {
            chance: 0.3,
            text: 'Klients tevi pieķēra un sāka tev dzīties pakaļ, bet kamēr muki paspēji no kolēģa rokām paķert kafiju!',
            reward: { items: { kafija: 1 } },
          },
          c: {
            chance: 0.2,
            text: 'No klienta mašīnas nočiepi akumulatoru.',
            reward: { items: { akumulators: 1 } },
          },
        },
      },
    ],
  },
  riepas: {
    chance: '*',
    text: 'Tev šodien ir slikts garastāvoklis un klientam vajag samainīt mašīnas riepas.',
    options: [
      {
        label: 'Nomainīt riepas',
        customId: 'masina_riepas',
        result: {
          a: {
            chance: '*',
            text: 'Tu samainīji mašīnas riepas',
            reward: { lati: [35, 45] },
          },
          b: {
            chance: 0.1,
            text: 'Tu klientam uzliki nepareizās riepas un viņs atteicās maksāt. Priekšnieks nebija apmierināts un pieskubināja tev sadurt tās riepas',
            reward: { items: { nazis: 1 } },
          },
        },
      },
      {
        label: 'Atteikties',
        customId: 'masina_atteikties',
        result: {
          a: {
            chance: '*',
            text: 'Tu atteicies strādāt.',
            reward: null,
          },
        },
      },
    ],
  },
  motors: {
    chance: '*',
    text: 'Klientam trūkst cilindrs un tev tas jāsalabo.',
    options: [
      {
        label: 'Ielikt jaunu cilindru',
        customId: 'masina_cilindrs',
        result: {
          a: {
            chance: '*',
            text: 'Tu klientam nomainīji cilindru.',
            reward: { lati: [35, 50] },
          },
        },
      },
      {
        label: 'Ielikt vecu cilindru',
        customId: 'masina_vecs_cilindrs',
        result: {
          a: {
            chance: '*',
            text: 'Klients bija nezinošs par mašīnām, tādēļ neko nepamanīja.',
            reward: { lati: [40, 50] },
          },
          b: {
            chance: 0.2,
            text: 'Klients bija zinošs par mašīnām un devās prom.',
            reward: null,
          },
        },
      },
    ],
  },
};

export default automehanikis;
