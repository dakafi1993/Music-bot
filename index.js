require('dotenv').config();require('dotenv').config();require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const { Player } = require('discord-player');const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');



const DISCORD_TOKEN = process.env.DISCORD_TOKEN;const { Player } = require('discord-player');const { Manager } = require('erela.js');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;



if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {

    console.error('❌ Missing required environment variables!');// Environment variables validation// Environment variables validation

    console.error('Required: DISCORD_TOKEN, DISCORD_CLIENT_ID');

    process.exit(1);const DISCORD_TOKEN = process.env.DISCORD_TOKEN;const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

}

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({

    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]const LAVALINK_HOST = process.env.LAVALINK_HOST;

});

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {const LAVALINK_PORT = process.env.LAVALINK_PORT || '2333';

const player = new Player(client);

player.extractors.loadDefault();    console.error('❌ Missing required environment variables!');const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD;



const commands = [    console.error('Required: DISCORD_TOKEN, DISCORD_CLIENT_ID');

    { name: 'play', description: 'Play a song', options: [{ name: 'query', type: 3, description: 'Song URL or search', required: true }] },

    { name: 'pause', description: 'Pause the current song' },    process.exit(1);if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !LAVALINK_HOST || !LAVALINK_PASSWORD) {

    { name: 'resume', description: 'Resume the paused song' },

    { name: 'skip', description: 'Skip the current song' },}    console.error('❌ Missing required environment variables!');

    { name: 'queue', description: 'Show the current queue' },

    { name: 'nowplaying', description: 'Show currently playing song' },    console.error('Required: DISCORD_TOKEN, DISCORD_CLIENT_ID, LAVALINK_HOST, LAVALINK_PASSWORD');

    { name: 'stop', description: 'Stop and clear queue' },

    { name: 'leave', description: 'Leave voice channel' },// Initialize Discord client    process.exit(1);

    { name: 'volume', description: 'Set volume', options: [{ name: 'level', type: 4, description: 'Volume 0-100', required: true }] }

];const client = new Client({}



async function registerCommands() {    intents: [

    try {

        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);        GatewayIntentBits.Guilds,// Initialize Discord client

        console.log('🔄 Registering slash commands...');

        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });        GatewayIntentBits.GuildVoiceStates,const client = new Client({

        console.log('✅ Slash commands registered successfully!');

    } catch (error) {        GatewayIntentBits.GuildMessages    intents: [

        console.error('❌ Error registering commands:', error);

    }    ]        GatewayIntentBits.Guilds,

}

});        GatewayIntentBits.GuildVoiceStates,

player.events.on('playerStart', (queue, track) => {

    queue.metadata.channel.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setTitle('🎵 Now Playing').setDescription(`[${track.title}](${track.url})`).addFields({ name: 'Author', value: track.author, inline: true }, { name: 'Duration', value: track.duration, inline: true })] });        GatewayIntentBits.GuildMessages

});

// Initialize discord-player    ]

player.events.on('emptyQueue', (queue) => queue.metadata.channel.send('✅ Queue ended!'));

player.events.on('error', (queue, error) => { console.error('❌ Player error:', error); queue.metadata.channel.send('❌ Error playing music!'); });const player = new Player(client);});



client.once('ready', () => { console.log(`✅ Bot logged in as ${client.user.tag}`); registerCommands(); });



client.on('interactionCreate', async interaction => {// Load extractors// Initialize Erela.js Manager

    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild, channel } = interaction;player.extractors.loadDefault();const manager = new Manager({

    const voiceChannel = member.voice.channel;

        nodes: [

    if (commandName === 'play') {

        if (!voiceChannel) return interaction.reply({ content: '❌ Join a voice channel!', ephemeral: true });// Slash commands definition        {

        const query = options.getString('query');

        await interaction.deferReply();const commands = [            host: LAVALINK_HOST,

        try {

            const { track } = await player.play(voiceChannel, query, { nodeOptions: { metadata: { channel: interaction.channel, client: interaction.guild?.members.me, requestedBy: interaction.user } } });    {            port: parseInt(LAVALINK_PORT),

            return interaction.editReply({ embeds: [new EmbedBuilder().setColor('#0099ff').setTitle('📝 Added to Queue').setDescription(`[${track.title}](${track.url})`).addFields({ name: 'Author', value: track.author, inline: true }, { name: 'Duration', value: track.duration, inline: true })] });

        } catch (error) { console.error(error); return interaction.editReply({ content: '❌ Could not play!' }); }        name: 'play',            password: LAVALINK_PASSWORD,

    }

        description: 'Play a song from URL or search query',            secure: parseInt(LAVALINK_PORT) === 443

    const queue = player.nodes.get(guild.id);

    if (commandName === 'pause') { if (!queue?.isPlaying()) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); queue.node.pause(); interaction.reply('⏸️ Paused!'); }        options: [{        }

    if (commandName === 'resume') { if (!queue?.node.isPaused()) return interaction.reply({ content: '❌ Nothing paused!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); queue.node.resume(); interaction.reply('▶️ Resumed!'); }

    if (commandName === 'skip') { if (!queue?.isPlaying()) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); const current = queue.currentTrack; queue.node.skip(); interaction.reply(`⏭️ Skipped **${current.title}**`); }            name: 'query',    ],

    if (commandName === 'stop') { if (!queue) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); queue.delete(); interaction.reply('⏹️ Stopped!'); }

    if (commandName === 'leave') { if (!queue) return interaction.reply({ content: '❌ Not in channel!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); queue.delete(); interaction.reply('👋 Left!'); }            type: 3,    send: (id, payload) => {

    if (commandName === 'queue') { if (!queue?.currentTrack) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); const tracks = queue.tracks.toArray(); interaction.reply({ embeds: [new EmbedBuilder().setColor('#0099ff').setTitle('📋 Queue').setDescription(`**Now:**\n[${queue.currentTrack.title}](${queue.currentTrack.url}) - ${queue.currentTrack.duration}\n\n` + (tracks.length ? `**Next:**\n${tracks.slice(0, 10).map((t, i) => `${i + 1}. [${t.title}](${t.url}) - ${t.duration}`).join('\n')}` : '**Empty**') + (tracks.length > 10 ? `\n\n*...and ${tracks.length - 10} more*` : ''))] }); }

    if (commandName === 'nowplaying') { if (!queue?.currentTrack) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); const track = queue.currentTrack; interaction.reply({ embeds: [new EmbedBuilder().setColor('#00FF00').setTitle('🎵 Now Playing').setDescription(`[${track.title}](${track.url})`).addFields({ name: 'Author', value: track.author, inline: true }, { name: 'Duration', value: track.duration, inline: true }, { name: 'Progress', value: queue.node.createProgressBar(), inline: false })] }); }            description: 'Song URL or search query',        const guild = client.guilds.cache.get(id);

    if (commandName === 'volume') { if (!queue) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true }); if (!voiceChannel || voiceChannel.id !== queue.channel.id) return interaction.reply({ content: '❌ Same channel!', ephemeral: true }); const volume = options.getInteger('level'); if (volume < 0 || volume > 100) return interaction.reply({ content: '❌ Volume 0-100!', ephemeral: true }); queue.node.setVolume(volume); interaction.reply(`🔊 Volume **${volume}%**`); }

});            required: true        if (guild) guild.shard.send(payload);



process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));        }]    }

client.login(DISCORD_TOKEN);

    },});

    {

        name: 'pause',// Slash commands definition

        description: 'Pause the current song'const commands = [

    },    {

    {        name: 'play',

        name: 'resume',        description: 'Play a song from URL or search query',

        description: 'Resume the paused song'        options: [{

    },            name: 'query',

    {            type: 3,

        name: 'skip',            description: 'Song URL or search query',

        description: 'Skip the current song'            required: true

    },        }]

    {    },

        name: 'queue',    {

        description: 'Show the current queue'        name: 'pause',

    },        description: 'Pause the current song'

    {    },

        name: 'nowplaying',    {

        description: 'Show the currently playing song'        name: 'resume',

    },        description: 'Resume the paused song'

    {    },

        name: 'stop',    {

        description: 'Stop playing and clear the queue'        name: 'skip',

    },        description: 'Skip the current song'

    {    },

        name: 'leave',    {

        description: 'Leave the voice channel'        name: 'queue',

    },        description: 'Show the current queue'

    {    },

        name: 'volume',    {

        description: 'Set the volume (0-100)',        name: 'nowplaying',

        options: [{        description: 'Show the currently playing song'

            name: 'level',    },

            type: 4,    {

            description: 'Volume level (0-100)',        name: 'stop',

            required: true        description: 'Stop playing and clear the queue'

        }]    },

    }    {

];        name: 'leave',

        description: 'Leave the voice channel'

// Register slash commands    },

async function registerCommands() {    {

    try {        name: 'volume',

        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);        description: 'Set the volume (0-100)',

        console.log('🔄 Registering slash commands...');        options: [{

        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });            name: 'level',

        console.log('✅ Slash commands registered successfully!');            type: 4,

    } catch (error) {            description: 'Volume level (0-100)',

        console.error('❌ Error registering commands:', error);            required: true

    }        }]

}    }

];

// Player events

player.events.on('playerStart', (queue, track) => {// Register slash commands

    const embed = new EmbedBuilder()async function registerCommands() {

        .setColor('#00FF00')    try {

        .setTitle('🎵 Now Playing')        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

        .setDescription(`[${track.title}](${track.url})`)        console.log('🔄 Registering slash commands...');

        .addFields({ name: 'Author', value: track.author, inline: true })        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });

        .addFields({ name: 'Duration', value: track.duration, inline: true });        console.log('✅ Slash commands registered successfully!');

        } catch (error) {

    queue.metadata.channel.send({ embeds: [embed] });        console.error('❌ Error registering commands:', error);

});    }

}

player.events.on('emptyQueue', (queue) => {

    queue.metadata.channel.send('✅ Queue has ended. Use `/play` to add more songs!');// Erela.js events

});manager.on('nodeConnect', node => {

    console.log(`✅ Lavalink node "${node.options.host}" connected`);

player.events.on('error', (queue, error) => {});

    console.error(`❌ Player error:`, error);

    queue.metadata.channel.send('❌ An error occurred while playing music!');manager.on('nodeError', (node, error) => {

});    console.error(`❌ Lavalink node "${node.options.host}" error:`, error.message);

});

// Discord client events

client.once('ready', () => {manager.on('trackStart', (player, track) => {

    console.log(`✅ Bot logged in as ${client.user.tag}`);    const channel = client.channels.cache.get(player.textChannel);

    registerCommands();    const embed = new EmbedBuilder()

});        .setColor('#00FF00')

        .setTitle('🎵 Now Playing')

// Interaction handler        .setDescription(`[${track.title}](${track.uri})`)

client.on('interactionCreate', async interaction => {        .addFields({ name: 'Author', value: track.author, inline: true })

    if (!interaction.isChatInputCommand()) return;        .addFields({ name: 'Duration', value: formatDuration(track.duration), inline: true });

    

    const { commandName, options, member, guild, channel } = interaction;    channel?.send({ embeds: [embed] });

});

    // Check if user is in voice channel

    const voiceChannel = member.voice.channel;manager.on('queueEnd', player => {

        const channel = client.channels.cache.get(player.textChannel);

    if (commandName === 'play') {    channel?.send('✅ Queue has ended. Use `/play` to add more songs!');

        if (!voiceChannel) {    player.destroy();

            return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });});

        }

// Discord client events

        const query = options.getString('query');client.once('ready', () => {

        await interaction.deferReply();    console.log(`✅ Bot logged in as ${client.user.tag}`);

    manager.init(client.user.id);

        try {    registerCommands();

            const { track } = await player.play(voiceChannel, query, {});

                nodeOptions: {

                    metadata: {client.on('raw', d => manager.updateVoiceState(d));

                        channel: interaction.channel,

                        client: interaction.guild?.members.me,// Interaction handler

                        requestedBy: interaction.userclient.on('interactionCreate', async interaction => {

                    }    if (!interaction.isChatInputCommand()) return;

                }

            });    const { commandName, options, member, guild, channel } = interaction;



            const embed = new EmbedBuilder()    // Check if user is in voice channel

                .setColor('#0099ff')    const voiceChannel = member.voice.channel;

                .setTitle('📝 Added to Queue')    

                .setDescription(`[${track.title}](${track.url})`)    if (commandName === 'play') {

                .addFields({ name: 'Author', value: track.author, inline: true })        if (!voiceChannel) {

                .addFields({ name: 'Duration', value: track.duration, inline: true });            return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });

        }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {        const query = options.getString('query');

            console.error(error);        await interaction.deferReply();

            return interaction.editReply({ content: '❌ Could not play this track!' });

        }        let player = manager.get(guild.id);

    }        

        if (!player) {

    const queue = player.nodes.get(guild.id);            player = manager.create({

                guild: guild.id,

    if (commandName === 'pause') {                voiceChannel: voiceChannel.id,

        if (!queue || !queue.isPlaying()) {                textChannel: channel.id,

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });                selfDeafen: true

        }            });

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {        }

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

        }        if (player.state !== 'CONNECTED') player.connect();

        

        queue.node.pause();        // Search for tracks

        interaction.reply('⏸️ Paused the music!');        const res = await manager.search(query, interaction.user);

    }

        if (res.loadType === 'LOAD_FAILED' || res.loadType === 'NO_MATCHES') {

    if (commandName === 'resume') {            if (!player.queue.current) player.destroy();

        if (!queue || !queue.node.isPaused()) {            return interaction.editReply({ content: '❌ No results found!' });

            return interaction.reply({ content: '❌ Nothing is paused!', ephemeral: true });        }

        }

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {        if (res.loadType === 'PLAYLIST_LOADED') {

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });            player.queue.add(res.tracks);

        }            const embed = new EmbedBuilder()

                        .setColor('#0099ff')

        queue.node.resume();                .setTitle('📝 Playlist Added')

        interaction.reply('▶️ Resumed the music!');                .setDescription(`Added **${res.tracks.length}** tracks from **${res.playlist.name}**`);

    }            interaction.editReply({ embeds: [embed] });

        } else {

    if (commandName === 'skip') {            player.queue.add(res.tracks[0]);

        if (!queue || !queue.isPlaying()) {            const embed = new EmbedBuilder()

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });                .setColor('#0099ff')

        }                .setTitle('📝 Added to Queue')

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {                .setDescription(`[${res.tracks[0].title}](${res.tracks[0].uri})`);

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });            interaction.editReply({ embeds: [embed] });

        }        }

        

        const current = queue.currentTrack;        if (!player.playing && !player.paused && !player.queue.size) {

        queue.node.skip();            player.play();

        interaction.reply(`⏭️ Skipped **${current.title}**`);        }

    }    }



    if (commandName === 'stop') {    if (commandName === 'pause') {

        if (!queue) {        const player = manager.get(guild.id);

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });        if (!player || !player.queue.current) {

        }            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {        }

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {

        }            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

                }

        queue.delete();        

        interaction.reply('⏹️ Stopped the music and cleared the queue!');        player.pause(true);

    }        interaction.reply('⏸️ Paused the music!');

    }

    if (commandName === 'leave') {

        if (!queue) {    if (commandName === 'resume') {

            return interaction.reply({ content: '❌ Bot is not in a voice channel!', ephemeral: true });        const player = manager.get(guild.id);

        }        if (!player || !player.queue.current) {

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });        }

        }        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {

                    return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

        queue.delete();        }

        interaction.reply('👋 Left the voice channel!');        

    }        player.pause(false);

        interaction.reply('▶️ Resumed the music!');

    if (commandName === 'queue') {    }

        if (!queue || !queue.currentTrack) {

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });    if (commandName === 'skip') {

        }        const player = manager.get(guild.id);

                if (!player || !player.queue.current) {

        const tracks = queue.tracks.toArray();            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

        const embed = new EmbedBuilder()        }

            .setColor('#0099ff')        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {

            .setTitle('📋 Current Queue')            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

            .setDescription(        }

                `**Now Playing:**\n[${queue.currentTrack.title}](${queue.currentTrack.url}) - ${queue.currentTrack.duration}\n\n` +        

                (tracks.length ? `**Up Next:**\n${tracks.slice(0, 10).map((track, i) =>         const skipped = player.queue.current;

                    `${i + 1}. [${track.title}](${track.url}) - ${track.duration}`        player.stop();

                ).join('\n')}` : '**No songs in queue**') +        interaction.reply(`⏭️ Skipped **${skipped.title}**`);

                (tracks.length > 10 ? `\n\n*...and ${tracks.length - 10} more*` : '')    }

            );

            if (commandName === 'stop') {

        interaction.reply({ embeds: [embed] });        const player = manager.get(guild.id);

    }        if (!player) {

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

    if (commandName === 'nowplaying') {        }

        if (!queue || !queue.currentTrack) {        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

        }        }

                

        const track = queue.currentTrack;        player.queue.clear();

        const embed = new EmbedBuilder()        player.stop();

            .setColor('#00FF00')        interaction.reply('⏹️ Stopped the music and cleared the queue!');

            .setTitle('🎵 Now Playing')    }

            .setDescription(`[${track.title}](${track.url})`)

            .addFields({ name: 'Author', value: track.author, inline: true })    if (commandName === 'leave') {

            .addFields({ name: 'Duration', value: track.duration, inline: true })        const player = manager.get(guild.id);

            .addFields({ name: 'Progress', value: queue.node.createProgressBar(), inline: false });        if (!player) {

                    return interaction.reply({ content: '❌ Bot is not in a voice channel!', ephemeral: true });

        interaction.reply({ embeds: [embed] });        }

    }        if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

    if (commandName === 'volume') {        }

        if (!queue) {        

            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });        player.destroy();

        }        interaction.reply('👋 Left the voice channel!');

        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {    }

            return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });

        }    if (commandName === 'queue') {

                const player = manager.get(guild.id);

        const volume = options.getInteger('level');        if (!player || !player.queue.current) {

        if (volume < 0 || volume > 100) {            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });

            return interaction.reply({ content: '❌ Volume must be between 0 and 100!', ephemeral: true });        }

        }        

                const queue = player.queue;

        queue.node.setVolume(volume);        const embed = new EmbedBuilder()

        interaction.reply(`🔊 Volume set to **${volume}%**`);            .setColor('#0099ff')

    }            .setTitle('📋 Current Queue')

});            .setDescription(

                `**Now Playing:**\n[${queue.current.title}](${queue.current.uri}) - ${formatDuration(queue.current.duration)}\n\n` +

// Error handling                (queue.length ? `**Up Next:**\n${queue.slice(0, 10).map((track, i) => 

process.on('unhandledRejection', error => {                    `${i + 1}. [${track.title}](${track.uri}) - ${formatDuration(track.duration)}`

    console.error('Unhandled promise rejection:', error);                ).join('\n')}` : '**No songs in queue**') +

});                (queue.length > 10 ? `\n\n*...and ${queue.length - 10} more*` : '')

            );

// Login        

client.login(DISCORD_TOKEN);        interaction.reply({ embeds: [embed] });

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
