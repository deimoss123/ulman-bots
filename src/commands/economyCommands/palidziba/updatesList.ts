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
          'Atribūtu mantas ir unikālas viena no otras, tāpēc tās tiek parādītas atsevišķi inventārā\n\n',
        inline: false,
      },
      {
        name: '__**Mantu iedošana (/iedot)**__',
        value:
          'Tagad jebkuru mantu ir iespējams iedot citiem lietotājiem (samaksājot nodokli protams)\n' +
          'Ja mantai ir atribūti, tad to iedodot tie nekur nepazūd un paliek nemainīgi',
        inline: false,
      },
      {
        name: '__**Uzlabota /palīdzība komanda**__',
        value:
          'Tagad var apskatīt detalizētu aprakstu par jebkuru komandu (dažām komandām ir īss apraksts jo tās ir pašsaprotamas, piemēram, `/maks`)',
        inline: false,
      },
      {
        name: '__**/info komanda**__',
        value: 'Par **katru** mantu tagad ir iespējams apskatīties informāciju un aprakstu',
        inline: false,
      },
      {
        name: '__**Tirgus (/tirgus)**__',
        value:
          'Tirgus ir veikals kur var nopirkt īpašas un retas mantas\n' +
          'Tirgū katram lietotājam katru mantu ir iespējams tikai nopirkt vienu reizi katru dienu\n' +
          'Tirgū pieejamās mantas mainās katru dienu pusnaktī',
        inline: false,
      },
      {
        name: '__**Citas izmaiņas**__',
        value:
          '- `.bomžot` komanda ir aizvietota ar `/ubagot`\n' +
          '- `.statusi` komanda ir izņemta, statusus var redzēt ar komandu `/profils`\n' +
          '- Vakanču sistēma strādāšanai (`/vakances`)\n' +
          '- Lai strādātu vairs nav nepieciešams "vakcinēts" statuss, jo tāds vairs nepastāv\n' +
          '- `/pabalsts` tagad ir pieejams tikai OkDraudziņDauni servera biedriem\n\n' +
          '_**... ā un slīpsvītru (/) komandas protams :^)**_',
        inline: false,
      },
    ],
  },
};

export default updatesList;
