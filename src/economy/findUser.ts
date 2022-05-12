import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';

export default async function findUser(
  userId: string
): Promise<UserProfile | undefined> {
  try {
    let result = await User.findOne({ userId });

    if (result) {
      return result as UserProfile;
    }

    const newUser = await new User({ userId });
    newUser.save();

    return newUser as UserProfile;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}