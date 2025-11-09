require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Vytvoření DisTube instance
const distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: true,
    leaveOnFinish: false,
    leaveOnStop: true
});

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

// DisTube události
distube.on('playSong', (queue, song) => {
    queue.textChannel.send(`🎵 Přehrávám: **${song.name}** - \`${song.formattedDuration}\``);
});

distube.on('addSong', (queue, song) => {
    queue.textChannel.send(`✅ Přidáno do fronty: **${song.name}** - \`${song.formattedDuration}\``);
});

distube.on('error', (channel, error) => {
    console.error('DisTube chyba:', error);
    if (channel) channel.send(`❌ Chyba: ${error.message}`);
});

distube.on('empty', queue => {
    queue.textChannel.send('❌ Hlasový kanál je prázdný! Odpojuji se...');
});

distube.on('finish', queue => {
    queue.textChannel.send('✅ Fronta je prázdná!');
});

// Slash příkazy
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'play') {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Musíš být v hlasovém kanálu!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            console.log(`Hledám: ${query}`);
            await distube.play(voiceChannel, query, {
                member: interaction.member,
                textChannel: interaction.channel
            });
            await interaction.editReply('🔍 Hledám skladbu...');
        } catch (error) {
            console.error('Chyba při přehrávání:', error);
            await interaction.editReply(`❌ Chyba: ${error.message}`);
        }
    }

    if (commandName === 'skip') {
        const queue = distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
        }

        try {
            await distube.skip(interaction.guildId);
            interaction.reply('⏭️ Přeskočeno!');
        } catch (error) {
            interaction.reply('❌ Není žádná další skladba ve frontě!');
        }
    }

    if (commandName === 'stop') {
        const queue = distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
        }

        distube.stop(interaction.guildId);
        interaction.reply('⏹️ Zastaveno a fronta vymazána!');
    }

    if (commandName === 'queue') {
        const queue = distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ content: '❌ Fronta je prázdná!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Fronta skladeb')
            .setDescription(
                queue.songs.map((song, id) => 
                    `**${id + 1}.** ${song.name} - \`${song.formattedDuration}\``
                ).slice(0, 10).join('\n')
            );

        if (queue.songs.length > 10) {
            embed.setFooter({ text: `A dalších ${queue.songs.length - 10} skladeb...` });
        }

        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'nowplaying') {
        const queue = distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ content: '❌ Nic nehraje!', ephemeral: true });
        }

        const song = queue.songs[0];
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Aktuálně hraje')
            .setDescription(`**${song.name}**\n\`${queue.formattedCurrentTime}\` / \`${song.formattedDuration}\``)
            .setThumbnail(song.thumbnail);

        interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
