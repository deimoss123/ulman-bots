import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';

export default async function setLati(userId: string, lati: number): Promise<UserProfile | undefined> {
  try {
    const res = await User.findOneAndUpdate({ userId }, { $set: { lati } }, { new: true });
    return res as UserProfile;
  } catch (e: any) {
    console.log(e.message, new Date().toString());
  }
}