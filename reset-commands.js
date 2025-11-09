require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Deleting all global commands...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] }
        );
        console.log('Successfully deleted all commands!');
        
        console.log('Waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
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
        
        console.log('Re-registering commands...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully registered commands!');
        console.log('Wait 1-2 minutes for Discord to update, then try /play again.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
