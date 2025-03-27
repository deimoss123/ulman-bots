import daudzskaitlis from "@/utils/strings/daudzkaitlis";

export default function latiString(lati: number, akuzativs = false, bold = false): string {
  const count = bold ? `**${Math.floor(lati)}**` : Math.floor(lati);
  const text = daudzskaitlis(lati, akuzativs ? "latu" : "lats", akuzativs ? "latus" : "lati");

  return `${count} ${text}`;
}
