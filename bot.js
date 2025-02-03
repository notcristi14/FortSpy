require('dotenv').config(); // Load environment variables from the .env file
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
const axios = require('axios'); // For making API requests

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Specify the guild ID directly in the code
const GUILD_ID = 'YOUR_GUILD_ID'; // Replace with your actual guild ID
const CLIENT_ID = process.env.CLIENT_ID; // Ensure CLIENT_ID is loaded from .env or hardcoded

client.once('ready', async () => {
  console.log('Fortnite Bot is online!');
  
  const commands = [
  {
    name: 'lookup-user',
    description: 'Lookup a player’s information by their username or Account ID',
    options: [
      {
        name: 'username',
        type: 3, // This defines it as a string
        description: 'The Fortnite username of the player to look up',
        required: true, // This makes the username input required
      },
    ],
  },
];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Successfully reloaded application (/) commands.');

    // Register slash command
    await client.guilds.cache.get(GUILD_ID).commands.set(commands);
    console.log('Slash command has been registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

const checkPlayerInfo = async (username) => {
  const url = `https://fortnite-api.com/v1/stats?username=${username}&apiKey=${process.env.FORTNITE_API_KEY}`;

  try {
    // Log the URL to verify if it's correct
    console.log(`Fetching data for username: ${username}`);
    const response = await axios.get(url);
    const data = response.data;

    // Check if the data structure is as expected
    console.log(data); // This will help you debug the API response

    // Assuming 'data' contains the needed information
    const accountInfo = {
      accountId: data.accountId,
      displayName: data.displayName,
      accountStatus: data.status,
      language: data.language,
      gold: data.gold,
      playRegion: data.region,
      onlineStatus: data.onlineStatus,
      linkedAccounts: data.linkedAccounts,
      ranks: data.ranks,
    };

    // Build the embed response
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
      ],
      color: 0x00FF00,
    };

    return embed;
  } catch (error) {
    console.error('Error fetching Fortnite data:', error);
    throw new Error('Error fetching Fortnite data');
  }
};

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'lookup-user') {
    const username = interaction.options.getString('username');
    try {
      const embed = await checkPlayerInfo(username);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Sorry, something went wrong while fetching the player data.', ephemeral: true });
    }
  }
});

// Log in to the bot
client.login(process.env.DISCORD_BOT_TOKEN); // Fetch bot token from the .env file
