﻿'use strict';
/*eslint-disable indent*/

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
            this.bot.messageManager.sendMessage(message, 'Error: Argument blank. Correct format is \'!tagme overwatch/warframe/sk/bot/rank)\''); return;
        } else if (!tag.match('^(?:overwatch|warframe|sk|bot|rank)$', 'i')) {
            this.bot.messageManager.sendMessage(message, 'Error: Argument invalid. Correct format is \'!tagme overwatch/warframe/sk/bot/rank)\''); return;
        }
        tag = tag.toLowerCase();
        
        if (tag === 'rank') {
            this.bot.settings.getMember(message.author.id).then((member) => {
                DiscordTags.assignRankTagsToMember(message, member.Rank);
            });
        }
        else {
            switch (tag) {
                case 'overwatch': DiscordTags.addRoleToMember(message.member, 'Overwatch'); break;
                case 'warframe': DiscordTags.addRoleToMember(message.member, 'Warframe'); break;
                case 'sk': DiscordTags.addRoleToMember(message.member, 'Spiral Knights'); break;
                case 'bot': DiscordTags.addRoleToMember(message.member, 'Bot Notifications'); break;
            }
        }
        this.bot.messageManager.sendMessage(message, `Successfully gave you the ${tag} tag!`);
        this.bot.logger.debug(`Added ${tag} tag to member ${message.author.username}`);
    }
}

module.exports = TagMe;