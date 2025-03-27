import maksekeresData from "@/commands/zvejot/makskeresData";
import { ItemAttributes, SpecialItemInProfile } from "@/types/UserProfile";
import itemList, { ItemCategory, ItemKey } from "@/items/itemList";
import { cookableItems } from "@/items/usableItems/gazes_plits";
import { KAFIJAS_APARATS_COOLDOWN } from "@/items/usableItems/kafijas_aparats";
import { kakisFedState } from "@/items/usableItems/kakis";
import { PETNIEKS_COOLDOWN } from "@/items/usableItems/petnieks";
import capitalizeFirst from "@/utils/strings/capitalizeFirst";
import itemString, { makeEmojiString } from "@/utils/strings/itemString";
import latiString from "@/utils/strings/latiString";
import millisToReadableTime from "@/utils/strings/millisToReadableTime";
import { dabutOguInfo, dabutKrumaInfo } from "@/items/usableItems/ogu_krums";

// palīgu funkcija, lai ietītu tekstu vienā no diviem stringiem
// pēdējais parametrs nosaka kurā wrappot, šis vnk uztaisa īsāku un lasāmāku (?) kodu
function wrap(originalStr: string | number, wrapInline: string, wrapRegular: string, inline: boolean) {
  if (inline) {
    return `${wrapInline}${originalStr}${wrapInline}`;
  }

  return `${wrapRegular}${originalStr}${wrapRegular}`;
}

export function displayAttributes(item: SpecialItemInProfile, inline = false) {
  const currTime = Date.now();

  const attributesLat: Record<ItemKey, (attributes: Required<ItemAttributes>) => string> = {
    divainais_burkans: ({ timesUsed }) =>
      // `Nokosts ${inline ? '' : '**'}${timesUsed}${inline ? '' : '**'} ` +
      `Nokosts ${wrap(timesUsed, "", "**", inline)} ` +
      `reiz${timesUsed % 10 === 1 && timesUsed % 100 !== 11 ? "i" : "es"}`,

    kafijas_aparats: ({ lastUsed }) => {
      if (currTime - lastUsed >= KAFIJAS_APARATS_COOLDOWN) {
        return wrap("Kafija gatava!", "", "**", inline);
      }

      const timeStr = millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - currTime + lastUsed);
      return `Gatavo: ${wrap(timeStr, "", "`", inline)}`;
    },

    petnieks: ({ lastUsed, foundItemKey, hat }) => {
      let str = "";

      if (currTime - lastUsed >= PETNIEKS_COOLDOWN) {
        str += wrap("Nopētījis: ", "", "**", inline);

        if (inline) str += itemList[foundItemKey].nameAkuVsk;
        else str += itemList[foundItemKey].emoji();
      } else {
        const timeStr = millisToReadableTime(PETNIEKS_COOLDOWN - currTime + lastUsed);
        str += `Pēta: ${wrap(timeStr, "", "`", inline)}`;
      }

      if (hat) {
        str += `${inline ? ", " : "\n"}Cepure: `;

        if (inline) str += capitalizeFirst(itemList[hat].nameNomVsk);
        else str += itemList[hat].emoji();
      }

      return str;
    },

    makskeres: ({ durability }) => `Izturība: ${durability}/${maksekeresData[item.name].maxDurability}`,

    naudas_maiss: ({ latiCollected }) => {
      if (latiCollected) {
        return `Maisā ir ${latiString(latiCollected, false, !inline)}`;
      }

      return wrap("Maiss ir tukšs", "", "**", inline);
    },

    loto_zivs: ({ holdsFishCount }) => `Satur ${wrap(holdsFishCount, "", "**", inline)} zivis`,

    kakis: ({ createdAt, fedUntil, hat }) => {
      let str = "";

      if (fedUntil < currTime) {
        str += `${inline ? "" : "_**"}MIRIS${inline ? "" : "**_"} ⚰️`;
      } else {
        str +=
          `Vecums: ${wrap(millisToReadableTime(currTime - createdAt), "", "**", inline)}` +
          (inline ? ", " : "\n") +
          wrap(kakisFedState.find((s) => fedUntil! - currTime > s.time)!.name, "", "**", inline);
      }

      if (hat) {
        str += `${inline ? ", " : "\n"}Cepure: `;

        if (inline) str += capitalizeFirst(itemList[hat].nameNomVsk);
        else str += itemList[hat].emoji();
      }

      return str;
    },

    patriota_piespraude: ({ piespraudeNum }) => wrap(`Nr. ${piespraudeNum}`, "", "**", inline),

    gazes_plits: (attr) => {
      const { actionType } = attr;

      if (actionType === "boil_ievarijums") {
        const boilIevarijums = attr.boilIevarijums!;

        if (boilIevarijums.boilStarttime + boilIevarijums.boilDuration < currTime) {
          return "Ievārījums ir izvārīts!";
        }

        let str = "Vāra ievārījumu...\n";

        if (!inline) {
          str +=
            Object.entries(boilIevarijums.berries)
              .map(([name, amount]) => `${amount} ${itemList[name].emoji() || "❓"}`)
              .join(", ") + "\n";
        }

        const millis = millisToReadableTime(boilIevarijums.boilStarttime + boilIevarijums.boilDuration - currTime);

        str += `Gatavs pēc: ${wrap(millis, "", "`", inline)}`;

        return str;
      }

      return "Tukšs!";

      /*
      const { output, time } = cookableItems.find(({ input }) => input === cookingItem)!;
      const timeWhenDone = cookingStartedTime! + time;
      const isDoneCooking = timeWhenDone < currTime;

      const itemStr = (key: ItemKey) => (inline ? capitalizeFirst(itemList[key].nameNomVsk) : `**${itemString(key)}**`);

      if (isDoneCooking) {
        return `Izcepts: ${itemStr(output)}`;
      }

      return (
        `Cepjas: ${itemStr(cookingItem)}` +
        (inline ? `, ` : '\n') +
        `Gatavs pēc: ${inline ? '' : '`'}${millisToReadableTime(timeWhenDone - currTime)}${inline ? '' : '`'}`
      );
      */
    },

    // sita noladeta attributu uzradisana ir panemusi stundu no manas dzives (bumbotajs)
    // es ari esmu stulbs
    // AAAaaaAaAAaAAaAAAaaAaAaAaa
    ogu_krums: ({ maxBerries, growthTime, berryType, lastUsed }) => {
      const { cikNakamaOga, sobridOgas } = dabutOguInfo(item, currTime);
      const { izaudzis, cikIlgiAug, izaugsanasProg, augsanasLaiks, vajagApliet } = dabutKrumaInfo(item, currTime);
      const cikOgasRadit = Math.min(sobridOgas, maxBerries!);
      const itemStr = (key: ItemKey) =>
        inline ? capitalizeFirst(itemList[key].nameAkuDsk) : `**${capitalizeFirst(itemList[key].nameAkuDsk)}**`;
      return izaudzis === true // šitā ir reāla elle. ja elle pastāv, tad tā ir šeit
        ? `Audzē - ${itemStr(berryType!)} ${cikOgasRadit}/${maxBerries} ${
            sobridOgas < maxBerries! ? millisToReadableTime(cikNakamaOga) : ""
          }` + (inline ? `, ` : "\n")
        : vajagApliet
          ? `Krūms ir izslāpis! 🥵 ${izaugsanasProg}%`
          : inline
            ? `Krūms vēl aug... ${izaugsanasProg}%, `
            : `Krūms vēl aug... **${izaugsanasProg}%** `;
    },
  };

  let key = item.name;

  if (itemList[key].categories.includes(ItemCategory.MAKSKERE)) {
    key = "makskeres";
  }

  if (!attributesLat[key]) {
    return `womp womp, tu aizmirsi mantai "${key}" pievienot ierakstu failā displayAttributes.ts :/`;
  }

  // es uzticos, ka neviens nemēģinās izmantot atribūtus kas konkrētajai mantai nav
  // ... jo tas būtu diezgan smieklīgi
  return attributesLat[key]!(item.attributes as Required<ItemAttributes>);
}
