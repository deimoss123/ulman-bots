// funkcija kas atgriež vienskaitļa vai daudzskaitļa locījumu atkarībā no padotā skaitļa
//
// piemēri:
// daudzskaitlis(1, "lats", "lati") -> lats
// daudzskaitlis(5, "lats", "lati") -> lati
// daudzskaitlis(11, "lats", "lati") -> lati
// daudzskaitlis(21, "lats", "lati") -> lats
function daudzskaitlis(count: number, vienskaitlis: string, daudzskaitlis: string): string {
  return count % 10 === 1 && count % 100 !== 11 ? vienskaitlis : daudzskaitlis;
}

export default daudzskaitlis;
