import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function findUser(userId: string): Promise<UserProfile | undefined> {
  try {
    if (userCache?.[userId]) return JSON.parse(JSON.stringify(userCache[userId]));

    const result = (await User.findOne({ userId })) as UserProfile;

    if (result) {
      userCache[userId] = result;
      return JSON.parse(JSON.stringify(result));
    }

    const newUser = await new User({ userId });
    newUser.save();

    userCache[userId] = newUser as UserProfile;
    return JSON.parse(JSON.stringify(newUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
