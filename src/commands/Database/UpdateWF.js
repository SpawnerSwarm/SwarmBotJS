'use strict';

const Command = require('../../Command.js');

class UpdateWF extends Command {
    constructor(bot) {
        super(bot, 'database.updatewf', 'updateWF');

        this.regex = /^updatewf <@(.+)> (.+)$/i;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message) {
        let match = message.strippedContent.match(this.regex);

        this.bot.settings.updateWF(match[1], match[2]);

        message.channel.send('Changed Warframe ID!');

        this.bot.logger.info(`${message.author.username} updated Warframe ID of ${match[1]} to ${match[2]}`);
    }
}

module.exports = UpdateWF;