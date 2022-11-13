import { Message } from 'discord.js';
import izsolesMsgHandler from '../izsoles/izsolesMsgHandler';

export default function messageHandler(msg: Message) {
  if (!msg.content || msg.channelId !== process.env.API_CHANNEL) return;
  const [ping, apiCommand, ...content] = msg.content.split(/[ ]+/);

  if (ping !== `<@${msg.client.user.id}>` || !apiCommand) return;

  if (apiCommand.startsWith('auction')) izsolesMsgHandler(msg, apiCommand, content);
}
