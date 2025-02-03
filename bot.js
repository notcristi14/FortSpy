require('dotenv').config(); // Load environment variables from the .env file
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const axios = require('axios'); // For making API requests

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

// Specify the guild ID directly in the code
const GUILD_ID = 'YOUR_GUILD_ID'; // Replace with your actual guild ID

client.once('ready', async () => {
  console.log('Fortnite Bot is online!');
  
  // Ensure that the bot is connected and has access to the guild
  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) {
    console.log('Guild not found!');
    return;
  }

  console.log(`Guild ${guild.name} has been found!`);  // Log the name of the guild if found

  // Define slash command with username option
  const fortniteCommand = new SlashCommandBuilder()
    .setName('fortnite')
    .setDescription('Get Fortnite player information')
    .addStringOption(option => 
      option.setName('username')
        .setDescription('Enter the Fortnite username')
        .setRequired(true));

  // Register slash command
  try {
    await guild.commands.create(fortniteCommand);
    console.log('Slash command has been registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'fortnite') {
    const username = interaction.options.getString('username');
    
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

// Log in to the bot
client.login(process.env.DISCORD_BOT_TOKEN); // Fetch bot token from the .env file
