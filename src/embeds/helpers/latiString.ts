export default function latiString(lati: number, akuzativs = false): string {
  // vienskaitlis
  if (lati % 10 === 1 && lati % 100 !== 11) {
    return akuzativs ? `${lati} latu` : `${lati} lats`;
  }

  // daudzskaitlis
  return akuzativs ? `${lati} latus` : `${lati} lati`;
}