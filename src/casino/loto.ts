import chance, { ChanceRecord } from '../items/helpers/chance';
import UsableItemReturn from '../interfaces/UsableItemReturn';
import addLati from '../economy/addLati';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testLaimesti(laimesti: ChanceRecord) {
  let total = 0;
  const count = 100000;
  for (let i = 0; i < count; i++) {
    const test = chance(laimesti);
    total += test.obj.reward;
  }
  console.log(total / count);
}

export default async function loto(userId: string, guildId: string, laimesti: ChanceRecord): Promise<UsableItemReturn> {
  const res = chance(laimesti);

  // testLaimesti(laimesti)

  await addLati(userId, guildId, res.obj.reward);

  let text = 'Tu neko nelaimēji :(';
  if (res.key !== 'lose') {
    text = `Tu laimēji ${res.obj.name} laimestu - **${res.obj.reward}** latus!`;
  }

  return { text, color: res.obj.color };
}
