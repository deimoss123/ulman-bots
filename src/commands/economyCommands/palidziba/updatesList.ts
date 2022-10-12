import { EmbedField } from 'discord.js';

const updatesList: Record<
  string,
  {
    date: string;
    description: string;
    fields: EmbedField[];
  }
> = {
  '4.0': {
    date: '14.10.2022',
    description:
      'Šis ir vislielākais UlmaņBota atjauninājums līdz šim, tika pārrakstīts viss bota kods no nulles, ' +
      'tādējādi ļaujot vienkāršāk pievienot jaunas sistēmas priekš turpmākiem atjauninājumiem, kā arī padarot kodu lasāmāku!!!\n\n' +
      '...Labi, bet man neinteresē (nāvi IT), kas ir jauns?',
    fields: [
      {
        name: '__**Līmeņu sistēma:**__',
        value:
          'Katram lietotājam tagad ir līmenis kuru paaugstina saņemot "UlmaņPunktus", jeb XP\n' +
          'Sasniedzot jaunu līmeni Tu vari saņemt latus, mantas un lietas kā nodokļu samazinājumus, un zvejošanas inventāra palielināšanu, kas paliek mūžīgi\n' +
          'UlmaņPunktus var iegūt dažādos veidos, bet primāri no strādāšanas, ubagošanas un zvejošanas\n' +
          'Savu līmeni var apskatīt ar komandu `/profils`, maksimālais līmenis ko pašlaik var sasniegt ir **40**',
        inline: false,
      },
      {
        name: '__**Mantu atribūti:**__',
        value:
          'Jauna mantu sistēma, kas atļauj īpašām mantām ar "atribūtiem" eksistēt\n' +
          'Atribūti var ietekmēt mantas funkcionalitāti to lietojot, tās izskatu, vai pat tās vērtību (piem. makšķeru izturība)\n' +
          'Atribūtu mantas ir unikālas viena no otras, tāpēc tās tiek parādītas atsevišķi inventārā\n\n' +
          '',
        inline: false,
      }, // TODO: pabeigt
    ],
  },
};

export default updatesList;
