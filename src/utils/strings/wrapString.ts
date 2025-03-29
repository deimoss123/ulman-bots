// palīgu funcija, lai ietītu tekstu, ja pēdējais booleans ir true
// noderīgi Item.displayAttributes() funkcijai
// šo var aizvietot ar parastu ternary, bet ja input teksts ir garāks, tad sanāk taisīt atsevišķu mainīgo
// padodt wrapContent masīvu ar 2 vērtībām - 1. būs kreisajā pusē, 2. labajā pusē
export default function wrapString(input: any, wrapContent: string | [string, string], shouldWrap: boolean) {
  if (!shouldWrap) return `${input}`;

  return typeof wrapContent === "string"
    ? `${wrapContent}${input}${wrapContent}`
    : `${wrapContent[0]}${input}${wrapContent[1]}`;
}
