import levelsList from './levelsList';

interface GetLevelReturn {
  excessXp: number;
  level: number;
}

export default function getLevel(currentXp: number) {
  let currentLevel = 0;
  let totalXp = currentXp;

  for (const levelInList of Object.entries(levelsList)) {
    const { xp } = levelInList[1];

    if (totalXp >= xp) {
      currentLevel++;
      totalXp -= xp;
    } else break;
  }

  return {
    excessXp: totalXp,
    level: currentLevel < 10 ? currentLevel : 9,
  };
}
