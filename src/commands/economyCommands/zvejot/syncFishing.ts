import findUser from '../../../economy/findUser';
import setFishing from '../../../economy/setFishing';
import UserProfile, { FishObj, UserFishing } from '../../../interfaces/UserProfile';
import chance from '../../../items/helpers/chance';
import maksekeresData, { FishChance } from './makskeresData';
import { ZVEJOT_MIN_LEVEL } from './zvejot';

const ONE_HOUR = 3_600_000;

function generateFish(fishing: UserFishing, currentTime: number, overrideFish = false): FishObj[] {
  const fishList: FishObj[] = overrideFish ? [] : fishing.futureFishList || [];
  // const fishList: FishObj[] = overrideFish ? [] : [{ itemKey: 'asaris', time: 1664050459908 }] || [];
  const data = maksekeresData[fishing.selectedRod!];

  const startTime = overrideFish ? Date.now() : fishList.length ? fishList[fishList.length - 1].time : Date.now();
  let totalCost = overrideFish
    ? 0
    : fishList.length && fishList.reduce((prev, curr) => prev + data.fishChances[curr.itemKey].cost, 0);

  let lastTime = startTime;

  while (totalCost < fishing.usesLeft) {
    const fishChances = Object.fromEntries(
      Object.entries(data.fishChances).filter(([, obj]) => obj.cost <= fishing.usesLeft - totalCost)
    ) as FishChance;

    const { key, obj } = chance(fishChances);

    const timeForFish = Math.floor(
      (Math.random() * (data.timeMaxHours - data.timeMinHours) + data.timeMinHours) * ONE_HOUR
    );

    lastTime += timeForFish;
    fishList.push({ itemKey: key, time: lastTime });
    totalCost += obj.cost;
  }

  return fishList;
}

export function countFish(fish: UserFishing['caughtFishes']) {
  if (!fish || !Object.keys(fish).length) return 0;
  return Object.values(fish).reduce((prev, curr) => prev + curr, 0);
}

function calcCaughtFish(
  fishing: UserFishing,
  currentTime: number
): {
  usesLeft: number;
  futureFishList: FishObj[] | null;
  caughtFishes: UserFishing['caughtFishes'];
  lastCaughtFish: FishObj | null;
} {
  // eslint-disable-next-line prefer-const
  let { futureFishList, caughtFishes, maxCapacity, usesLeft, selectedRod, lastCaughtFish } = fishing;

  if (!futureFishList || !futureFishList?.length || futureFishList[0].time > currentTime) {
    return { futureFishList, caughtFishes, usesLeft, lastCaughtFish };
  }

  let count = countFish(caughtFishes);

  if (count >= maxCapacity || !usesLeft) {
    return { futureFishList: null, caughtFishes, usesLeft, lastCaughtFish };
  }

  if (!caughtFishes) caughtFishes = {};

  let amountToRemove = 0;

  for (const { itemKey, time } of futureFishList) {
    if (count++ === maxCapacity || !usesLeft) {
      return {
        futureFishList: null,
        caughtFishes,
        usesLeft,
        lastCaughtFish,
      };
    }

    if (time > currentTime) break;

    usesLeft -= maksekeresData[selectedRod!].fishChances[itemKey].cost;
    if (usesLeft < 0) usesLeft = 0; // jābūt piesardzīgam :^)

    amountToRemove++;
    caughtFishes[itemKey] = caughtFishes[itemKey] ? caughtFishes[itemKey] + 1 : 1;
  }

  const removedFish = futureFishList.splice(0, amountToRemove);
  if (removedFish.length) {
    lastCaughtFish = removedFish[removedFish.length - 1];
  }

  return {
    futureFishList,
    caughtFishes,
    usesLeft,
    lastCaughtFish,
  };
}

function shiftTime(futureFishList: FishObj[], shiftTime: number): FishObj[] {
  return futureFishList.map(obj => ({ ...obj, time: obj.time - shiftTime }));
}

export default async function syncFishing(
  userId: string,
  guildId: string,
  generateNewFish = false,
  overrideOldFish = false,
  shiftTimeMillis?: number
): Promise<UserProfile | void> {
  const user = await findUser(userId, guildId);
  if (!user || user.level < ZVEJOT_MIN_LEVEL) return;

  const { fishing } = user;
  if (!fishing.selectedRod) return user;

  const currentTime = Date.now();

  // eslint-disable-next-line prefer-const
  let { caughtFishes, futureFishList, usesLeft, lastCaughtFish } = calcCaughtFish(fishing, currentTime);

  if (generateNewFish) {
    futureFishList = generateFish(fishing, currentTime, overrideOldFish);
  }

  if (shiftTimeMillis && futureFishList) {
    futureFishList = shiftTime(futureFishList, shiftTimeMillis);
  }

  // newFishList.forEach(fish => console.log(fish, new Date(fish.time).toLocaleString()));

  return setFishing(userId, guildId, { caughtFishes, futureFishList, usesLeft, lastCaughtFish });
}
