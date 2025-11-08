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

// Když se bot připojí
client.on("ready", () => {
  console.log(`✅ Bot je online jako ${client.user.tag}`);
  console.log(`🔍 Intents: ${client.options.intents.bitfield}`);
  console.log(`📡 Připraven sledovat zprávy...`);
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

  const roleID = process.env[`ROLE_${interaction.customId.toUpperCase()}`];
  if (!roleID) return;

  const role = interaction.guild.roles.cache.get(roleID);

  if (interaction.member.roles.cache.has(roleID)) {
    await interaction.member.roles.remove(role);
    interaction.reply({ content: `❌ Role **${role.name}** odebrána.`, ephemeral: true });
  } else {
    await interaction.member.roles.add(role);
    interaction.reply({ content: `✅ Role **${role.name}** přidána.`, ephemeral: true });
  }
});

// Přihlášení bota
client.login(process.env.TOKEN);
