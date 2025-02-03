require('dotenv').config(); // Load environment variables from the .env file
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
const axios = require('axios'); // For making API requests

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Specify the guild ID directly in the code
const GUILD_ID = 'YOUR_GUILD_ID'; // Replace with your actual guild ID

client.once('ready', async () => {
  console.log('Fortnite Bot is online!');
  
  const commands = [
  {
    name: 'lookup-user',
    description: 'Lookup an players information by their username or Account ID',
  },
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const checkPlayerInfo() = async => {
  // API URL for Fortnite stats (using your Fortnite API key)
    const url = `https://fortnite-api.com/v1/stats?username=${username}&apiKey=${process.env.FORTNITE_API_KEY}`;

    try {
      // Make API request to get Fortnite stats (replace with the actual endpoint)
      const response = await axios.get(url);
      const data = response.data;

      // Assuming 'data' contains the needed information
      const accountInfo = {
        accountId: data.accountId,
        displayName: data.displayName,
        accountStatus: data.status,
        language: data.language,
        gold: data.gold,
        playRegion: data.region,
        onlineStatus: data.onlineStatus,
        linkedAccounts: data.linkedAccounts, // e.g., Xbox, PSN
        ranks: data.ranks, // Different game modes ranks
      };

      // Build the embed response with user-specific title
      const embed = {
        title: `${accountInfo.displayName}'s Information`,
        fields: [
          { name: 'Account ID', value: accountInfo.accountId || 'N/A' },
          { name: 'Account Status', value: accountInfo.accountStatus || 'N/A' },
          { name: 'Language', value: accountInfo.language || 'N/A' },
          { name: 'Gold', value: accountInfo.gold || '0' },
          { name: 'Play Region', value: accountInfo.playRegion || 'N/A' },
          { name: 'Online Status', value: accountInfo.onlineStatus || 'N/A' },
          { name: 'Linked Accounts', value: accountInfo.linkedAccounts.join(', ') || 'None' },
          { name: 'Ranks', value: `Battle Royale: ${accountInfo.ranks.battleRoyale || 'N/A'}, Ranked Reload: ${accountInfo.ranks.rankReload || 'N/A'}` },
          // Add more ranks if needed
        ],
        color: 0x00FF00, // Green color for success
      };

      // Send embed as reply
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching Fortnite data:', error);
      await interaction.reply({ content: 'Sorry, something went wrong while fetching the player data.', ephemeral: true });
    }
  }
});

  
// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'lookup-user') {
    const username = interaction.options.getString('username');
    const infoMessage = await checkPlayerInfo();
    await interaction.reply(checkPlayerInfo);
  }
});


  // Register slash command
  try {
    await guild.commands.create(fortniteCommand);
    console.log('Slash command has been registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});
    
    

// Log in to the bot
client.login(process.env.DISCORD_BOT_TOKEN); // Fetch bot token from the .env file
