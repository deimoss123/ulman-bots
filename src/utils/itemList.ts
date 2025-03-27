/* eslint-disable func-names */
import Item from "@/types/Item";
import virve from "@/items/virve";
import koka_makskere from "@/items/koka_makskere";
import divaina_makskere from "@/items/divaina_makskere";
import loto_makskere from "@/items/loto_makskere";
import luznu_makskere from "@/items/luznu_makskere";
import dizmakskere from "@/items/dizmakskere";
import avene from "@/items/avene";
import mellene from "@/items/mellene";
import vinoga from "@/items/vinoga";
import zemene from "@/items/zemene";
import janoga from "@/items/janoga";
import latloto from "@/items/latloto";
import dizloto from "@/items/dizloto";
import nabagloto from "@/items/nabagloto";
import ulmanloto from "@/items/ulmanloto";
import nazis from "@/items/nazis";
import zemenu_rasens from "@/items/zemenu_rasens";
import juridiska_zivs from "@/items/juridiska_zivs";
import petniekzivs from "@/items/petniekzivs";
import divaina_zivs from "@/items/divaina_zivs";
import brivgriez10 from "@/items/brivgriez10";
import brivgriez25 from "@/items/brivgriez25";
import brivgriez50 from "@/items/brivgriez50";
import brivgriez100 from "@/items/brivgriez100";
import velosipeds from "@/items/velosipeds";
import velo_ramis from "@/items/velo_ramis";
import velo_ritenis from "@/items/velo_ritenis";
import velo_kede from "@/items/velo_kede";
import velo_sture from "@/items/velo_sture";
import divainais_burkans from "@/items/divainais_burkans";
import kakis from "@/items/kakis";
import ogu_krums from "@/items/ogu_krums";
import petnieks from "@/items/petnieks";
import loto_zivs from "@/items/loto_zivs";
import kafijas_aparats from "@/items/kafijas_aparats";
import naudas_maiss from "@/items/naudas_maiss";
import gazes_plits from "@/items/gazes_plits";
import divaina_mugursoma from "@/items/divaina_mugursoma";
import mugursoma from "@/items/mugursoma";
import ievarijums from "@/items/ievarijums";
import kafija from "@/items/kafija";
import piena_spainis from "@/items/piena_spainis";
import smilsu_pulkstenis from "@/items/smilsu_pulkstenis";
import kruma_sekla from "@/items/kruma_sekla";
import piparkuka from "@/items/piparkuka";
import kaku_bariba from "@/items/kaku_bariba";
import granulas from "@/items/granulas";
import kartona_kaste from "@/items/kartona_kaste";
import pudele from "@/items/pudele";
import metalluznis from "@/items/metalluznis";
import lidaka from "@/items/lidaka";
import cepta_lidaka from "@/items/cepta_lidaka";
import asaris from "@/items/asaris";
import cepts_asaris from "@/items/cepts_asaris";
import lasis from "@/items/lasis";
import cepts_lasis from "@/items/cepts_lasis";
import kaka_parsaucejs from "@/items/kaka_parsaucejs";
import patriota_piespraude from "@/items/patriota_piespraude";
import salaveca_cepure from "@/items/salaveca_cepure";

export type ItemKey = string;

export type DiscountedItems = Record<ItemKey, number>;

// TODO: dinamiski importi
const itemList: { [key: ItemKey]: Item } = {
  koka_makskere,
  latloto,
  nazis,
  virve,
  zemenu_rasens,
  divainais_burkans,
  dizloto,
  divaina_makskere,
  mugursoma,
  piena_spainis,
  kaku_bariba,
  granulas,
  divaina_mugursoma,
  kafijas_aparats,
  petnieks,
  loto_makskere,
  luznu_makskere,
  naudas_maiss,
  kakis,
  gazes_plits,

  kartona_kaste,
  pudele,
  metalluznis,
  lidaka,
  cepta_lidaka,
  asaris,
  cepts_asaris,
  lasis,
  cepts_lasis,

  loto_zivs,
  juridiska_zivs,
  divaina_zivs,
  petniekzivs,

  // -- velosipēds --
  velosipeds,
  velo_ramis,
  velo_ritenis,
  velo_kede,
  velo_sture,

  // -- citas mantas --
  kafija,

  dizmakskere,
  smilsu_pulkstenis,
  kaka_parsaucejs,
  piparkuka,
  nabagloto,
  ulmanloto,

  avene,
  mellene,
  vinoga,
  zemene,
  janoga,

  kruma_sekla,

  // prettier-ignore
  ogu_krums,

  // prettier-ignore
  ievarijums,

  // granulu katls
  // cena 5700 lati

  // TODO: noņemt
  patriota_piespraude,

  // -- brīvgriezieni --
  brivgriez10,
  brivgriez25,
  brivgriez50,
  brivgriez100,

  // -- ziemassvētku mantas --
  salaveca_cepure,
};

export default itemList;
