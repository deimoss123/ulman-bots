/*
'chance' nosaka randoma svaru
'*' svars ir vienāds ar (1 - <pārējo svaru summa>) / <'*' svaru daudzums>

piemērs 1:
svari ir 0.2, 0.3, '*'
svars '*' būs 0.5

piemērs 2:
svari ir 0.4, '*', '*'
svars katram '*' būs 0.3
*/
export interface ChanceObj {
  chance: number | '*'
  [key: string]: any
}

// ko atgriež chance funkcija
interface ChanceReturn {
  key: string
  obj: ChanceObj
}

// nejauši izvēlās kādu vērtību no chance objekta
// chance summa objektā nedrīkst pārsniegt 1
export default function chance(obj: Record<string, ChanceObj>): ChanceReturn {
  const randNum = Math.random()

  let result
  let sumChance = 0
  let starredArr = []

  for (const key in obj) {
    if (obj[key].chance !== '*') {
      sumChance += obj[key].chance as number
      if (randNum <= sumChance) {
        result = key
        break
      }
    } else starredArr.push(key)
  }

  if (!result) result = starredArr[Math.floor(Math.random() * starredArr.length)]

  return {
    key: result,
    obj: obj[result]
  }
}