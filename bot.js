require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('youtube-sr').default;

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
    console.log(`Bot připraven! Přihlášen jako ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('Registruji slash příkazy...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        console.log('Slash příkazy úspěšně registrovány!');
    } catch (error) {
        console.error('Chyba při registraci příkazů:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'play') {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Musíš být v hlasovém kanálu!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            let url = query;
            let video;

            // Pokud není URL, hledej na YouTube
            if (!ytdl.validateURL(query)) {
                console.log('Hledám:', query);
                const results = await yts.search(query, { limit: 1, type: 'video' });
                
                if (!results || results.length === 0) {
                    return interaction.editReply('❌ Nenašel jsem žádné výsledky!');
                }
                
                video = results[0];
                url = video.url;
                console.log('Našel jsem:', video.title, url);
            } else {
                console.log('Použitá URL:', url);
                const info = await ytdl.getInfo(url);
                video = {
                    title: info.videoDetails.title,
                    url: url,
                    durationFormatted: new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8),
                    thumbnail: info.videoDetails.thumbnails[0].url
                };
            }

            let queue = queues.get(interaction.guild.id);

            if (!queue) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
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

                // Připojení playeru k voice connection
                connection.subscribe(player);

                // Po skončení skladby
                player.on(AudioPlayerStatus.Idle, () => {
                    queue.songs.shift();
                    if (queue.songs.length > 0) {
                        playSong(queue);
                    } else {
                        queue.textChannel.send('✅ Fronta je prázdná!');
                    }
                });

                player.on('error', error => {
                    console.error('Chyba přehrávače:', error);
                    queue.textChannel.send(`❌ Chyba: ${error.message}`);
                });
            }

            queue.songs.push({
                title: video.title,
                url: url,
                thumbnail: video.thumbnail?.url || video.thumbnail
            });

            if (queue.songs.length === 1) {
                await playSong(queue);
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Přidáno do fronty')
                .setDescription(`**${video.title}**`)
                .setThumbnail(video.thumbnail?.url || video.thumbnail);

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Chyba při přehrávání:', error);
            return interaction.editReply(`❌ Chyba: ${error.message}`);
        }
    }

    if (commandName === 'skip') {
        const queue = queues.get(interaction.guild.id);
        
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
        }

        queue.player.stop();
        return interaction.reply('⏭️ Přeskočeno!');
    }

    if (commandName === 'stop') {
        const queue = queues.get(interaction.guild.id);
        
        if (!queue) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
        }

        queue.songs = [];
        queue.player.stop();
        queue.connection.destroy();
        queues.delete(interaction.guild.id);
        return interaction.reply('⏹️ Zastaveno!');
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
            .setTitle('📜 Fronta skladeb')
            .setDescription(
                `**Aktuálně hraje:**\n${current.title}\n\n` +
                (upcoming.length > 0 ? `**Další ve frontě:**\n${upcoming.map((song, i) => `${i + 1}. ${song.title}`).join('\n')}` : '')
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        const queue = queues.get(interaction.guild.id);
        
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
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
    console.log('Přehrávám:', song.title);
    
    try {
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        const resource = createAudioResource(stream);
        queue.player.play(resource);
        
        queue.textChannel.send(`🎵 Přehrávám: **${song.title}**`);
    } catch (error) {
        console.error('Chyba při přehrávání:', error);
        queue.textChannel.send(`❌ Chyba při přehrávání: ${error.message}`);
        queue.songs.shift();
        if (queue.songs.length > 0) {
            playSong(queue);
        }
    }
}

client.login(process.env.DISCORD_TOKEN);
