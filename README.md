# UlmaņBots

Lielākais latviešu Discord ekonomikas bots.

Pelni naudu, zvejo, apzodz citus un griez aparātus līdz nebēdai!

- 110+ serveros
- 40+ unikālas mantas
- 22 komandas

**Bota uzaicinājums uz serveri -> [šeit](https://discord.com/api/v9/oauth2/authorize?client_id=892747599143125022&scope=bot%20applications.commands)**

# Kā palaist botu

## Pirms sāc

1. Ieinstalē [Bun](https://bun.sh/) (Ja vēlies izmantot uz Windows, nāksies ieinstalēt WSL2).
2. Izveido MongoDB datubāzi.
3. Izveido Discord botu un pievieno to savam serverim.

## 1. Noklonē Git repozitoriju

```sh
git clone https://github.com/deimoss123/ulman-bots
cd ulman-bots
```

## 2. Ieinstalē paciņas

```sh
bun install
```

## 3. Izveido .env failu

- Projekta saknē izveido `.env` failu, izmantojot `.env.example` kā piemēru.
- Ievadi nepieciešamās vērtības.

## 4. Reģistrē komandas

Lokāli, vienam serverim, izstrādei:

```sh
bun register
```

Visos serveros:

```sh
bun register:global
```

## 5. Palaid botu

Izstrādes režīms, restartēsies pēc failu izmaiņās:

```sh
bun dev
```

Parastais režīms, ignorēs izmaiņas:

```sh
bun start
```

## 6. Par emocijzīmēm

UlmaņBots izmanto ĻOTI daudz emocijzīmes un tās visas ir ieceptas kodā.

Ja tu nopietni apsver izstrādāt UlmaņBotu, dod ziņu, tad varu pievienot tiem ~15 serveriem, kur atrodas visi emoji.
