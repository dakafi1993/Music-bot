# 🎵 Hudba Bot - Všechny Příkazy

## Hudební příkazy

### `/play <název nebo URL>`
Přehraje skladbu z YouTube
- **Příklad:** `/play kabat malá dáma`
- **Příklad:** `/play https://www.youtube.com/watch?v=4ybLPVcwBdA`
- Bot automaticky vyhledá skladbu nebo použije přímý YouTube link

### `/playlist <URL>`
Přehraje celý YouTube playlist
- **Příklad:** `/playlist https://www.youtube.com/playlist?list=PLxxxxxxx`
- Přidá všechny skladby z playlistu do fronty
- Automaticky začne přehrávat první skladbu
- Zobrazí prvních 5 skladeb a celkový počet

### `/skip`
Přeskočí aktuální skladbu
- Přejde na další skladbu ve frontě
- Pokud není další skladba, přehrávání skončí

### `/stop`
Zastaví přehrávání a vymaže frontu
- Ukončí všechnu hudbu
- Vyprázdní celou frontu
- Bot se odpojí z hlasového kanálu

### `/queue`
Zobrazí frontu skladeb
- Ukazuje aktuálně přehrávanou skladbu
- Zobrazuje dalších až 10 skladeb ve frontě
- Pokud je více skladeb, uvidíš celkový počet

### `/nowplaying`
Zobrazí aktuálně přehrávanou skladbu
- Název skladby
- Náhledový obrázek
- Aktuální informace o přehrávání

## Jak používat bota

1. **Připoj se do hlasového kanálu** (musíš být v hlasovém kanálu)
2. **Použij `/play`** s názvem skladby nebo YouTube URL
3. Bot se automaticky připojí a začne přehrávat

## Poznámky

- Bot musí mít oprávnění připojit se k hlasovému kanálu
- Můžeš přidávat více skladeb - vytvoří se fronta
- Když fronta skončí, bot se automaticky odpojí
- Všechny příkazy jsou slash commands (začínají `/`)

## Podpora

Bot podporuje:
- ✅ YouTube vyhledávání
- ✅ Přímé YouTube URL
- ✅ YouTube playlisty (celé fronty najednou)
- ✅ Frontu skladeb
- ✅ Přeskakování skladeb
- ✅ Zobrazení fronty

---

**Deployed na Railway** | **GitHub:** dakafi1993/Music-bot
