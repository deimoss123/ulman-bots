import User from '../schemas/User';
import UserProfile from '../interfaces/UserProfile';
import userCache from '../utils/userCache';
import findUser from './findUser';
import levelsList, { LevelReward, MAX_LEVEL, MAX_LEVEL_REWARD_PER_XP } from '../levelingSystem/levelsList';
import addItems from './addItems';

interface CalcLevelReturn {
  levelHasIncreased: boolean;
  newLevel?: number;
  rewards?: LevelReward[];

  maxLevelReward?: number;

  excessXp: number;
}

function calcLevel(
  currentLevel: number,
  excessXp: number,

  nextLevel = currentLevel,
  rewards: LevelReward[] = []
): CalcLevelReturn {
  const levelHasIncreased = currentLevel !== nextLevel;

  // pārbauda vai nav sasniegts max līmenis
  if (nextLevel === MAX_LEVEL) {
    // līmenis palielinājies un sasniedzis max līmeni
    if (levelHasIncreased) {
      return {
        levelHasIncreased: true,
        newLevel: nextLevel,
        rewards,
        maxLevelReward: excessXp * MAX_LEVEL_REWARD_PER_XP,
        excessXp,
      };
    }

    // līmenis jau bija max
    return {
      levelHasIncreased: false,
      maxLevelReward: excessXp * MAX_LEVEL_REWARD_PER_XP,
      excessXp,
    };
  }

  const nextLevelInList = levelsList[nextLevel + 1];
  if (excessXp >= nextLevelInList.xp) {
    return calcLevel(currentLevel, excessXp - nextLevelInList.xp, nextLevel + 1, [...rewards, nextLevelInList.reward]);
  }

  // palielinās līmenis, bet nav sasniegts max līmenis
  if (levelHasIncreased) {
    return {
      levelHasIncreased: true,
      newLevel: nextLevel,
      rewards,
      excessXp,
    };
  }

  // līmenis nepalielinās
  return {
    levelHasIncreased: false,
    excessXp,
  };
}

export interface AddXpReturn {
  user: UserProfile;
  levelIncrease: null | {
    from: number;
    to: number;
    rewards: LevelReward[];
  };
  excessXp: number;
  maxLevelReward: null | number; // ja sasniedzis maksimālo līmeni tad liekus xp dod latus
}

export default async function addXp(userId: string, guildId: string, xpToAdd: number): Promise<AddXpReturn | void> {
  try {
    const user = await findUser(userId, guildId);
    if (!user) return;

    const oldLevel = user.level;

    // drošībai
    if (user.level > MAX_LEVEL) user.level = MAX_LEVEL;

    const calcRes = calcLevel(user.level, user.xp + xpToAdd);

    user.xp = calcRes.excessXp;

    if (calcRes.levelHasIncreased) {
      user.level = calcRes.newLevel!;
      for (const reward of calcRes.rewards!) {
        if (reward.lati) {
          user.lati += reward.lati;
        }
        if (reward.item) {
          // ideāli būtu neveikt velvienu datubāzes pieprasījumu bet addItems ir daudz loģika un šis ir vieglāk
          const res = await addItems(userId, guildId, reward.item);
          if (res) user.items = res.items;
        }
        if (reward.taxDiscount) {
          const { payTax, giveTax } = reward.taxDiscount;
          if (payTax) user.payTax = payTax;
          if (giveTax) user.giveTax = giveTax;
        }
        if (reward.fishingInvIncrease) {
          user.fishing.maxCapacity = reward.fishingInvIncrease;
        }
      }
    }

    if (calcRes.maxLevelReward) {
      user.lati += calcRes.maxLevelReward;
      user.xp = 0;
    }

    const resUser = await User.findOneAndUpdate({ userId, guildId }, { ...user }, { new: true });

    userCache[guildId][userId] = resUser as UserProfile;
    return {
      user: JSON.parse(JSON.stringify(user)),
      levelIncrease: calcRes.levelHasIncreased ? { from: oldLevel, to: user.level, rewards: calcRes.rewards! } : null,
      maxLevelReward: calcRes.maxLevelReward || null,
      excessXp: calcRes.excessXp,
    };
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
