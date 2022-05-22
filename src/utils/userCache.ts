import UserProfile from '../interfaces/UserProfile';
import { Snowflake } from 'discord.js';

/*
User cache glabā lietotāju ekonomijas informāciju
{
  '222631002265092096': <UserProfile>,
  <user_id>: <UserProfile>
}
*/
const userCache: Record<Snowflake, UserProfile> = {};

export default userCache;