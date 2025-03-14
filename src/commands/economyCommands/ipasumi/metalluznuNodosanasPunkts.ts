import {
  ActionRowBuilder,
  AttachmentBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  StringSelectMenuInteraction,
} from 'discord.js';
import { IpasumiState } from './ipasumi';
import embedTemplate from '../../../embeds/embedTemplate';
import UserProfile from '../../../interfaces/UserProfile';
import setUser from '../../../economy/setUser';
import findUser from '../../../economy/findUser';
import emoji from '../../../utils/emoji';
import { writeFile } from 'fs/promises';
import { Dialogs } from '../../../utils/Dialogs';
import mongoTransaction from '../../../utils/mongoTransaction';
import addLati from '../../../economy/addLati';
import intReply from '../../../utils/intReply';
import smallEmbed from '../../../embeds/smallEmbed';
import latiString from '../../../embeds/helpers/latiString';

const enum Config {
  INITIAL_TEMPERATURE = -20, // Starting temperature in Celsius
  GRANULE_HEAT_INCREASE = 5, // Temperature increase per granule
  TEMPERATURE_DECAY_PER_HOUR = 1, // Temperature loss per hour

  MIN_TEMPERATURE = -20,
  MAX_TEMPERATURE = 50,

  BASE_MAX_LATI = 1000,

  // Earnings curve parameters
  OPTIMAL_TEMPERATURE = 22, // Temperature with maximum earnings
  CURVE_STANDARD_DEVIATION = 15, // Controls the width of the normal distribution
  MAX_EARNING_RATE = 10, // Maximum earnings per hour at optimal temperature

  // MS_IN_ONE_HOUR = 3600000, // millis in one hour
  MS_IN_ONE_HOUR = 1000,
}

async function generateChartData() {
  const arr: [number, number][] = [];

  // reiz 10 citādāk peldošais punkts izjokos ar 0.1 + 0.2 = 0.30000000000000004
  for (let i = -200; i <= 500; i++) {
    arr.push([i / 10, calculateEarningRatePerHour(i / 10)]);
  }

  const obj = {
    OPTIMAL_TEMPERATURE: Config.OPTIMAL_TEMPERATURE,
    CURVE_STANDARD_DEVIATION: Config.CURVE_STANDARD_DEVIATION,
    MAX_EARNING_RATE: Config.MAX_EARNING_RATE,
    data: arr,
  };

  await writeFile('metalluznuNodosanasPunktsData.json', JSON.stringify(obj, null, 2), 'utf-8');
}

function calculateProfit(elapsedMs: number, lastTemp: number) {
  // veikt aprēķinu ik 6 minūtes
  // ja ir mazāk par 6 minūtēm (vai pēdējais solis), tad tiks izmantots atlikums
  const maxStepSizeMs = Config.MS_IN_ONE_HOUR / 10;

  let sum = 0;
  let diffence = elapsedMs;
  let newTemp = lastTemp;

  while (diffence > 0) {
    if (newTemp <= Config.MIN_TEMPERATURE) break;
    if (sum >= Config.BASE_MAX_LATI) break;

    const msUntilLowestTemp =
      (Math.abs(Config.MIN_TEMPERATURE - newTemp) / Config.TEMPERATURE_DECAY_PER_HOUR) * Config.MS_IN_ONE_HOUR;

    const step = Math.min(maxStepSizeMs, diffence, msUntilLowestTemp);
    // console.log({ step });

    sum += (step / Config.MS_IN_ONE_HOUR) * calculateEarningRatePerHour(newTemp);
    diffence -= step;
    newTemp -= calculateTemperatureDecay(step);
  }

  return sum;
}

function calculateEarningRatePerHour(temp: number): number {
  const a = Config.MAX_EARNING_RATE;
  const b = Config.OPTIMAL_TEMPERATURE;
  const c = Config.CURVE_STANDARD_DEVIATION;

  const exponent = -Math.pow(temp - b, 2) / (0.5 * Math.pow(c, 2));
  return a * Math.exp(exponent);
}

function calculateTemperatureDecay(elapsedMs: number): number {
  return (elapsedMs / Config.MS_IN_ONE_HOUR) * Config.TEMPERATURE_DECAY_PER_HOUR;
}

function getData(user: UserProfile) {
  const { currentLati, lastTemp, lastUpdateTime } = user.properties.metalluznuNodosanasPunkts;

  return {
    currentLati: Math.floor(currentLati),
    currentTemp: lastTemp,
    maxLati: Config.BASE_MAX_LATI,
  };
}

const enum UpdateAction {
  IemestGranulas,
  IznemtLatus,
}

async function updateDb(
  state: IpasumiState,
  action?: UpdateAction,
): Promise<{ ok: true; data: { user: UserProfile; latiToAdd: number } } | { ok: false }> {
  const { userId, guildId, user } = state;

  const currTime = Date.now();
  let { lastTemp, currentLati, lastUpdateTime } = user.properties.metalluznuNodosanasPunkts;

  const elapsedMs = currTime - lastUpdateTime;

  let newTemp =
    lastTemp <= Config.MIN_TEMPERATURE
      ? Config.MIN_TEMPERATURE
      : Math.max(Config.MIN_TEMPERATURE, lastTemp - calculateTemperatureDecay(elapsedMs));

  const profit = calculateProfit(elapsedMs, lastTemp);
  const newLati = Math.min(Config.BASE_MAX_LATI, currentLati + profit);

  if (action === UpdateAction.IemestGranulas) {
    newTemp += Config.GRANULE_HEAT_INCREASE;
  }

  const newProperties = {
    metalluznuNodosanasPunkts: {
      lastTemp: newTemp,
      lastUpdateTime: currTime,
      // atstājam nevis 0, bet newLati % 1, lai datubāzē paliktu latu decimālciparu atlikums
      // latus makā skaitam tikai veselos skaitļos
      currentLati: action === UpdateAction.IznemtLatus ? newLati % 1 : newLati,
    },
  };

  const latiToAdd = action === UpdateAction.IznemtLatus ? Math.floor(newLati) : 0;

  const { ok, values } = await mongoTransaction(session => {
    const arr = [() => setUser(userId, guildId, { properties: newProperties }, session)];

    if (action === UpdateAction.IznemtLatus) {
      arr.push(() => addLati(userId, guildId, latiToAdd, session));
    }

    return arr;
  });

  if (!ok) {
    return { ok: false };
  }

  // state.metalluznuNodosanasPunkts.chart = await generateEarningRateChart(newTemp);

  return { ok: true, data: { user: values.at(-1)!, latiToAdd } };
}

async function init(state: IpasumiState): Promise<{ ok: boolean }> {
  // if (state.user.properties.metalluznuNodosanasPunkts.lastUpdateTime === -1) {
  //   return { ok: true };
  // }

  // await generateChartData();

  const res = await updateDb(state);

  if (res.ok) {
    state.user = res.data.user;
  }

  return res;
}

type State = {
  chart: Buffer<ArrayBufferLike> | null;
};

function defaultState(): State {
  return {
    chart: null,
  };
}

const enum ComponentId {
  IznemtLatus = 'ipasumi_metalluznuNodosanasPunkts_withdraw',
  IemestGranulas = 'ipasumi_metalluznuNodosanasPunkts_granulas',
  Refresh = 'ipasumi_metalluznuNodosanasPunkts_refresh',
}

function view(state: IpasumiState, i: BaseInteraction) {
  const data = getData(state.user);

  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(
    new ButtonBuilder().setLabel(`Izņemt latus`).setStyle(ButtonStyle.Success).setCustomId(ComponentId.IznemtLatus),
  );

  row.addComponents(
    new ButtonBuilder()
      .setLabel(`Iemest granulas, +5°C`)
      .setStyle(ButtonStyle.Primary)
      .setCustomId(ComponentId.IemestGranulas)
      .setEmoji(emoji('granulas')),
  );

  row.addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(ComponentId.Refresh).setEmoji('🔄'),
  );

  return embedTemplate({
    i,
    title: 'Metāllūžņu nodošanas punkts',
    description:
      `Temperatūra: **${data.currentTemp.toFixed(1)}** °C\n` +
      `Lati: ${data.currentLati}/${data.maxLati}\n` +
      `Pašreizējā peļņa: ${calculateEarningRatePerHour(data.currentTemp)} lati/h\n\n` +
      '### test\ntest\ntest\n### test\ntest',
    fields: [
      { name: 'granulu katls', value: 'test', inline: false },
      { name: '-# granulu katls', value: 'test', inline: false },
    ],
    components: [row],
    files: state.metalluznuNodosanasPunkts.chart
      ? [new AttachmentBuilder(state.metalluznuNodosanasPunkts.chart, { name: 'granulu_katls_grafiks.png' })]
      : undefined,
    image: state.metalluznuNodosanasPunkts.chart ? 'attachment://granulu_katls_grafiks.png' : undefined,
  });
}

async function handler(
  i: ButtonInteraction | StringSelectMenuInteraction,
  state: IpasumiState,
): ReturnType<Parameters<Dialogs<IpasumiState>['onClick']>[0]> {
  if (!i.isButton()) return;

  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  state.user = user;

  if (i.customId === ComponentId.Refresh) {
    const res = await updateDb(state);
    if (!res.ok) return { error: true };

    state.user = res.data.user;

    return { update: true };
  }

  const itemInInv = state.user.items.find(({ name }) => name === 'granulas');

  if (i.customId === ComponentId.IznemtLatus) {
    const res = await updateDb(state, UpdateAction.IznemtLatus);
    if (!res.ok) return { error: true };

    state.user = res.data.user;

    intReply(
      i,
      smallEmbed(
        `${latiString(res.data.latiToAdd)} tika pievienoti tavam makam\n` +
          `Tev tagad ir ${latiString(res.data.user.lati)}`,
        0x000000,
      ),
    );

    return { edit: true };
  }

  if (i.customId === ComponentId.IemestGranulas) {
    const res = await updateDb(state, UpdateAction.IemestGranulas);
    if (!res.ok) return { error: true };

    state.user = res.data.user;

    return { update: true };
  }

  return;
}

export { init, State, defaultState, view, handler };
