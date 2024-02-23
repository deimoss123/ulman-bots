// import axios from 'axios';
// import { createCanvas, loadImage, registerFont } from 'canvas';
// import itemList from '../items/itemList';
// import calendarRewards from './calendarRewards';

// const url = 'http://www.ulmanbots.lv';

export default async function generateCalendarImage(day: number): Promise<Buffer> {
  // registerFont('src/advente/Poppins-SemiBold.ttf', { family: 'Poppins' });

  // const canvas = createCanvas(1080, 1080);
  // const ctx = canvas.getContext('2d');

  // console.log('Advente - started fetching images');

  // // iegūt bildes
  // const [templateRes, overlayRes, questionRes, ...fetchedItemImages] = await Promise.all([
  //   axios.get(`${url}/images/advente/template.png`, {
  //     responseType: 'arraybuffer',
  //   }),
  //   axios.get(`${url}/images/advente/overlay${day <= 24 ? `-${day}` : ''}.png`, {
  //     responseType: 'arraybuffer',
  //   }),
  //   axios.get(`${url}/images/advente/question-mark.png`, {
  //     responseType: 'arraybuffer',
  //   }),
  //   ...Object.values(calendarRewards)
  //     .filter((_, i) => i + 1 <= day)
  //     .map(reward =>
  //       'item' in reward ? axios.get(itemList[reward.item].imgLink!, { responseType: 'arraybuffer' }) : null
  //     ),
  // ]);

  // console.log('Advente - fetched images');

  // // uzzimēt fonu
  // ctx.drawImage(await loadImage(templateRes.data), 0, 0, 1080, 1080);

  // ctx.fillStyle = 'white';

  // // sazīmēt dāvanas
  // for (let i = 0; i < 24; i++) {
  //   const x = 20 + (i % 6) * 180 + 5;
  //   const y = 373 + Math.floor(i / 6) * 180 + 5;

  //   if (i + 1 > day) {
  //     ctx.drawImage(await loadImage(questionRes.data), x + 15, y + 15, 100, 100);
  //     continue;
  //   }

  //   const reward = calendarRewards[`${i + 1}`];
  //   if ('item' in reward) {
  //     ctx.drawImage(await loadImage(fetchedItemImages[i]!.data), x, y, 130, 130);
  //     ctx.font = '36px Poppins';
  //     ctx.textAlign = 'left';
  //     ctx.lineWidth = 6;
  //     ctx.strokeText(`${reward.amount}x`, x + 5, y + 35);
  //     ctx.fillText(`${reward.amount}x`, x + 5, y + 35);
  //   } else {
  //     ctx.font = '40px Poppins';
  //     ctx.textAlign = 'center';
  //     ctx.fillText(`${reward.lati}`, x + 65, y + 60, 140);
  //     ctx.fillText('lati', x + 65, y + 100, 140);
  //   }
  // }

  // // uzzimēt overlay
  // ctx.drawImage(await loadImage(overlayRes.data), 0, 0, 1080, 1080);

  // console.log('Advente - generated calendar image');
  // return canvas.toBuffer();

  // pagaidām šādi, jo canvasu nevar ar Bun ieinstalēt, un advente vispār nestrādā
  // tiek atgriezsts bufferis lai TS nebļauj
  return new Promise(r => r(Buffer.from('')));
}
