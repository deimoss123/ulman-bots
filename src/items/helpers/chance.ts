/*
'chance' nosaka svaru
'*' svars ir vienāds ar (1 - <pārējo svaru summa>) / <'*' svaru daudzums>

piemērs 1:
svari ir 0.2, 0.3, '*'
svars '*' būs 0.5

piemērs 2:
svari ir 0.4, '*', '*'
svars katram '*' būs 0.3
*/
export type ChanceValue = number | '*';

export interface ChanceObj {
  chance: ChanceValue;
  [key: string]: any;
}

// ko atgriež chance funkcija
interface ChanceReturn {
  key: string;
  obj: ChanceObj;
}

// objekts ar chance objektiem
export type ChanceRecord = Record<string, ChanceObj>;

// nejauši izvēlās kādu vērtību no chance objekta
// ! CHANCE SUMMA OBJEKTĀ NEDRĪKST PĀRSNIEGT 1 !
function chance(data: ChanceObj[]): ChanceObj;
function chance(data: ChanceRecord): ChanceReturn;
function chance(data: ChanceObj[] | ChanceRecord): ChanceObj | ChanceReturn {
  const randNum = Math.random();
  // svaru summa
  let sumChance = 0;

  // masīvs kas satur objektus ar '*' svaru
  const starredArr = [];

  // iziet cauri visiem svariem
  if (Array.isArray(data)) {
    let result: ChanceObj | null = null;

    for (const obj of data) {
      // ja svars ir '*' tas tiek pievienots starredArr
      if (obj.chance === '*') {
        starredArr.push(obj);
        continue;
      }

      // svaru summai tiek pievienots esošā objekta svars
      sumChance += obj.chance as number;

      // ja randNum ir mazāks vai vienāds par svaru summu tad tas tiek izvēlēts kā rezultāts
      if (randNum <= sumChance) {
        result = obj;
        break;
      }
    }
    //
    // ja netiek izvēlēts objets no objektiem kuru svars ir skaitlis,
    // tad nejauši tiek izvēlēts viens no objektiem ar '*' svaru
    if (!result) {
      result = starredArr[Math.floor(Math.random() * starredArr.length)];
    }

    return result;
  } else {
    let resultKey = '';

    for (const [key, obj] of Object.entries(data)) {
      // ja svars ir '*' tas tiek pievienots starredArr
      if (obj.chance === '*') {
        starredArr.push(key);
        continue;
      }

      // svaru summai tiek pievienots esošā objekta svars
      sumChance += obj.chance as number;

      // ja randNum ir mazāks vai vienāds par svaru summu tad tas tiek izvēlēts kā rezultāts
      if (randNum <= sumChance) {
        resultKey = key;
        break;
      }

      // ja netiek izvēlēts objets no objektiem kuru svars ir skaitlis,
      // tad nejauši tiek izvēlēts viens no objektiem ar '*' svaru
      if (!resultKey) {
        resultKey = starredArr[Math.floor(Math.random() * starredArr.length)];
      }
    }

    return {
      key: resultKey,
      obj: data[resultKey],
    };
  }
}

export default function chance2(obj: ChanceRecord): ChanceReturn {
  const randNum = Math.random();

  let result;

  // svaru summa
  let sumChance = 0;

  // masīvs kas satur objektus ar '*' svaru
  const starredArr = [];

  // iziet cauri visiem svariem
  for (const key in obj) {
    // ja svars ir '*' tas tiek pievienots starredArr
    if (obj[key].chance === '*') {
      starredArr.push(key);
      continue;
    }

    // svaru summai tiek pievienots esošā objekta svars
    sumChance += obj[key].chance as number;

    // ja randNum ir mazāks vai vienāds par svaru summu tad tas tiek izvēlēts kā rezultāts
    if (randNum <= sumChance) {
      result = key;
      break;
    }
  }

  // ja netiek izvēlēts objets no objektiem kuru svars ir skaitlis,
  // tad nejauši tiek izvēlēts viens no objektiem ar '*' svaru
  if (!result) result = starredArr[Math.floor(Math.random() * starredArr.length)];

  return {
    key: result,
    obj: obj[result],
  };
}
