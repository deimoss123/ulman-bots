import { Message } from 'discord.js';
import adventeMsgHandler from '../advente/adventeMsgHandler';
import izsolesMsgHandler from '../izsoles/izsolesMsgHandler';

export default function messageHandler(msg: Message) {
  if (!msg.content || msg.channelId !== process.env.API_CHANNEL) return;
  const [ping, apiCommand, ...content] = msg.content.split(/[ ]+/);

  if (ping !== `<@${msg.client.user.id}>` || !apiCommand) return;

  if (apiCommand.startsWith('auction')) izsolesMsgHandler(msg, apiCommand, content);
  else if (apiCommand.startsWith('advente')) adventeMsgHandler(msg, apiCommand, content);
}
