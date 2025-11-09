require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

// Initialize play-dl
(async () => {
    await play.getFreeClientID().then((clientID) => play.setToken({
        soundcloud : {
            client_id : clientID
        }
    }));
})();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

const queues = new Map();

const commands = [
    {
        name: 'play',
        description: 'Přehraje skladbu z YouTube',
        options: [{
            name: 'query',
            type: 3,
            description: 'Název skladby nebo URL',
            required: true
        }]
    },
    {
        name: 'skip',
        description: 'Přeskočí aktuální skladbu'
    },
    {
        name: 'stop',
        description: 'Zastaví přehrávání'
    },
    {
        name: 'queue',
        description: 'Zobrazí frontu skladeb'
    },
    {
        name: 'nowplaying',
        description: 'Zobrazí aktuální skladbu'
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
            let url = query;
            let video;
            
            // If not a URL, search YouTube
            if (!query.startsWith('http')) {
                console.log('Searching for:', query);
                const searched = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                console.log('Search results:', searched);
                if (!searched || !searched[0]) {
                    return interaction.editReply('❌ Nenalezeny žádné výsledky!');
                }
                video = searched[0];
                url = video.url;
                console.log('Found video:', video.title, 'URL:', url);
                video = searched[0];
            } else {
                // Validate YouTube URL
                console.log('Validating URL:', url);
                const yt_info = await play.video_info(url);
                video = yt_info.video_details;
            }

            let queue = queues.get(interaction.guild.id);

            if (!queue) {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer();

                queue = {
                    connection,
                    player,
                    songs: [],
                    textChannel: interaction.channel
                };

                queues.set(interaction.guild.id, queue);

                player.on(AudioPlayerStatus.Idle, () => {
                    queue.songs.shift();
                    if (queue.songs.length > 0) {
                        playSong(queue);
                    } else {
                        queue.textChannel.send('✅ Fronta je prázdná!');
                    }
                });

                player.on('error', error => {
                    console.error('Player error:', error);
                    queue.textChannel.send(`❌ Chyba: ${error.message}`);
                });

                connection.subscribe(player);
            }

            queue.songs.push({
                title: video.title || video.name,
                url: url,
                duration: video.durationInSec || 0,
                thumbnail: video.thumbnails ? video.thumbnails[0].url : null
            });

            if (queue.songs.length === 1) {
                playSong(queue);
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Přidáno do fronty')
                .setDescription(`**${video.title}**`)
                .setThumbnail(video.thumbnails[0].url);

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Play error:', error);
            return interaction.editReply(`❌ Chyba: ${error.message}`);
        }
    }

    if (commandName === 'skip') {
        const queue = queues.get(interaction.guild.id);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.player.stop();
        return interaction.reply('⏭️ Skladba přeskočena!');
    }

    if (commandName === 'stop') {
        const queue = queues.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        queue.songs = [];
        queue.player.stop();
        queue.connection.destroy();
        queues.delete(interaction.guild.id);
        return interaction.reply('⏹️ Přehrávání zastaveno!');
    }

    if (commandName === 'queue') {
        const queue = queues.get(interaction.guild.id);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Fronta je prázdná!', ephemeral: true });
        }

        const current = queue.songs[0];
        const upcoming = queue.songs.slice(1, 11);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Fronta skladeb')
            .setDescription(
                `**Aktuálně hraje:**\n${current.title}\n\n` +
                (upcoming.length > 0 ? `**Další ve frontě:**\n${upcoming.map((song, i) => `${i + 1}. ${song.title}`).join('\n')}` : '')
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        const queue = queues.get(interaction.guild.id);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });
        }

        const current = queue.songs[0];
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Aktuálně hraje')
            .setDescription(`**${current.title}**`)
            .setThumbnail(current.thumbnail);

        return interaction.reply({ embeds: [embed] });
    }
});

async function playSong(queue) {
    const song = queue.songs[0];
    
    try {
        const stream = await play.stream(song.url);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        queue.player.play(resource);
        queue.textChannel.send(`🎵 Přehrávám: **${song.title}**`);
    } catch (error) {
        console.error('Play error:', error);
        queue.textChannel.send(`❌ Chyba při přehrávání: ${error.message}`);
        queue.songs.shift();
        if (queue.songs.length > 0) {
            playSong(queue);
        }
    }
}

client.login(process.env.DISCORD_TOKEN);
