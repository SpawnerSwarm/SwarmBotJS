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

        this.regex = new RegExp('^(?:tagme|tag) ?(.+)?$');
    }

    run(message) {
        let tag = message.strippedContent.match(this.regex, 'i')[1];
        if (tag === undefined) {
            message.channel.send('Error: Argument blank. Correct format is \'!tagme (overwatch/warframe/sk/bot/rank)\''); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot|rank)$/i)) {
            message.channel.send('Error: Argument invalid. Correct format is \'!tagme (overwatch/warframe/sk/bot/rank)\''); return;
        }
        tag = tag.toLowerCase();
        
        if (tag === 'rank') {
            this.bot.settings.getMember(message.author.id).then((member) => {
                DiscordTags.assignRankTagsToMember(message, member.Rank);
            });
        }
        else {
            /*eslint-disable indent*/
            switch (tag) {
                case 'overwatch': DiscordTags.addRoleToMember(message.member, 'Overwatch'); break;
                case 'warframe': DiscordTags.addRoleToMember(message.member, 'Warframe'); break;
                case 'sk': DiscordTags.addRoleToMember(message.member, 'Spiral Knights'); break;
                case 'bot': DiscordTags.addRoleToMember(message.member, 'Bot Notifications'); break;
            }
            /*eslint-enable indent*/
        }
        message.channel.send(`Successfully gave you the ${tag} tag!`);
        this.bot.logger.debug(`Added ${tag} tag to member ${message.author.username}`);
    }
}

module.exports = TagMe;