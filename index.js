require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Partials
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Když se bot připojí (používáme clientReady místo ready)
client.once("clientReady", () => {
  console.log(`✅ Bot je online jako ${client.user.tag}`);
  console.log(`🔍 Intents: ${client.options.intents.bitfield}`);
  console.log(`📡 Připraven sledovat zprávy...`);
  
  // Keep-alive pro Railway
  setInterval(() => {
    console.log(`💓 Bot běží... (${new Date().toLocaleTimeString()})`);
  }, 60000); // Každou minutu
});

// Error handling
client.on("error", (error) => {
  console.error("❌ Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled promise rejection:", error);
});

process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received, shutting down gracefully...");
  client.destroy();
  process.exit(0);
});

// Uvítací zpráva
client.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("👋 Vítej na serveru!")
    .setDescription(`Ahoj ${member}, užij si pobyt!\n\n📜 Mrkni do **#rules**\n🎮 Vyber si hry v **#roles**`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// Příkazy a logování zpráv
client.on("messageCreate", (msg) => {
  // Debug log pro všechny zprávy
  console.log(`📨 [${msg.channel.name}] ${msg.author.tag}: "${msg.content}"`);
  
  if (msg.author.bot) return; // Ignoruj boty
  
  if (msg.content === "!setroles") {
    console.log(`📩 Command received in channel: ${msg.channel.id}`);
    console.log(`� Channel name: ${msg.channel.name}`);
    console.log(`🔑 Expected ROLE_CHANNEL: ${process.env.ROLE_CHANNEL}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cs2").setLabel("CS2 💀").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("lol").setLabel("LoL ⚔️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("fn").setLabel("Fortnite 🔥").setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
      .setTitle("🎮 Vyber si herní role")
      .setDescription("Klikni na tlačítko podle hry, kterou hraješ.");

    msg.channel.send({ embeds: [embed], components: [row] });
  }
});

// Reakce na kliknutí
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    const roleID = process.env[`ROLE_${interaction.customId.toUpperCase()}`];
    
    if (!roleID) {
      console.error(`❌ Role ID nenalezeno pro: ROLE_${interaction.customId.toUpperCase()}`);
      return await interaction.reply({ 
        content: "❌ Chyba: Role není nakonfigurována.", 
        ephemeral: true 
      });
    }

    const role = interaction.guild.roles.cache.get(roleID);
    
    if (!role) {
      console.error(`❌ Role s ID ${roleID} nenalezena na serveru`);
      return await interaction.reply({ 
        content: "❌ Chyba: Role neexistuje na serveru.", 
        ephemeral: true 
      });
    }

    if (interaction.member.roles.cache.has(roleID)) {
      await interaction.member.roles.remove(role);
      await interaction.reply({ 
        content: `❌ Role **${role.name}** odebrána.`, 
        ephemeral: true 
      });
      console.log(`✅ Role ${role.name} odebrána uživateli ${interaction.user.tag}`);
    } else {
      await interaction.member.roles.add(role);
      await interaction.reply({ 
        content: `✅ Role **${role.name}** přidána.`, 
        ephemeral: true 
      });
      console.log(`✅ Role ${role.name} přidána uživateli ${interaction.user.tag}`);
    }
  } catch (error) {
    console.error("❌ Error při zpracování interakce:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: "❌ Něco se pokazilo. Bot možná nemá oprávnění spravovat role.", 
        ephemeral: true 
      });
    }
  }
});

// Přihlášení bota
client.login(process.env.TOKEN);
