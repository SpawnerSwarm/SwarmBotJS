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

        this.regex = new RegExp('^(?:untagme|untag) ?(.+)?$');
    }

    run(message) {
        let tag = message.strippedContent.match(this.regex, 'i')[1];
        if (tag === undefined) {
            message.channel.send('Error: Argument blank. Correct format is \'!tagme (overwatch/warframe/sk/bot)\''); return;
        } else if (!tag.match(/^(?:overwatch|warframe|sk|bot)$/i)) {
            message.channel.send('Error: Argument invalid. Correct format is \'!tagme (overwatch/warframe/sk/bot)\''); return;
        }
        tag = tag.toLowerCase();
        /*eslint-disable indent*/
        switch (tag) {
            case 'overwatch': DiscordTags.removeRoleFromMember(message.member, 'Overwatch'); break;
            case 'warframe': DiscordTags.removeRoleFromMember(message.member, 'Warframe'); break;
            case 'sk': DiscordTags.removeRoleFromMember(message.member, 'Spiral Knights'); break;
            case 'bot': DiscordTags.removeRoleFromMember(message.member, 'Bot Notifications'); break;
        }
        /*eslint-enable indent*/
        message.channel.send(`Successfully removed the ${tag} tag!`);
        this.bot.logger.debug(`Removed ${tag} tag from member ${message.author.username}`);
    }
}

module.exports = UnTagMe;