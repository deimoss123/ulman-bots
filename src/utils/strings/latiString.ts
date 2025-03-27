export default function latiString(lati: number, akuzativs = false, bold = false): string {
  const latiStr = bold ? `**${Math.floor(lati)}**` : Math.floor(lati);

  // vienskaitlis
  if (lati % 10 === 1 && lati % 100 !== 11) {
    return akuzativs ? `${latiStr} latu` : `${latiStr} lats`;
  }

  // daudzskaitlis
  return akuzativs ? `${latiStr} latus` : `${latiStr} lati`;
}
