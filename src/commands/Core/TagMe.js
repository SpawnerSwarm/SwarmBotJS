'use strict';

const Command = require('../../Command.js');

const DiscordTags = require('../../DiscordTags.js');

class TagMe extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'core.tag.add', 'tagme', 'Applies a discord notification tag for a specific group');

        this.allowDM = false;

        this.regex = new RegExp('^(?:tagme|tag) ?(.*?)?(?: <@!?(\\d+)>)?$');
    }

    run(message) {
        let match = message.strippedContent.match(this.regex, 'i');
        let tag = match[1];
        let target = match[2];

        let argstr = ' Correct format is \'!tagme (overwatch/warframe/sk/bot/rank/leave)\'';
        if (tag === undefined) {
            message.channel.send(`Error: Argument blank.${argstr}`); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|rank|(?:on)?leave)$/i)) {
            message.channel.send(`Error: Argument invalid.${argstr}`); return;
        }
        tag = tag.toLowerCase();

        function callback() {
            if (tag === 'rank') {
                this.bot.settings.getMember(target.id).then((member) => {
                    DiscordTags.assignRankTagsToMember(message, member.Rank, target);
                });
            }
            else {
                /*eslint-disable indent*/
                switch (tag) {
                    case 'overwatch': DiscordTags.addRoleToMember(target, 'Overwatch'); break;
                    case 'warframe': DiscordTags.addRoleToMember(target, 'Warframe'); break;
                    case 'sk': DiscordTags.addRoleToMember(target, 'Spiral Knights'); break;
                    case 'bot': DiscordTags.addRoleToMember(target, 'Bot Notifications'); break;
                    case 'leave': this.addOnLeaveTag(target); break;
                    case 'onleave': this.addOnLeaveTag(target); break;
                }
                /*eslint-enable indent*/
            }
            message.channel.send(`Successfully gave ${target.id == message.author.id ? 'you' : target.username} the ${tag} tag!`);
            this.bot.logger.info(`Added ${tag} tag to member ${target.username}`);
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

    addOnLeaveTag(member) {
        this.bot.settings.getMember(member.id).then((dbmember) => {
            if (dbmember.Rank == 7) {
                return DiscordTags.addRoleToMember(member, 'On Leave (GM)');
            }
            else if (dbmember.Rank >= 5) {
                return DiscordTags.addRoleToMember(member, 'On Leave (General)');
            }
            else {
                return DiscordTags.addRoleToMember(member, 'On Leave (Member)');
            }
        });
    }
}

module.exports = TagMe;