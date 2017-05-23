'use strict';

const Command = require('../../Command.js');

class Kick extends Command {
    constructor(bot) {
        super(bot, 'moderation.kick', 'kick');

        this.bot = bot;
        this.requiredRank = 6;
        this.regex = /kick <@!?(\d+)>(?: (.+))?/i;
        this.allowDM = false;
    }

    run(message) {
        let match = message.strippedContent.match(this.regex);
        message.guild.fetchMember(match[1]).then((user) => {
            this.bot.settings.getMember(message.author.id).then((author) => {
                this.bot.settings.getMember(match[1]).then((member) => {
                    if (member.Rank >= author.Rank) {
                        message.channel.sendMessage('You cannot kick a member of higher or equal rank!');
                        this.bot.logger.warning(`${author.Name} tried to kick ${member.Name} but was too low of rank`);
                    } else {
                        this.bot.settings.setBanned(member.ID, 1);
                        if (user.guild.id == '137991656547811328') {
                            let content = 'Kick 👢';
                            content += `\n**User:** ${user.user.username}#${user.user.discriminator} (${user.id})`;
                            content += `\n**Moderator:** ${author.Name}`;
                            let reason = 'No reason given.';
                            if (match[2] != undefined) {
                                reason = match[2];
                            }
                            content += `\n**Reason:** ${reason}`;
                            user.guild.channels.get('274687008406765568').sendMessage(content);
                            user.sendMessage(`Hello ${member.Name}, this is an automated message from the Spawner Swarm to inform you that you have been kicked for '${reason}'.  If you want to re-enter the Swarm, please contact an Officer for a re-invite. You will still be subject to the same rules, however.`);
                        }
                        user.kick();
                        this.bot.logger.info(`${author.Name} kicked ${member.Name} from the server`);
                    }
                })
                    .catch((err) => {
                        message.channel.sendMessage('Unable to find user. They may not be present in the database or a database connection failed. Please contact Mardan.');
                        this.bot.logger.error(`Error in !kick: ${err}`);
                    });
            });
        }).catch((err) => {
            message.channel.sendMessage('Could not find user or was unable to kick them.');
            this.bot.logger.error(`Error in !kick: ${err}`);
        });
    }
}

module.exports = Kick;