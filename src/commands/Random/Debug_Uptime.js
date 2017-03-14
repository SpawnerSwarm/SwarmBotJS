'use strict';

const Command = require('../../Command.js');

class Uptime extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'random.debug.uptime', 'uptime', 'Returns uptime.');

        this.regex = new RegExp('^(?:uptime|time)$');

        this.requiredRank = 0;
    }

    run(message) {
        this.bot.messageManager.sendMessage(message, `SwarmBot has been online continuously for ${Math.ceil((this.bot.client.uptime / 3600000) * 100) / 100} hours.`);
    }
}

module.exports = Uptime;