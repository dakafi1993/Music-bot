require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { Manager } = require('erela.js');

// Environment variables validation
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const LAVALINK_HOST = process.env.LAVALINK_HOST;
const LAVALINK_PORT = process.env.LAVALINK_PORT || '2333';
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !LAVALINK_HOST || !LAVALINK_PASSWORD) {
    console.error('❌ Missing required environment variables!');
    console.error('Required: DISCORD_TOKEN, DISCORD_CLIENT_ID, LAVALINK_HOST, LAVALINK_PASSWORD');
    process.exit(1);
}

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Initialize Erela.js Manager
const manager = new Manager({
    nodes: [
        {
            host: LAVALINK_HOST,
            port: parseInt(LAVALINK_PORT),
            password: LAVALINK_PASSWORD,
            secure: LAVALINK_HOST.includes('railway.app') || LAVALINK_HOST.includes('https')
        }
    ],
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    }
});

// Slash commands definition
const commands = [
    {
        name: 'play',
        description: 'Play a song from URL or search query',
        options: [{
            name: 'query',
            type: 3,
            description: 'Song URL or search query',
            required: true
        }]
    },
    {
        name: 'pause',
        description: 'Pause the current song'
    },
    {
        name: 'resume',
        description: 'Resume the paused song'
    },
    {
        name: 'skip',
        description: 'Skip the current song'
    },
    {
        name: 'queue',
        description: 'Show the current queue'
    },
    {
        name: 'nowplaying',
        description: 'Show the currently playing song'
    },
    {
        name: 'stop',
        description: 'Stop playing and clear the queue'
    },
    {
        name: 'leave',
        description: 'Leave the voice channel'
    },
    {
        name: 'volume',
        description: 'Set the volume (0-100)',
        options: [{
            name: 'level',
            type: 4,
            description: 'Volume level (0-100)',
            required: true
        }]
    }
];

// Register slash commands
async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
        console.log('🔄 Registering slash commands...');
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
}

// Erela.js events
manager.on('nodeConnect', node => {
    console.log(`✅ Lavalink node "${node.options.host}" connected`);
});

manager.on('nodeError', (node, error) => {
    console.error(`❌ Lavalink node "${node.options.host}" error:`, error.message);
});

manager.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Now Playing')
        .setDescription(`[${track.title}](${track.uri})`)
        .addFields({ name: 'Author', value: track.author, inline: true })
        .addFields({ name: 'Duration', value: formatDuration(track.duration), inline: true });
    
    channel?.send({ embeds: [embed] });
});

manager.on('queueEnd', player => {
    const channel = client.channels.cache.get(player.textChannel);
    channel?.send('✅ Queue has ended. Use `/play` to add more songs!');
    player.destroy();
});

// Discord client events
client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    manager.init(client.user.id);
    registerCommands();
});

client.on('raw', d => manager.updateVoiceState(d));

// Interaction handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild, channel } = interaction;

    // Check if user is in voice channel
    const voiceChannel = member.voice.channel;
    
    if (commandName === 'play') {
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
        }

        const query = options.getString('query');
        await interaction.deferReply();

        let player = manager.get(guild.id);
        
        if (!player) {
            player = manager.create({
                guild: guild.id,
                voiceChannel: voiceChannel.id,
                textChannel: channel.id,
                selfDeafen: true
            });
        }

        if (player.state !== 'CONNECTED') player.connect();

        // Search for tracks
        const res = await manager.search(query, interaction.user);

        if (res.loadType === 'LOAD_FAILED' || res.loadType === 'NO_MATCHES') {
            if (!player.queue.current) player.destroy();
            return interaction.editReply({ content: '❌ No results found!' });
        }

        if (res.loadType === 'PLAYLIST_LOADED') {
            player.queue.add(res.tracks);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📝 Playlist Added')
                .setDescription(`Added **${res.tracks.length}** tracks from **${res.playlist.name}**`);
            interaction.editReply({ embeds: [embed] });
        } else {
            player.queue.add(res.tracks[0]);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📝 Added to Queue')
                .setDescription(`[${res.tracks[0].title}](${res.tracks[0].uri})`);
            interaction.editReply({ embeds: [embed] });
        }

        if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
        }
    }

    if (commandName === 'pause') {
        const player = manager.get(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        player.pause(true);
        interaction.reply('⏸️ Paused the music!');
    }

    if (commandName === 'resume') {
        const player = manager.get(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        player.pause(false);
        interaction.reply('▶️ Resumed the music!');
    }

    if (commandName === 'skip') {
        const player = manager.get(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        const skipped = player.queue.current;
        player.stop();
        interaction.reply(`⏭️ Skipped **${skipped.title}**`);
    }

    if (commandName === 'stop') {
        const player = manager.get(guild.id);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        player.queue.clear();
        player.stop();
        interaction.reply('⏹️ Stopped the music and cleared the queue!');
    }

    if (commandName === 'leave') {
        const player = manager.get(guild.id);
        if (!player) {
            return interaction.reply({ content: '❌ Bot is not in a voice channel!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        player.destroy();
        interaction.reply('👋 Left the voice channel!');
    }

    if (commandName === 'queue') {
        const player = manager.get(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        
        const queue = player.queue;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📋 Current Queue')
            .setDescription(
                `**Now Playing:**\n[${queue.current.title}](${queue.current.uri}) - ${formatDuration(queue.current.duration)}\n\n` +
                (queue.length ? `**Up Next:**\n${queue.slice(0, 10).map((track, i) => 
                    `${i + 1}. [${track.title}](${track.uri}) - ${formatDuration(track.duration)}`
                ).join('\n')}` : '**No songs in queue**') +
                (queue.length > 10 ? `\n\n*...and ${queue.length - 10} more*` : '')
            );
        
        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        const player = manager.get(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        
        const track = player.queue.current;
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Now Playing')
            .setDescription(`[${track.title}](${track.uri})`)
            .addFields({ name: 'Author', value: track.author, inline: true })
            .addFields({ name: 'Duration', value: formatDuration(track.duration), inline: true })
            .addFields({ name: 'Requested by', value: track.requester.toString(), inline: true });
        
        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'volume') {
        const player = manager.get(guild.id);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
        }
        
        const volume = options.getInteger('level');
        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: '❌ Volume must be between 0 and 100!', ephemeral: true });
        }
        
        player.setVolume(volume);
        interaction.reply(`🔊 Volume set to **${volume}%**`);
    }
});

// Utility function
function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login
client.login(DISCORD_TOKEN);
