'use strict';

const Command = require('../../Command.js');

class UpdateSK extends Command {
    constructor(bot) {
        super(bot, 'database.updatesk', 'updateSK');

        this.regex = /^updatesk <@(.+)> (.+)$/i;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message) {
        let match = message.strippedContent.match(this.regex);

        this.bot.settings.updateSK(match[1], match[2]);

        message.channel.send('Changed Spiral Knights ID!');

        this.bot.logger.info(`${message.author.username} updated Spiral Knights ID of ${match[1]} to ${match[2]}`);
    }
}

module.exports = UpdateSK;