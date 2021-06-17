const { MessageEmbed } = require("discord.js");
const Schema = require('../../models/welcome');

module.exports.run = (client, message, args) => {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply(message.guild.language.welcomeChannelError);

    Schema.findOne({ guildID: message.guild.id }, async (err, data) => {
        if (data) {
            data.channelID = channel.id;
            data.save();
        } else {
            new Schema({
                guildID: message.guild.id,
                channelID: channel.id,
            }).save();
        }
        message.reply(message.guild.language.welcomeChannel + ` ${channel}.`)
    })
};

module.exports.help = {
  name: "setwelcome",
  aliases: ['sw'],
  category: 'admin',
  description: "🇫🇷 Définis un salon de bienvenue. \n🇬🇧 Sets a welcome channel.",
  cooldown: 10,
  usage: 'channel id',
  isUserAdmin: false,
  permissions: true,
  args: true,
  inDev: false
}