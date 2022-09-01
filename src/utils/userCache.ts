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
const userCache: Record<Snowflake, Record<Snowflake, UserProfile>> = {};

export default userCache;
