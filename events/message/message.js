const { Collection } = require('discord.js');

module.exports = async (client, message) => {
  const settings = await client.getGuild(message.guild);
  const dbUser = await client.getUser(message.member);

  if (message.author.bot) return;

  if (!dbUser) await client.createUser({
    guildID: message.member.guild.id,
    guildName: message.member.guild.name,
    userID: message.member.id,
    username: message.member.user.tag,
  });

  if (!message.guild.language) {
    const db = client.db;
    let language = db.has(`${message.guild.id}.language`) ? 
        await db.fetch(`${message.guild.id}.language`) :
        "fr";
    
    message.guild.language = require(`./../locales/${language}.json`);
 }

  if(message.content ===`<@!${message.client.user.id}>` || message.content ===`<@${message.client.user.id}>`){
  return message.reply({ content:`Uh-Oh! You forgot the prefix? It's \`${settings.prefix}\``, allowedMentions: { repliedUser: true }});;
 }

  const expCd = Math.floor(Math.random() * 19) + 1;
  const expToAdd = Math.floor(Math.random() * 25) + 10;

  if (expCd >= 8 && expCd <= 11) {
    await client.addExp(client, message.member, expToAdd).catch(console.error);
  };

  const userLevel = Math.floor(0.04 * Math.sqrt(dbUser.experience));
  const xpChannelModel = require('../../models/guild');
  const profileModel = require('./../../models/economy');

  if (dbUser.level < userLevel) {
    xpChannelModel.findOne({ guildID: message.guild.id }, async (err, data) => {
    if (!data) {
      return;
    } else {
      const user = message.member.user;
      const channel = message.member.guild.channels.cache.get(data.xpChannel);

      channel.send(`GG ${user}, tu viens de monter niveau **${userLevel}** ! Incroyable!`).catch(console.error);

      client.updateUser(message.member, { level: userLevel }).catch(console.error)
      await profileModel.findOneAndUpdate(
        {
            userID: message.author.id
        },
        {
            $inc: {
                coins: 100
            },
        }
      ).catch(console.error);
    }
   }).catch(console.error);
  };

  const economyModel = require('./../../models/economy');

  let economyData;
  try {
    economyData = await economyModel.findOne({ userID: message.author.id })
    if (!economyData) {
      let profile = await economyModel.create({
        userID: message.author.id,
        guildID: message.guild.id,
        coins: 1000,
        bank: 0
      })
      profile.save();
    }
  } catch (err) {
    console.log(err);
  }

  if (!message.content.startsWith(settings.prefix)) return;
  
  const args = message.content.slice(settings.prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const user = message.mentions.users.first();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
  if (!command) return;

  if (command.help.permissions && !message.member.hasPermission('BAN_MEMBERS')) return message.reply({content: message.guild.language.noPermToUse, allowedMentions: { repliedUser: true }});

  if (command.help.args && !args.length) {
    let noArgsReply = message.guild.language.messageEvent.noArgs + `${message.author}!`;

    if (command.help.usage) noArgsReply += `\n ${message.guild.language.messageEvent.howToUse} \`${settings.prefix}${command.help.name} ${command.help.usage}\``;

    return message.channel.send(noArgsReply);
  };

  if (command.help.isUserAdmin && !user) return message.reply(message.guild.language.messageEvent.needToTagSomeone);

  if (command.help.isUserAdmin && message.guild.member(user).hasPermission('BAN_MEMBERS')) return message.reply({ content: message.guild.language.messageEvent.cantUseCommandOnUser, allowedMentions: { repliedUser: true }});

  if (!client.cooldowns.has(command.help.name)) {
    client.cooldowns.set(command.help.name, new Collection());
  };

  const timeNow = Date.now();
  const tStamps = client.cooldowns.get(command.help.name);
  const cdAmount = (command.help.cooldown || 5) * 1000;

  if (tStamps.has(message.author.id)) {
    const cdExpirationTime = tStamps.get(message.author.id) + cdAmount;

    if (timeNow < cdExpirationTime) {
      timeLeft = (cdExpirationTime - timeNow) / 1000;
      return message.reply({ content: `${message.guild.language.messageEvent.pleaseWait} ${timeLeft.toFixed(0)} ${message.guild.language.messageEvent.pleaseWaitSeconds} \`${command.help.name}\`.`, allowedMentions: { repliedUser: true }});
    }
  }

  tStamps.set(message.author.id, timeNow);
  setTimeout(() => tStamps.delete(message.author.id), cdAmount);

  command.run(client, message, args, settings, dbUser, economyData);
}