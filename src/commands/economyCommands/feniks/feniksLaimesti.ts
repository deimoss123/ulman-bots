import { ChanceValue } from '../../../items/helpers/chance';

interface Laimests {
  chance: ChanceValue;
  multiplier: number;
  emoji: {
    noBorder: string;
    allBorder: string;
    leftBorder: string;
    midBorder: string;
    rightBorder: string;
  };
  variations: number[];
}

const feniksLaimesti: Record<string, Laimests> = {
  varde: {
    chance: '*',
    multiplier: 0.05,
    emoji: {
      noBorder: '<:f_varde:1013586155117219970>',
      allBorder: '<:f_varde_ab:1013586204987510974>',
      leftBorder: '<:f_varde_lb:1013586238755848232>',
      midBorder: '<:f_varde_mb:1013586269244239952>',
      rightBorder: '<:f_varde_rb:1013586298520477777>',
    },
    variations: [1, 3, 5],
  },
  zoss: {
    chance: 0.2,
    multiplier: 0.1,
    emoji: {
      noBorder: '<:f_zoss:1013570309745561692>',
      allBorder: '<:f_zoss_ab:1013586206224830505>',
      leftBorder: '<:f_zoss_lb:1013586240240619610>',
      midBorder: '<:f_zoss_mb:1013586270682890300>',
      rightBorder: '<:f_zoss_rb:1013586299875229707>',
    },
    variations: [2, 4, 6],
  },
  trolaseja: {
    chance: 0.15,
    multiplier: 0.2,
    emoji: {
      noBorder: '<:f_trolaseja:1013586153603072101>',
      allBorder: '<:f_trolaseja_ab:1013586203288801280>',
      leftBorder: '<:f_trolaseja_lb:1013586237061333012>',
      midBorder: '<:f_trolaseja_mb:1013586267147087902>',
      rightBorder: '<:f_trolaseja_rb:1013586297467719841>',
    },
    variations: [2, 3, 6],
  },
  tjz: {
    chance: 0.1,
    multiplier: 0.3,
    emoji: {
      noBorder: '<:f_tjz:1013563347691634739>',
      allBorder: '<:f_tjz_ab:1013563306591670343>',
      leftBorder: '<:f_tjz_lb:1013563273439871036>',
      midBorder: '<:f_tjz_mb:1013563244532744202>',
      rightBorder: '<:f_tjz_rb:1013563214149197884>',
    },
    variations: [2, 4],
  },
  vacaps: {
    chance: 0.07,
    multiplier: 0.5,
    emoji: {
      noBorder: '<:f_vacaps:1013563349365170277>',
      allBorder: '<:f_vacaps_ab:1013563308156145714>',
      leftBorder: '<:f_vacaps_lb:1013563274727530556>',
      midBorder: '<:f_vacaps_mb:1013563245925244959>',
      rightBorder: '<:f_vacaps_rb:1013563215835304116>',
    },
    variations: [2, 4],
  },
  radio: {
    chance: 0.03,
    multiplier: 1,
    emoji: {
      noBorder: '<:f_radio:1013563346554990613>',
      allBorder: '<:f_radio_ab:1013563305048154153>',
      leftBorder: '<:f_radio_lb:1013563271267233822>',
      midBorder: '<:f_radio_mb:1013563243316379788>',
      rightBorder: '<:f_radio_rb:1013563212618276945>',
    },
    variations: [3, 6],
  },
  kabacis: {
    chance: 0.01,
    multiplier: 3,
    emoji: {
      noBorder: '<:f_kabacis:1013548145591988224>',
      allBorder: '<:f_kabacis_ab:1013548169239474398>',
      leftBorder: '<:f_kabacis_lb:1013548209555128420>',
      midBorder: '<:f_kabacis_mb:1013548230182707380>',
      rightBorder: '<:f_kabacis_rb:1013548256296435762>',
    },
    variations: [1, 2, 3],
  },
  ulmanis: {
    chance: 0.007,
    multiplier: 5,
    emoji: {
      noBorder: '<a:f_ulmanis:1013513084654067893>',
      allBorder: '<a:f_ulmanis_ab:1013513010620416010>',
      leftBorder: '<a:f_ulmanis_lb:1013513035467456652>',
      midBorder: '<a:f_ulmanis_mb:1013513062281662484>',
      rightBorder: '<a:f_ulmanis_rb:1013513119508738118>',
    },
    variations: [1, 2, 3],
  },
  petnieks: {
    chance: 0.002,
    multiplier: 10,
    emoji: {
      noBorder: '<a:f_petnieks:1013477350027042938>',
      allBorder: '<a:f_petnieks_ab:1013477458013585458>',
      leftBorder: '<a:f_petnieks_lb:1013477375851380837>',
      midBorder: '<a:f_petnieks_mb:1013477402661363772>',
      rightBorder: '<a:f_petnieks_rb:1013477427483263056>',
    },
    variations: [1, 2, 3],
  },
};

export default feniksLaimesti;
