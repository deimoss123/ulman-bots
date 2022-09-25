import UserProfile from '../interfaces/UserProfile';
import { Snowflake } from 'discord.js';

/*
User cache glabā lietotāju ekonomijas informāciju
{
  <guildId>: {
    <userId>: <UserProfile>
  }
}
*/
let userCache: Record<Snowflake, Record<Snowflake, UserProfile>> = {};

export function clearCache() {
  userCache = {};
}

export default userCache;
