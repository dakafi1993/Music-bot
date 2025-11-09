require('dotenv').config();require('dotenv').config();require('dotenv').config();



const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const { Player } = require('discord-player');

const { Player } = require('discord-player');const { Player } = require('discord-player');

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildVoiceStates,const DISCORD_TOKEN = process.env.DISCORD_TOKEN;const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

        GatewayIntentBits.GuildMessages

    ]const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

});



const player = new Player(client);

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {

async function setupPlayer() {

    await player.extractors.loadDefault();    console.error('❌ Missing environment variables!');    console.error('Missing env vars!');

}

    process.exit(1);    process.exit(1);

setupPlayer();

}}

player.events.on('playerStart', (queue, track) => {

    queue.metadata.channel.send(`🎵 Přehrávám: **${track.title}**`);

});

const client = new Client({const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

player.events.on('emptyQueue', (queue) => {

    queue.metadata.channel.send('✅ Fronta je prázdná!');    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]const player = new Player(client);

});

});player.extractors.loadDefault();

player.events.on('error', (queue, error) => {

    console.error(`[Player Error] ${error.message}`);

    queue.metadata.channel.send(`❌ Chyba: ${error.message}`);

});const player = new Player(client);client.once('ready', () => console.log('Bot ready!'));



const commands = [player.extractors.loadDefault();client.login(DISCORD_TOKEN);

    {

        name: 'play',

        description: 'Přehraje skladbu z YouTube',const commands = [

        options: [    { name: 'play', description: 'Play a song', options: [{ name: 'query', type: 3, description: 'Song URL or search', required: true }] },

            {    { name: 'pause', description: 'Pause the song' },

                name: 'query',    { name: 'resume', description: 'Resume the song' },

                type: 3,    { name: 'skip', description: 'Skip current song' },

                description: 'Název skladby nebo URL',    { name: 'stop', description: 'Stop and clear queue' },

                required: true    { name: 'queue', description: 'Show queue' },

            }    { name: 'nowplaying', description: 'Show current song' },

        ]    { name: 'volume', description: 'Set volume', options: [{ name: 'level', type: 4, description: 'Volume 0-100', required: true }] },

    },    { name: 'leave', description: 'Leave voice channel' }

    {];

        name: 'pause',

        description: 'Pozastaví přehrávání'async function registerCommands() {

    },    try {

    {        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

        name: 'resume',        console.log('🔄 Registering commands...');

        description: 'Obnoví přehrávání'        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });

    },        console.log('✅ Commands registered!');

    {    } catch (error) {

        name: 'skip',        console.error('❌ Error:', error);

        description: 'Přeskočí aktuální skladbu'    }

    },}

    {

        name: 'stop',player.events.on('playerStart', (queue, track) => {

        description: 'Zastaví přehrávání a vyčistí frontu'    queue.metadata.channel.send({ embeds: [new EmbedBuilder()

    },        .setColor('#00FF00')

    {        .setTitle('🎵 Now Playing')

        name: 'queue',        .setDescription(`[${track.title}](${track.url})`)

        description: 'Zobrazí frontu skladeb'        .addFields(

    },            { name: 'Author', value: track.author, inline: true },

    {            { name: 'Duration', value: track.duration, inline: true }

        name: 'nowplaying',        )] });

        description: 'Zobrazí aktuální skladbu'});

    },

    {player.events.on('emptyQueue', (queue) => {

        name: 'volume',    queue.metadata.channel.send('✅ Queue ended!');

        description: 'Nastaví hlasitost',});

        options: [

            {player.events.on('error', (queue, error) => {

                name: 'level',    console.error('Player error:', error);

                type: 4,    queue.metadata.channel.send('❌ Error playing music!');

                description: 'Úroveň hlasitosti (0-100)',});

                required: true

            }client.once('ready', () => {

        ]    console.log(`✅ Bot logged in as ${client.user.tag}`);

    },    registerCommands();

    {});

        name: 'leave',

        description: 'Opustí hlasový kanál'client.on('interactionCreate', async interaction => {

    }    if (!interaction.isChatInputCommand()) return;

];

    const { commandName, options, member, guild, channel } = interaction;

client.once('ready', async () => {    const voiceChannel = member.voice.channel;

    console.log(`Bot ready! Logged in as ${client.user.tag}`);

        if (commandName === 'play') {

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);        if (!voiceChannel) {

                return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });

    try {        }

        console.log('Registering slash commands...');

        await rest.put(        const query = options.getString('query');

            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),        await interaction.deferReply();

            { body: commands }

        );        try {

        console.log('Successfully registered slash commands!');            const { track } = await player.play(voiceChannel, query, {

    } catch (error) {                nodeOptions: {

        console.error('Error registering commands:', error);                    metadata: {

    }                        channel: interaction.channel,

});                        client: interaction.guild?.members.me,

                        requestedBy: interaction.user

client.on('interactionCreate', async interaction => {                    }

    if (!interaction.isChatInputCommand()) return;                }

            });

    const { commandName } = interaction;

            return interaction.editReply({ embeds: [new EmbedBuilder()

    if (commandName === 'play') {                .setColor('#0099ff')

        if (!interaction.member.voice.channel) {                .setTitle('📝 Added to Queue')

            return interaction.reply({ content: '❌ Musíš být v hlasovém kanále!', ephemeral: true });                .setDescription(`[${track.title}](${track.url})`)

        }                .addFields(

                    { name: 'Author', value: track.author, inline: true },

        const query = interaction.options.getString('query');                    { name: 'Duration', value: track.duration, inline: true }

                        )] });

        await interaction.deferReply();        } catch (error) {

            console.error(error);

        try {            return interaction.editReply({ content: '❌ Could not play this track!' });

            const searchResult = await player.search(query, {        }

                requestedBy: interaction.user    }

            });

    const queue = player.nodes.get(guild.id);

            if (!searchResult || !searchResult.tracks.length) {

                return interaction.editReply('❌ Nenalezeny žádné výsledky!');    if (commandName === 'pause') {

            }        if (!queue || !queue.isPlaying()) {

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            const queue = player.queues.create(interaction.guild.id, {        }

                metadata: {        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

                    channel: interaction.channel            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

                }        }

            });        queue.node.pause();

        return interaction.reply('⏸️ Paused!');

            try {    }

                if (!queue.connection) await queue.connect(interaction.member.voice.channel);

            } catch {    if (commandName === 'resume') {

                player.queues.delete(interaction.guild.id);        if (!queue || !queue.node.isPaused()) {

                return interaction.editReply('❌ Nepodařilo se připojit k hlasovému kanálu!');            return interaction.reply({ content: '❌ Nothing is paused!', ephemeral: true });

            }        }

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

            searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

        }

            if (!queue.isPlaying()) await queue.node.play();        queue.node.resume();

        return interaction.reply('▶️ Resumed!');

            const embed = new EmbedBuilder()    }

                .setColor('#00ff00')

                .setTitle('✅ Přidáno do fronty')    if (commandName === 'skip') {

                .setDescription(searchResult.playlist ?         if (!queue || !queue.isPlaying()) {

                    `Playlist: **${searchResult.playlist.title}** (${searchResult.tracks.length} skladeb)` :             return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

                    `**${searchResult.tracks[0].title}**`)        }

                .setThumbnail(searchResult.tracks[0].thumbnail);        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

            return interaction.editReply({ embeds: [embed] });        }

        } catch (error) {        const current = queue.currentTrack;

            console.error('Play error:', error);        queue.node.skip();

            return interaction.editReply(`❌ Chyba při přehrávání: ${error.message}`);        return interaction.reply(`⏭️ Skipped **${current.title}**`);

        }    }

    }

    if (commandName === 'stop') {

    if (commandName === 'pause') {        if (!queue) {

        const queue = player.queues.get(interaction.guild.id);            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

        if (!queue || !queue.isPlaying()) {        }

            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

        }            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

        }

        queue.node.pause();        queue.delete();

        return interaction.reply('⏸️ Přehrávání pozastaveno!');        return interaction.reply('⏹️ Stopped and cleared queue!');

    }    }



    if (commandName === 'resume') {    if (commandName === 'queue') {

        const queue = player.queues.get(interaction.guild.id);        if (!queue || !queue.currentTrack) {

        if (!queue) {            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });        }

        }

        const tracks = queue.tracks.toArray();

        queue.node.resume();        const embed = new EmbedBuilder()

        return interaction.reply('▶️ Přehrávání obnoveno!');            .setColor('#0099ff')

    }            .setTitle('📋 Current Queue')

            .setDescription(

    if (commandName === 'skip') {                `**Now Playing:**\n[${queue.currentTrack.title}](${queue.currentTrack.url}) - ${queue.currentTrack.duration}\n\n` +

        const queue = player.queues.get(interaction.guild.id);                (tracks.length ? `**Up Next:**\n${tracks.slice(0, 10).map((t, i) => 

        if (!queue || !queue.isPlaying()) {                    `${i + 1}. [${t.title}](${t.url}) - ${t.duration}`

            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });                ).join('\n')}` : '**No songs in queue**') +

        }                (tracks.length > 10 ? `\n\n*...and ${tracks.length - 10} more*` : '')

            );

        queue.node.skip();

        return interaction.reply('⏭️ Skladba přeskočena!');        return interaction.reply({ embeds: [embed] });

    }    }



    if (commandName === 'stop') {    if (commandName === 'nowplaying') {

        const queue = player.queues.get(interaction.guild.id);        if (!queue || !queue.currentTrack) {

        if (!queue) {            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });        }

        }

        const track = queue.currentTrack;

        queue.delete();        const embed = new EmbedBuilder()

        return interaction.reply('⏹️ Přehrávání zastaveno!');            .setColor('#00FF00')

    }            .setTitle('🎵 Now Playing')

            .setDescription(`[${track.title}](${track.url})`)

    if (commandName === 'queue') {            .addFields(

        const queue = player.queues.get(interaction.guild.id);                { name: 'Author', value: track.author, inline: true },

        if (!queue || !queue.tracks.data.length) {                { name: 'Duration', value: track.duration, inline: true },

            return interaction.reply({ content: '❌ Fronta je prázdná!', ephemeral: true });                { name: 'Progress', value: queue.node.createProgressBar(), inline: false }

        }            );



        const currentTrack = queue.currentTrack;        return interaction.reply({ embeds: [embed] });

        const tracks = queue.tracks.data.slice(0, 10);    }



        const embed = new EmbedBuilder()    if (commandName === 'volume') {

            .setColor('#0099ff')        if (!queue) {

            .setTitle('🎵 Fronta skladeb')            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            .setDescription(        }

                `**Aktuálně hraje:**\n${currentTrack.title}\n\n` +        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

                `**Další ve frontě:**\n${tracks.map((track, i) => `${i + 1}. ${track.title}`).join('\n')}`            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

            );        }



        return interaction.reply({ embeds: [embed] });        const volume = options.getInteger('level');

    }        if (volume < 0 || volume > 100) {

            return interaction.reply({ content: '❌ Volume must be between 0 and 100!', ephemeral: true });

    if (commandName === 'nowplaying') {        }

        const queue = player.queues.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {        queue.node.setVolume(volume);

            return interaction.reply({ content: '❌ Nic se nepřehrává!', ephemeral: true });        return interaction.reply(`🔊 Volume set to **${volume}%**`);

        }    }



        const track = queue.currentTrack;    if (commandName === 'leave') {

        const timestamp = queue.node.getTimestamp();        if (!queue) {

        const progress = Math.round((timestamp.current.value / timestamp.total.value) * 20);            return interaction.reply({ content: '❌ Bot is not in a voice channel!', ephemeral: true });

        const progressBar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(20 - progress);        }

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {

        const embed = new EmbedBuilder()            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });

            .setColor('#0099ff')        }

            .setTitle('🎵 Aktuálně hraje')        queue.delete();

            .setDescription(`**${track.title}**`)        return interaction.reply('👋 Left the voice channel!');

            .addFields(    }

                { name: 'Autor', value: track.author, inline: true },});

                { name: 'Délka', value: track.duration, inline: true },

                { name: 'Průběh', value: `${progressBar}\n${timestamp.current.label} / ${timestamp.total.label}` }process.on('unhandledRejection', error => {

            )    console.error('Unhandled rejection:', error);

            .setThumbnail(track.thumbnail);});



        return interaction.reply({ embeds: [embed] });client.login(DISCORD_TOKEN);

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
