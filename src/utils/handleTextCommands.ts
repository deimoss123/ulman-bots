import { EmbedBuilder, Message } from 'discord.js';

const oldTextCommandList: string[] = [
  'feniks',
  'fenikss',
  'fenka',
  'aparats',
  'griezt',
  'rulete',
  'rul',
  'inv',
  'i',
  'inventars',
  'jaunumi',
  'kasjauns',
  'maks',
  'm',
  'makste',
  'maksts',
  'palidziba',
  'help',
  'paliga',
  'statistika',
  'stats',
  'dati',
  'stati',
  'status',
  'statuss',
  'statusi',
  'top',
  'tops',
  'oligarhi',
  'zvejot',
  'makskeret',
  'copet',
  'cope',
  'zveja',
  'zivs',
  'zive',
  'zuvis',
  'zivjot',
  'veikals',
  'maksima',
  'maxima',
  'rimi',
  'bomzot',
  'bomzis',
  'izmantot',
  'lietot',
  'maksat',
  'parskaitit',
  'samaksat',
  'pabalsts',
  'pardot',
  'pirkt',
  'stradat',
  'darbs',
  'zagt',
  'apzagt',
];

export default function handleTextCommands(msg: Message) {
  const { content } = msg;
  if (!content || !content.startsWith('.')) return;

  const name = content
    .split(/[ ]+/)[0]
    .substring(1)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (oldTextCommandList.includes(name)) {
    msg
      .reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('UlmaņBots ir pārgājis uz slīpsvītru (/) komandām')
            .setColor(0x03fc9d)
            .setDescription(
              'Bet tie nav vienīgie jaunumi, ir arī izlaists lielākais atjauninājums līdz šim, ' +
                'ko vari apskatīt ar komandu `/palidziba jaunumi`, veiktas daudz izmaiņas, daudzi uzlabojumi, pievienotas jaunas mantas un komandas.\n\n' +
                'Ar šo atjauninājumu nāk arī __**ekonomijas resets**__, tiem kam šis ir pārsteigums, ' +
                'varat droši pievienoties OkDraudziņDauni serverim, kur var saņemt UlmaņBota paziņojumus laicīgi - <https://discord.gg/F4s5AwYTMy> \n' +
                'Šajā serverī ir visaktīvākie un draudzīgākie UlmaņBota lietotāji, kā arī vislielākā ekonomija.\n\n' +
                'Ja slīpsvītru (/) komandas nav parādījušās jūsu serverī, pievienojiet botu no jauna ar šo linku: \n' +
                '> <https://discord.com/api/oauth2/authorize?client_id=892747599143125022&permissions=262144&scope=bot%20applications.commands>\n' +
                'vai arī atverot bota profilu un uzspiežot uz pogas "Add to Server".\n\n' +
                'Ieteicams uzreiz aiziet pie servera iestatījumiem un iestatīt atsevišķu botu kanālu kur var izmantot komandas, citādāk komandas varēs izmantot jebkurā kanālā.\n' +
                '**Server Settings** > **Integrations** > **UlmaņBots**\n\n' +
                '_Paldies ka izmanto UlmaņBotu!_\n- Deimoss'
            ),
        ],
        allowedMentions: { users: [] },
      })
      .catch(_ => _);
  }
}
