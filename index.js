require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Partials } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once("clientReady", () => {
  console.log(" Bot je online jako " + client.user.tag);
  setInterval(() => console.log(" Bot běží..."), 60000);
});

client.on("error", (error) => console.error(" Error:", error));
process.on("SIGTERM", () => { client.destroy(); process.exit(0); });

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || msg.content !== "!setroles") return;
  
  try { await msg.delete(); } catch (e) {}
  
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("cs2").setLabel("CS2").setEmoji("").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("lol").setLabel("LoL").setEmoji("").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("fn").setLabel("Fortnite").setEmoji("").setStyle(ButtonStyle.Danger)
  );
  
  const embed = new EmbedBuilder().setTitle(" Vyber si herní role").setDescription("Klikni na tlačítko podle hry").setColor("#5865F2");
  msg.channel.send({ embeds: [embed], components: [row] });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const roleID = process.env["ROLE_" + interaction.customId.toUpperCase()];
  if (!roleID) return;
  const role = interaction.guild.roles.cache.get(roleID);
  if (!role) return await interaction.reply({ content: " Role neexistuje", ephemeral: true });
  if (interaction.member.roles.cache.has(roleID)) {
    await interaction.member.roles.remove(role);
    await interaction.reply({ content: " Role odebrána", ephemeral: true });
  } else {
    await interaction.member.roles.add(role);
    await interaction.reply({ content: " Role přidána", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
