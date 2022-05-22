import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function findUser(
  userId: string,
): Promise<UserProfile | undefined> {
  try {
    if (userCache?.[userId]) return userCache[userId];

    let result = await User.findOne({ userId }) as UserProfile;

    if (result) {
      userCache[userId] = result;
      return result;
    }

    const newUser = await new User({ userId });
    newUser.save();

    userCache[userId] = newUser as UserProfile;
    return newUser as UserProfile;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}