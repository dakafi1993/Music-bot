require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
const ffmpegPath = require('ffmpeg-static');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

async function setupPlayer() {
    await player.extractors.loadDefault();
    console.log('FFmpeg path:', ffmpegPath);
}

setupPlayer();

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`🎵 Přehrávám: **${track.title}**`);
});

player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('✅ Fronta je prázdná!');
});

player.events.on('error', (queue, error) => {
    console.error(`[Player Error] ${error.message}`);
    queue.metadata.channel.send(`❌ Chyba: ${error.message}`);
});

const commands = [
    {
        name: 'play',
        description: 'Přehraje skladbu z YouTube',
        options: [
            {
                name: 'query',
                type: 3,
                description: 'Název skladby nebo URL',
                required: true
            }
        ]
    },
    {
        name: 'pause',
        description: 'Pozastaví přehrávání'
    },
    {
        name: 'resume',
        description: 'Obnoví přehrávání'
    },
    {
        name: 'skip',
        description: 'Přeskočí aktuální skladbu'
    },
    {
        name: 'stop',
        description: 'Zastaví přehrávání a vyčistí frontu'
    },
    {
        name: 'queue',
        description: 'Zobrazí frontu skladeb'
    },
    {
        name: 'nowplaying',
        description: 'Zobrazí aktuální skladbu'
    },
    {
        name: 'volume',
        description: 'Nastaví hlasitost',
        options: [
            {
                name: 'level',
                type: 4,
                description: 'Úroveň hlasitosti (0-100)',
                required: true
            }
        ]
    },
    {
        name: 'leave',
        description: 'Opustí hlasový kanál'
    }
];

client.once('ready', async () => {
    console.log(`Bot ready! Logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully registered slash commands!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'play') {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: '❌ Musíš být v hlasovém kanále!', ephemeral: true });
        }

        const query = interaction.options.getString('query');
        
        await interaction.deferReply();

        try {
            const searchResult = await player.search(query, {
                requestedBy: interaction.user
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply('❌ Nenalezeny žádné výsledky!');
            }

            const queue = player.queues.create(interaction.guild.id, {
                metadata: {
                    channel: interaction.channel
                }
            });

            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            } catch {
                player.queues.delete(interaction.guild.id);
                return interaction.editReply('❌ Nepodařilo se připojit k hlasovému kanálu!');
            }

            searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);

            if (!queue.isPlaying()) await queue.node.play();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Přidáno do fronty')
                .setDescription(searchResult.playlist ? 
                    `Playlist: **${searchResult.playlist.title}** (${searchResult.tracks.length} skladeb)` : 
                    `**${searchResult.tracks[0].title}**`)
                .setThumbnail(searchResult.tracks[0].thumbnail);

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Play error:', error);
            return interaction.editReply(`❌ Chyba při přehrávání: ${error.message}`);
        }
    }

    if (commandName === 'pause') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.node.pause();
        return interaction.reply('⏸️ Přehrávání pozastaveno!');
    }

    if (commandName === 'resume') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.node.resume();
        return interaction.reply('▶️ Přehrávání obnoveno!');
    }

    if (commandName === 'skip') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.node.skip();
        return interaction.reply('⏭️ Skladba přeskočena!');
    }

    if (commandName === 'stop') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.delete();
        return interaction.reply('⏹️ Přehrávání zastaveno!');
    }

    if (commandName === 'queue') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue || !queue.tracks.data.length) {
            return interaction.reply({ content: '❌ Fronta je prázdná!', ephemeral: true });
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.data.slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Fronta skladeb')
            .setDescription(
                `**Aktuálně hraje:**\n${currentTrack.title}\n\n` +
                `**Další ve frontě:**\n${tracks.map((track, i) => `${i + 1}. ${track.title}`).join('\n')}`
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        const track = queue.currentTrack;
        const timestamp = queue.node.getTimestamp();
        const progress = Math.round((timestamp.current.value / timestamp.total.value) * 20);
        const progressBar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(20 - progress);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Aktuálně hraje')
            .setDescription(`**${track.title}**`)
            .addFields(
                { name: 'Autor', value: track.author, inline: true },
                { name: 'Délka', value: track.duration, inline: true },
                { name: 'Průběh', value: `${progressBar}\n${timestamp.current.label} / ${timestamp.total.label}` }
            )
            .setThumbnail(track.thumbnail);

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'volume') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        const volume = interaction.options.getInteger('level');
        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: '❌ Hlasitost musí být mezi 0 a 100!', ephemeral: true });
        }

        queue.node.setVolume(volume);
        return interaction.reply(`🔊 Hlasitost nastavena na ${volume}%`);
    }

    if (commandName === 'leave') {
        const queue = player.queues.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: '❌ Bot není v hlasovém kanále!', ephemeral: true });
        }

        queue.delete();
        return interaction.reply('👋 Opouštím hlasový kanál!');
    }
});

client.login(process.env.DISCORD_TOKEN);
