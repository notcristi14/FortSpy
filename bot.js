const { Client, Intents, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'fortniteinfo') {
        const username = options.getString('username');

        // Make sure to replace this with a valid API endpoint and API key
        const API_URL = `https://fortnite-api.com/v1/stats/br/v2?name=${encodeURIComponent(username)}`;
        const API_KEY = process.env.FORTNITE_API_KEY;

        try {
            const response = await axios.get(API_URL, {
                headers: { 'Authorization': API_KEY }
            });
            
            const data = response.data.data;
            
            const accountId = data.account.id;
            const displayName = data.account.name;
            const accountStatus = data.account.status;
            const language = data.account.language;
            const gold = data.account.gold;
            const region = data.account.region;
            const onlineStatus = data.account.onlineStatus;
            const externalAccounts = data.account.externalAccounts.join(', ') || 'None';
            const rankedStats = data.ranked || {};
            const ranksInfo = Object.entries(rankedStats).map(([mode, rank]) => `${mode}: ${rank}`).join('\n') || 'No Ranked Data';

            const embed = new EmbedBuilder()
                .setColor('#00ADEF')
                .setTitle(`${displayName}'s Information`)
                .addFields(
                    { name: 'Account ID', value: accountId || 'N/A' },
                    { name: 'Display Name', value: displayName || 'N/A' },
                    { name: 'Account Status', value: accountStatus || 'N/A' },
                    { name: 'Language', value: language || 'N/A' },
                    { name: 'Owned Gold', value: gold ? gold.toString() : 'N/A' },
                    { name: 'Region', value: region || 'N/A' },
                    { name: 'Online Status', value: onlineStatus || 'N/A' },
                    { name: 'External Accounts', value: externalAccounts },
                    { name: 'Ranked Stats', value: ranksInfo }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Error fetching Fortnite information. Please check the username and try again.', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Registering the Slash Command
client.on('ready', () => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const command = new SlashCommandBuilder()
        .setName('fortniteinfo')
        .setDescription('Retrieve Fortnite information for a given username.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Fortnite username to retrieve information for.')
                .setRequired(true)
        );

    guild.commands.create(command.toJSON())
        .then(() => console.log('Slash command registered.'))
        .catch(console.error);
});
