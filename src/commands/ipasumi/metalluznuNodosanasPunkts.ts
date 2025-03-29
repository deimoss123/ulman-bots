import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, resolveColor } from "discord.js";
import { IpasumiState } from "@/commands/ipasumi/ipasumi";
import mainEmbed from "@/utils/embeds/mainEmbed";
import UserProfile from "@/types/UserProfile";
import setUser from "@/db/setUser";
import findUser from "@/db/findUser";
import emoji from "@/utils/emoji";
import { writeFile, readFile } from "fs/promises";
import { Dialogs, DialogsViewFunc } from "@/utils/dialogs";
import mongoTransaction from "@/utils/mongoTransaction";
import addLati from "@/db/addLati";
import intReply from "@/utils/intReply";
import smallEmbed from "@/utils/embeds/smallEmbed";
import latiString from "@/utils/strings/latiString";
import { Canvas, createCanvas, GlobalFonts, SKRSContext2D } from "@napi-rs/canvas";
import { join } from "path";

const fontPath = join(__dirname, "..", "..", "..", "assets", "fonts");

// fontos beigās 2, lai pārliecinātos, ka izmanto ielādētos, nevis sistēmas
GlobalFonts.registerFromPath(join(fontPath, "Inter-VariableFont_opsz,wght.ttf"), "Inter2");

// gatavo json datu tips
interface MetalluznuData {
  OPTIMAL_TEMPERATURE: number;
  CURVE_STANDARD_DEVIATION: number;
  MAX_EARNING_RATE: number;
  data: [number, number][];
}

// iegūst iepriekš ģenerētos līknes datus zīmēšanai
const jsonData = JSON.parse(await readFile("metalluznuNodosanasPunktsData.json", "utf-8")) as MetalluznuData;

const enum Config {
  INITIAL_TEMPERATURE = -20, // sākuma temperatūra
  GRANULE_HEAT_INCREASE = 15, // par cik grādiem 1 granula palielina temperatūru
  TEMPERATURE_DECAY_PER_HOUR = 1, // temperatūras zudums katru stundu

  MIN_TEMPERATURE = -20,
  MAX_TEMPERATURE = 50,

  BASE_MAX_LATI = 1000, // bāzes maksimālais latu skaits

  // normālsadalījuma iestatījumi
  OPTIMAL_TEMPERATURE = 22, // līknes virsotne (lielākā peļņa)
  CURVE_STANDARD_DEVIATION = 15,
  MAX_EARNING_RATE = 10, // maksimālā peļņa optimālajā temperatūrā

  // MS_IN_ONE_HOUR = 3600000, // milisekundes stundā
  MS_IN_ONE_HOUR = 1000, // testēšanai
}

// ģenerē statiskos datus json failā, lai līknes dati nebūtu jāģenerē katru reizi zīmējot grafiku
async function generateChartData() {
  const arr: [number, number][] = [];

  // reiz 10 citādāk peldošais punkts izjokos ar 0.1 + 0.2 = 0.30000000000000004
  for (let i = -20; i <= 50; i++) {
    arr.push([i / 1, calculateEarningRatePerHour(i / 1)]);
  }

  const obj: MetalluznuData = {
    OPTIMAL_TEMPERATURE: Config.OPTIMAL_TEMPERATURE,
    CURVE_STANDARD_DEVIATION: Config.CURVE_STANDARD_DEVIATION,
    MAX_EARNING_RATE: Config.MAX_EARNING_RATE,
    data: arr,
  };

  await writeFile("metalluznuNodosanasPunktsData.json", JSON.stringify(obj, null, 2), "utf-8");
}

// tips charta novietojumam iekš canvasa
interface ChartArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// globālie mainīgie statiskajam canvasam
let staticCanvas: Canvas | null = null;
let staticCtx: SKRSContext2D | null = null;
let isStaticCanvasInitialized = false;
let chartArea: ChartArea | null = null;

const chartConfig = {
  // bildes beigu izmērs
  // (charta izmērs tiek aprēķināts atkarībā no pārējiem mainīgajiem)
  width: 600,
  height: 300,

  fontFamily: "Inter2",
  labelFontSize: 22,
  tickFontSize: 16,

  tickLength: 8,
  tickLabelGap: 4, // distance starp ticku un ticka tekstu
  axisLabelGap: 8, // distance starp ticka tekstu un axis labelu

  /*
   * ──┬────┬────┬────┬────┬───┬──
   *   │    │    │    │    │   │   <-- tickLength
   *                               <-- tickLabelGap
   *   0    5    10   15   20  25  <-- tickFontSize
   *                               <-- axisLabelGap
   *        Temperatūra, °C        <-- labelFontSize
   *                               <-- padding.bottom
   * -------(attēla apakša)-------
   */

  // ārējais paddings
  padding: {
    top: 28,
    right: 28,
    bottom: 16,
    left: 8,
  },
  colors: {
    background: "#18181b",
    axis: "#fafafa",
    axisTicks: "#fafafa",
    tickLabels: "#fafafa",
    axisLabels: "#d4d4d4",
    dot: "#fafafa",
    indicatorLine: "#52525b",
  },
};

// temperatūras iedaļas tekstam un līknes krāsiņai
// katrs iedaļa attiecas uz temperatūru kas ir zemāka par pirmo elementu (temperatūru)
const tempSegments: [number, { text: string; color: string }][] = [
  [0, { text: "Auksts", color: "#1d4ed8" }], // zem 0 grādiem
  [10, { text: "Vēss", color: "#0891b2" }], // zem 10 grādiem
  [16, { text: "Remdens", color: "#2dd4bf" }], // utt.
  [26, { text: "Optimāls siltums", color: "#4ade80" }],
  [35, { text: "Ļoti karsts", color: "#facc15" }],
  [42, { text: "Bīstami karsts", color: "#f97316" }],
  [Infinity, { text: "Pārkaršana", color: "#b91c1c" }],
];

// aprēķina kur tiks novietots pats charts
// šis ir vajadzīgs, jo configā var atšķirties paddings/fonta izmērs un tas ietekmē paša charta novietojumu
function calculateChartArea(ctx: SKRSContext2D): ChartArea {
  const { width, height, padding, labelFontSize, tickFontSize, tickLength, tickLabelGap, axisLabelGap } = chartConfig;
  const { MAX_EARNING_RATE } = jsonData;

  ctx.font = `${tickFontSize}px ${chartConfig.fontFamily}`;

  // Aprēķina maksimālo y ticka izmēru
  // tam nevar izmantot fonta izmēru, jo tas ir horizontālais garums
  // ticku izmēri var atšķirties
  // piemēram, 0 ir īsāks par 10, tāpēc jāatrod garākais
  let maxYTickWidth = 0;
  const yTickCount = 5;
  for (let i = 0; i <= yTickCount; i++) {
    const rate = (i / yTickCount) * MAX_EARNING_RATE;
    const textWidth = ctx.measureText(rate.toString()).width;
    maxYTickWidth = Math.max(maxYTickWidth, textWidth);
  }

  // nobīde kreisajā pusē
  const leftSpace = tickLength + tickLabelGap + maxYTickWidth + axisLabelGap + labelFontSize;

  // nobīde lejā
  const bottomSpace = tickLength + tickLabelGap + tickFontSize + axisLabelGap + labelFontSize;

  // "paddings" iekļaujot labelus, tickus un paddingu
  const effectivePadding = {
    top: padding.top,
    right: padding.right,
    bottom: padding.bottom + bottomSpace,
    left: padding.left + leftSpace,
  };

  // charta novietojums canvasā
  return {
    x: effectivePadding.left,
    y: effectivePadding.top,
    width: width - effectivePadding.left - effectivePadding.right,
    height: height - effectivePadding.top - effectivePadding.bottom,
  };
}

// palīgfunkcijas lai pareizo novietojumu canvasā iekš charta
const xScale = (temp: number) => chartArea!.x + ((temp + 20) / 70) * chartArea!.width;
const yScale = (rate: number) =>
  chartArea!.y + chartArea!.height - (rate / Config.MAX_EARNING_RATE) * chartArea!.height;

// uzzīmē statisko daļu
// izņemot pašu līkni un axis līnijas, jo tās jāzīmē pāri indikatora līnijām
async function initializeStaticChart(): Promise<void> {
  const { width, height, tickLength, tickLabelGap, labelFontSize, padding, colors } = chartConfig;

  staticCanvas = createCanvas(width, height);
  staticCtx = staticCanvas.getContext("2d");

  staticCtx.fillStyle = colors.background;
  staticCtx.fillRect(0, 0, width, height);

  chartArea = calculateChartArea(staticCtx);

  // axis labeļu stili
  staticCtx.fillStyle = colors.axisLabels;
  staticCtx.font = `${labelFontSize}px ${chartConfig.fontFamily}`;
  staticCtx.textAlign = "center";

  // x-axis labelis
  staticCtx.fillText("Temperatūra, °C", chartArea.x + chartArea.width / 2, height - padding.bottom);

  // y-axis labelis
  // stulbais canvas neļauj pagriezt tekstu
  // tāpēc jāgriež viss canvass, jāuzraksta teksts un jāgriež atpakaļ
  staticCtx.save();
  staticCtx.translate(padding.left + labelFontSize, chartArea.y + chartArea.height / 2);
  staticCtx.rotate(-Math.PI / 2);
  staticCtx.fillText("Peļņa, lati/h", 0, 0);
  staticCtx.restore();

  staticCtx.font = `${chartConfig.tickFontSize}px ${chartConfig.fontFamily}`;

  // ticku un ticku leibeļu stili
  staticCtx.strokeStyle = colors.axisTicks;
  staticCtx.fillStyle = colors.tickLabels;
  staticCtx.lineWidth = 2;

  // zīmē x-axis tickus un ticku leibeļus
  for (let temp = -20; temp <= 50; temp += 10) {
    const x = xScale(temp);

    // ticks
    staticCtx.beginPath();
    staticCtx.moveTo(x, chartArea.y + chartArea.height);
    staticCtx.lineTo(x, chartArea.y + chartArea.height + tickLength);
    staticCtx.stroke();

    // ticka leibelis
    staticCtx.textAlign = "center";
    staticCtx.fillText(
      temp.toString(),
      x,
      chartArea.y + chartArea.height + tickLength + tickLabelGap + chartConfig.tickFontSize,
    );
  }

  // zīmē y-axis tickus un ticku leibeļus
  const yTickCount = 5;
  for (let i = 0; i <= yTickCount; i++) {
    const rate = (i / yTickCount) * Config.MAX_EARNING_RATE;
    const y = yScale(rate);

    // ticks
    staticCtx.beginPath();
    staticCtx.moveTo(chartArea.x, y);
    staticCtx.lineTo(chartArea.x - tickLength, y);
    staticCtx.stroke();

    // ticka leibelis
    staticCtx.textAlign = "right";
    staticCtx.fillText(
      rate.toString(),
      chartArea.x - tickLength - tickLabelGap,
      y + chartConfig.tickFontSize / 3, // Vertical centering adjustment
    );
  }

  isStaticCanvasInitialized = true;
}

// uzzīmē statiskajai daļai pa virsu dinamiskos elementus
// atgriež fināla chartu
async function generateChart(temperature: number): Promise<Buffer> {
  // TODO: salīdzināt json faila datus, ja tie nesakrīt ar configa mainīgajiem - pārģenerēt
  if (!isStaticCanvasInitialized) {
    await initializeStaticChart();
  }

  const { width, height, colors } = chartConfig;
  const { data } = jsonData;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(staticCanvas!, 0, 0);

  const chartArea = calculateChartArea(ctx);

  const currentRate = calculateEarningRatePerHour(temperature);
  const currentY = yScale(currentRate);
  const currentX = xScale(temperature);

  // indikatora līnijas stili
  ctx.strokeStyle = colors.indicatorLine;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);

  // zīmē vertikālo indikatora līniju
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  ctx.lineTo(currentX, chartArea.y + chartArea.height);
  ctx.stroke();

  // zīmē horizontālo indikatora līniju
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  ctx.lineTo(chartArea.x, currentY);
  ctx.stroke();

  ctx.setLineDash([]);

  // axis līniju stili
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;

  // zīmē x-axis līniju
  ctx.beginPath();
  ctx.moveTo(chartArea.x, chartArea.y + chartArea.height);
  ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
  ctx.stroke();

  // zīmē y-axis līniju
  ctx.beginPath();
  ctx.moveTo(chartArea.x, chartArea.y);
  ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
  ctx.stroke();

  // zīmē temperatūras/peļņas krāsaino līkni
  ctx.beginPath();
  ctx.lineWidth = 3;

  let firstPoint = true;
  for (const [temp, rate] of data) {
    const x = xScale(temp);
    const y = yScale(rate);

    const color = tempSegments.find(([t]) => temp <= t)?.[1]?.color;

    if (firstPoint) {
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }

    // krāsa mainās, tātad jāzīmē
    if (ctx.strokeStyle !== color) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
    }
  }

  ctx.stroke();

  // zīmē pašreizējās temperatūras punktiņu
  ctx.beginPath();
  ctx.fillStyle = colors.dot;
  ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
  ctx.fill();

  return await canvas.encode("png");
}

// funckija kopējās peļņas aprēķinam konkrētā laikā
// veikt aprēķinu ik 6 minūtes (maxStepSizeMs)
// ja ir mazāk par 6 minūtēm (vai pēdējais solis), tad tiks izmantots atlikums
function calculateProfit(elapsedMs: number, lastTemp: number) {
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
  const { lastTemp, currentLati, lastUpdateTime } = user.properties.metalluznuNodosanasPunkts;

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

  const { ok, values } = await mongoTransaction((session) => {
    const arr = [() => setUser(userId, guildId, { properties: newProperties }, session)];

    if (action === UpdateAction.IznemtLatus) {
      arr.push(() => addLati(userId, guildId, latiToAdd, session));
    }

    return arr;
  });

  if (!ok) {
    return { ok: false };
  }

  const now = performance.now();
  state.metalluznuNodosanasPunkts.chart = await generateChart(newTemp);
  console.log("Granulu katla bildes ģenerācija:", performance.now() - now);

  return { ok: true, data: { user: values.at(-1)!, latiToAdd } };
}

async function init(state: IpasumiState): Promise<{ ok: boolean }> {
  // if (state.user.properties.metalluznuNodosanasPunkts.lastUpdateTime === -1) {
  //   return { ok: true };
  // }

  await generateChartData();

  const res = await updateDb(state);

  if (res.ok) {
    state.user = res.data.user;
  }

  // const chart = await generateEarningRateChart(state.user.properties.metalluznuNodosanasPunkts.lastTemp);
  // state.metalluznuNodosanasPunkts.chart = chart;

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
  IznemtLatus = "ipasumi_metalluznuNodosanasPunkts_withdraw",
  IemestGranulas = "ipasumi_metalluznuNodosanasPunkts_granulas",
  Refresh = "ipasumi_metalluznuNodosanasPunkts_refresh",
}

// funkcija
function getData(user: UserProfile) {
  const { currentLati, lastTemp } = user.properties.metalluznuNodosanasPunkts;

  return {
    currentLati: Math.floor(currentLati),
    currentTemp: lastTemp,
    maxLati: Config.BASE_MAX_LATI,
  };
}

const view: DialogsViewFunc<IpasumiState> = (state, i) => {
  const data = getData(state.user);

  const row = new ActionRowBuilder<ButtonBuilder>();

  if (data.currentLati > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(`Izņemt latus (${data.currentLati})`)
        .setStyle(ButtonStyle.Success)
        .setCustomId(ComponentId.IznemtLatus),
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setLabel(`Iemest granulas, +5°C`)
      .setStyle(ButtonStyle.Primary)
      .setCustomId(ComponentId.IemestGranulas)
      .setEmoji(emoji("granulas")),
  );

  // poga izstrādei lai atjauninātu datus
  row.addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(ComponentId.Refresh).setEmoji("🔄"),
  );

  const tempText = tempSegments.find(([t]) => data.currentTemp <= t)?.[1]?.text;

  return mainEmbed({
    i,
    content: "\u200B",
    title: "Metāllūžņu nodošanas punkts",
    description: "",
    color: resolveColor("#fdba74"),
    fields: [
      {
        name: "Granulu katls:",
        value: `Temperatūra: **${data.currentTemp.toFixed(1)}** °C\n${tempText}`,
        inline: true,
      },
      {
        name: "\u200B",
        value:
          `Lati: **${data.currentLati}**/${data.maxLati}\n` +
          `Pašreizējā peļņa: **${calculateEarningRatePerHour(data.currentTemp).toFixed(2)}** lati/h\n`,
        inline: true,
      },
    ],

    components: [row],
    files: state.metalluznuNodosanasPunkts.chart
      ? [new AttachmentBuilder(state.metalluznuNodosanasPunkts.chart, { name: "granulu_katls_grafiks.png" })]
      : undefined,
    image: state.metalluznuNodosanasPunkts.chart ? "attachment://granulu_katls_grafiks.png" : undefined,
  });
};

const handler: Parameters<Dialogs<IpasumiState>["onClick"]>[0] = async (i, state) => {
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

  // TODO: pārbaudīt vai lietotājam ir granulas un tās noņemt no inventāra izmantojot
  // const itemInInv = state.user.items.find(({ name }) => name === 'granulas');

  if (i.customId === ComponentId.IznemtLatus) {
    const res = await updateDb(state, UpdateAction.IznemtLatus);
    if (!res.ok) return { error: true };

    state.user = res.data.user;

    // const chart = await generateEarningRateChart(state.user.properties.metalluznuNodosanasPunkts.lastTemp);
    // state.metalluznuNodosanasPunkts.chart = chart;

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
};

export { init, State, defaultState, view, handler };
