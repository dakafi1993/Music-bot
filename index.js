require('dotenv').config();require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const { Player } = require('discord-player');const { Player } = require('discord-player');



const DISCORD_TOKEN = process.env.DISCORD_TOKEN;const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;



if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {

    console.error('❌ Missing environment variables!');    console.error('Missing env vars!');

    process.exit(1);    process.exit(1);

}}



const client = new Client({const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]const player = new Player(client);

});player.extractors.loadDefault();



const player = new Player(client);client.once('ready', () => console.log('Bot ready!'));

player.extractors.loadDefault();client.login(DISCORD_TOKEN);


const commands = [
    { name: 'play', description: 'Play a song', options: [{ name: 'query', type: 3, description: 'Song URL or search', required: true }] },
    { name: 'pause', description: 'Pause the song' },
    { name: 'resume', description: 'Resume the song' },
    { name: 'skip', description: 'Skip current song' },
    { name: 'stop', description: 'Stop and clear queue' },
    { name: 'queue', description: 'Show queue' },
    { name: 'nowplaying', description: 'Show current song' },
    { name: 'volume', description: 'Set volume', options: [{ name: 'level', type: 4, description: 'Volume 0-100', required: true }] },
    { name: 'leave', description: 'Leave voice channel' }
];

async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
        console.log('🔄 Registering commands...');
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        console.log('✅ Commands registered!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send({ embeds: [new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Now Playing')
        .setDescription(`[${track.title}](${track.url})`)
        .addFields(
            { name: 'Author', value: track.author, inline: true },
            { name: 'Duration', value: track.duration, inline: true }
        )] });
});

player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('✅ Queue ended!');
});

player.events.on('error', (queue, error) => {
    console.error('Player error:', error);
    queue.metadata.channel.send('❌ Error playing music!');
});

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    registerCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild, channel } = interaction;
    const voiceChannel = member.voice.channel;

    if (commandName === 'play') {
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });
        }

        const query = options.getString('query');
        await interaction.deferReply();

        try {
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild?.members.me,
                        requestedBy: interaction.user
                    }
                }
            });

            return interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📝 Added to Queue')
                .setDescription(`[${track.title}](${track.url})`)
                .addFields(
                    { name: 'Author', value: track.author, inline: true },
                    { name: 'Duration', value: track.duration, inline: true }
                )] });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: '❌ Could not play this track!' });
        }
    }

    const queue = player.nodes.get(guild.id);

    if (commandName === 'pause') {
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }
        queue.node.pause();
        return interaction.reply('⏸️ Paused!');
    }

    if (commandName === 'resume') {
        if (!queue || !queue.node.isPaused()) {
            return interaction.reply({ content: '❌ Nothing is paused!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }
        queue.node.resume();
        return interaction.reply('▶️ Resumed!');
    }

    if (commandName === 'skip') {
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }
        const current = queue.currentTrack;
        queue.node.skip();
        return interaction.reply(`⏭️ Skipped **${current.title}**`);
    }

    if (commandName === 'stop') {
        if (!queue) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }
        queue.delete();
        return interaction.reply('⏹️ Stopped and cleared queue!');
    }

    if (commandName === 'queue') {
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        const tracks = queue.tracks.toArray();
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📋 Current Queue')
            .setDescription(
                `**Now Playing:**\n[${queue.currentTrack.title}](${queue.currentTrack.url}) - ${queue.currentTrack.duration}\n\n` +
                (tracks.length ? `**Up Next:**\n${tracks.slice(0, 10).map((t, i) => 
                    `${i + 1}. [${t.title}](${t.url}) - ${t.duration}`
                ).join('\n')}` : '**No songs in queue**') +
                (tracks.length > 10 ? `\n\n*...and ${tracks.length - 10} more*` : '')
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        const track = queue.currentTrack;
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Now Playing')
            .setDescription(`[${track.title}](${track.url})`)
            .addFields(
                { name: 'Author', value: track.author, inline: true },
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Progress', value: queue.node.createProgressBar(), inline: false }
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'volume') {
        if (!queue) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }

        const volume = options.getInteger('level');
        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: '❌ Volume must be between 0 and 100!', ephemeral: true });
        }

        queue.node.setVolume(volume);
        return interaction.reply(`🔊 Volume set to **${volume}%**`);
    }

    if (commandName === 'leave') {
        if (!queue) {
            return interaction.reply({ content: '❌ Bot is not in a voice channel!', ephemeral: true });
        }
        if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
            return interaction.reply({ content: '❌ You must be in the same voice channel!', ephemeral: true });
        }
        queue.delete();
        return interaction.reply('👋 Left the voice channel!');
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection:', error);
});

client.login(DISCORD_TOKEN);
