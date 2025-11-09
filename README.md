# Discord Music Bot with Lavalink

A Discord music bot using Discord.js v14 and Erela.js for Lavalink integration. Designed for deployment on Railway.

## Features

- 🎵 Play music from YouTube, Spotify, and other sources
- ⏯️ Pause, resume, skip controls
- 📋 Queue management
- 🔊 Volume control
- 💬 Slash commands (modern Discord interactions)
- ☁️ Railway-ready configuration

## Commands

- `/play <query>` - Play a song from URL or search query
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/skip` - Skip the current song
- `/stop` - Stop playing and clear the queue
- `/leave` - Leave the voice channel
- `/queue` - Show the current queue
- `/nowplaying` - Show the currently playing song
- `/volume <0-100>` - Set the volume level

## Prerequisites

1. **Node.js 16.9.0 or higher**
2. **Discord Bot Token** - Create at [Discord Developer Portal](https://discord.com/developers/applications)
   - Enable the following intents: `Guilds`, `GuildVoiceStates`, `GuildMessages`
3. **Lavalink Server** - Deploy on Railway or use an existing instance

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` with your values:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
LAVALINK_HOST=your_lavalink_host
LAVALINK_PORT=2333
LAVALINK_PASSWORD=your_lavalink_password
```

### 3. Run the Bot

```bash
npm start
```

## Lavalink Setup on Railway

### Option 1: Deploy Lavalink on Railway

1. Create a new Railway project
2. Deploy from [Lavalink Docker image](https://github.com/freyacodes/Lavalink)
3. Set environment variables in Railway dashboard:
   - `LAVALINK_SERVER_PASSWORD` - Your secure password
4. Note the Railway-provided host URL and port

### Option 2: Use Public Lavalink (Not Recommended for Production)

Search for public Lavalink nodes online (unstable, for testing only).

## Railway Deployment

### 1. Prepare Repository

**IMPORTANT:** Never commit secrets!

```bash
git init
git add .
git commit -m "Initial commit"
```

Verify `.gitignore` excludes:
- `node_modules/`
- `.env`

### 2. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 3. Deploy on Railway

1. Go to [Railway](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select your repository
4. **Set Environment Variables** in Railway dashboard:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `LAVALINK_HOST`
   - `LAVALINK_PORT`
   - `LAVALINK_PASSWORD`

5. Railway will automatically:
   - Detect `package.json`
   - Run `npm install`
   - Execute `npm start`

### 4. Verify Deployment

Check Railway logs for:
```
✅ Bot logged in as YourBot#1234
✅ Lavalink node connected
✅ Slash commands registered successfully!
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ...` |
| `DISCORD_CLIENT_ID` | Application ID from Discord Developer Portal | `1234567890123456789` |
| `LAVALINK_HOST` | Lavalink server hostname | `lavalink.railway.app` |
| `LAVALINK_PORT` | Lavalink server port | `2333` |
| `LAVALINK_PASSWORD` | Lavalink server password | `youshallnotpass` |

## Troubleshooting

### Bot not responding to commands
- Verify bot has proper intents enabled
- Check slash commands are registered (see logs)
- Ensure bot has necessary permissions in Discord server

### Lavalink connection failed
- Verify `LAVALINK_HOST`, `LAVALINK_PORT`, and `LAVALINK_PASSWORD`
- Check Lavalink server is running
- For Railway Lavalink, ensure it's deployed and active

### No audio playing
- Confirm bot is in voice channel
- Check Lavalink logs for errors
- Verify YouTube/source availability

## Security Best Practices

- ✅ Use environment variables for all secrets
- ✅ Never commit `.env` file
- ✅ Never commit `node_modules/`
- ✅ Keep dependencies updated
- ✅ Use strong Lavalink passwords
- ✅ Restrict bot permissions to required only

## Project Structure

```
discord-music-bot/
├── index.js          # Main bot logic
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
├── .gitignore        # Git exclusions
└── README.md         # This file
```

## Dependencies

- `discord.js` - Discord API wrapper
- `erela.js` - Lavalink client
- `erela.js-spotify` - Spotify support
- `dotenv` - Environment variable loader

## License

ISC

## Support

For issues or questions, check:
- [Discord.js Documentation](https://discord.js.org)
- [Erela.js Documentation](https://erela.js.org)
- [Lavalink GitHub](https://github.com/freyacodes/Lavalink)
