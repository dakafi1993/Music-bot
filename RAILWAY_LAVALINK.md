# Railway Lavalink Deployment Guide

Tento návod ti ukáže, jak nasadit vlastní Lavalink server na Railway.

## Postup nasazení Lavalink

### 1. Vytvoř nový projekt na Railway

1. Jdi na [railway.app](https://railway.app)
2. Klikni na **"New Project"**
3. Vyber **"Empty Project"**

### 2. Přidej Lavalink service

1. V projektu klikni **"+ New"**
2. Vyber **"GitHub Repo"** 
3. Vyber svůj repozitář (DakafiBot)
4. Railway automaticky detekuje Dockerfile

**NEBO použij Docker image přímo:**

1. Klikni **"+ New"**
2. Vyber **"Docker Image"**
3. Použij: `ghcr.io/lavalink-devs/lavalink:4`

### 3. Nastav proměnné prostředí

V Railway dashboardu pro Lavalink service přidej:

**Variables:**
```
LAVALINK_SERVER_PASSWORD=tvoje_silne_heslo_zde
PORT=${{PORT}}
```

Railway automaticky přiřadí PORT.

### 4. Získej Railway URL

Po nasazení:
1. Klikni na Lavalink service
2. Jdi na **"Settings"**
3. V sekci **"Networking"** klikni **"Generate Domain"**
4. Zkopíruj vygenerovanou URL (např. `lavalink-production-xxxx.up.railway.app`)

### 5. Aktualizuj Discord bot .env

Použij Railway Lavalink údaje:

```env
LAVALINK_HOST=lavalink-production-xxxx.up.railway.app
LAVALINK_PORT=443
LAVALINK_PASSWORD=tvoje_silne_heslo_zde
```

### 6. Nasaď Discord bota

**Pro Discord bota vytvoř DRUHÝ service v Railway:**

1. Ve stejném projektu klikni **"+ New"**
2. Vyber **"GitHub Repo"** → DakafiBot
3. Nastav proměnné prostředí:

```
DISCORD_TOKEN=tvůj_discord_token
DISCORD_CLIENT_ID=tvoje_discord_client_id
LAVALINK_HOST=lavalink-production-xxxx.up.railway.app
LAVALINK_PORT=443
LAVALINK_PASSWORD=stejne_heslo_jako_u_lavalink
```

## Alternativní metoda: Samostatný repozitář pro Lavalink

Můžeš také vytvořit samostatný repozitář jen pro Lavalink:

1. Vytvoř nový GitHub repozitář s názvem `lavalink-server`
2. Přidej tam jen `Dockerfile.lavalink` a `application.yml`
3. Nasaď na Railway z tohoto repozitáře

## Ověření fungování

Po nasazení Lavalink zkontroluj:
- Railway logs by měly zobrazit: `Lavalink is ready to accept connections`
- Bot se připojí s: `✅ Lavalink node connected`

## Náklady

Railway nabízí:
- **$5 free credit měsíčně** (hobby plan)
- Lavalink + Discord bot by měly běžet v rámci free plánu

## Troubleshooting

**Lavalink se nerestartuje:**
- Zkontroluj Railway logs
- Ověř, že PORT je nastaven na `${{PORT}}`

**Bot se nemůže připojit:**
- Zkontroluj LAVALINK_PASSWORD (musí být stejné na obou službách)
- Ověř, že Lavalink má vygenerovanou doménu
- Použij PORT 443 pro HTTPS připojení
