import { ActivityType, Client, PresenceUpdateStatus } from 'discord.js';

export default function setBotPresence(client: Client) {
  client.user?.setActivity(`/palidziba | ${client.guilds.cache.size} serveros`, { type: ActivityType.Playing });
  client.user?.setPresence({ status: PresenceUpdateStatus.Online });
}
