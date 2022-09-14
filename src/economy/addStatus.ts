import UserProfile, { UserStatus, UserStatusName } from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';
import findUser from './findUser';

export default async function addStatus(
  userId: string,
  guildId: string,
  statusesToAdd: Partial<UserStatus>
): Promise<UserProfile | void> {
  try {
    if (!Object.keys(statusesToAdd).length) return;

    const user = await findUser(userId, guildId);
    if (!user) return;

    const { status } = user;

    const currentTime = Date.now();
    for (const st of Object.entries(statusesToAdd)) {
      const statusName = st[0] as UserStatusName;
      const statusTime = st[1];

      status[statusName] =
        status[statusName] < currentTime ? statusTime + currentTime : status[statusName] + statusTime;
    }

    const resUser = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { status } },
      { new: true }
    )) as UserProfile;

    userCache[guildId][userId] = resUser;

    return JSON.parse(JSON.stringify(resUser)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
