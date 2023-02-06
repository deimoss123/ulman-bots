import axios from 'axios';
import { AttachmentBuilder } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import Command from '../../../interfaces/Command';
import intReply from '../../../utils/intReply';

const akcijas: Command = {
  description: 'Akcijas',
  color: commandColors.maks,
  data: {
    name: 'akcijas',
    description: 'Akcijas',
  },
  async run(i) {
    // const img = await axios.get(`${process.env.ULMANBOTS_API_URL}/api/akcijas/get-image`, {
    //   responseType: 'arraybuffer',
    // });

    // const attachment = new AttachmentBuilder();

    intReply(i, 'akcijas');
  },
};

export default akcijas;
