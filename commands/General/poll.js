const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, settings, dbUser, economyData) => {
  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setColor("#ad14da")
    .setDescription(args.join(" "))
    .addField(message.guild.language.poll.replyPollWithReact,
    `
    🟩 -` + message.guild.language.poll.pour `
    🟦 -` + message.guild.language.poll.neutre `
    🟥 -` + message.guild.language.poll.contre `
    `)
    .setTimestamp()
    .setFooter(message.guild.language.poll.nePasHesiterARefaireUnSondage)

  const poll = await message.channel.send({ embeds: [embed, embed2] });
  await poll.react("🟩");
  await poll.react("🟦");
  await poll.react("🟥");
};

module.exports.help = {
  name: "poll", 
  aliases: ['poll'],
  category: 'general',
  description: "🇫🇷 Créez des sondages simples à partir de cette commande. \n🇬🇧 Create some simple polls w/ this command.",
  cooldown: 20,
  usage: '',
  isUserAdmin: false,
  permissions: false,
  args: false,
  inDev: false
}