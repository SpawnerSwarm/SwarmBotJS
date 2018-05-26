'use strict';

const Command = require('../../Command.js');

const DiscordTags = require('../../DiscordTags.js');

class UnTagMe extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'core.tag.remove', 'untagme', 'Removes a discord notification tag for a specific group');

        this.allowDM = false;

        this.regex = new RegExp('^(?:untagme|untag) ?(.*?)?(?: <@!?(\\d+)>)?$');
    }

    run(message) {
        let match = message.strippedContent.match(this.regex, 'i');
        let tag = match[1];
        let target = match[2];

        let argstr = ' Correct format is \'!tagme (overwatch/warframe/sk/bot/leave)\'';
        if (tag === undefined) {
            message.channel.send(`Error: Argument blank.${argstr}`); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|(?:on)?leave)$/i)) {
            message.channel.send(`Error: Argument invalid.${argstr}`); return;
        }
        tag = tag.toLowerCase();
        function callback() {
            /*eslint-disable indent*/
            switch (tag) {
                case 'overwatch': DiscordTags.removeRoleFromMember(target, 'Overwatch'); break;
                case 'warframe': DiscordTags.removeRoleFromMember(target, 'Warframe'); break;
                case 'sk': DiscordTags.removeRoleFromMember(target, 'Spiral Knights'); break;
                case 'bot': DiscordTags.removeRoleFromMember(target, 'Bot Notifications'); break;
                case 'leave': this.removeOnLeaveTag(target); break;
                case 'onleave': this.removeOnLeaveTag(target); break;
            }
            /*eslint-enable indent*/
            message.channel.send(`Successfully removed the ${tag} tag!`);
            this.bot.logger.info(`Removed ${tag} tag from member ${target.username}`);
        }
        if (target === undefined) {
            target = message.member;
            callback.bind(this)();
        } else {
            message.guild.fetchMember(target).then((m) => {
                target = m;
                callback.bind(this)();
            });
        }
    }

    removeOnLeaveTag(member) {
        this.bot.settings.getMember(member.id).then((dbmember) => {
            if (dbmember.Rank == 7) {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (GM)');
            }
            else if (dbmember.Rank >= 5) {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (General)');
            }
            else {
                return DiscordTags.removeRoleFromMember(member, 'On Leave (Member)');
            }
        });
    }
}

module.exports = UnTagMe;