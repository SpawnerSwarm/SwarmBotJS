﻿'use strict';

const Command = require('../../Command.js');

class GuildMail extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'random.debug.guildmail', 'guildmail', 'Returns guildmail.');

        this.regex = new RegExp('^(?:guildmail|mail|gm)$');

        this.requiredRank = 0;
    }

    run(message) {
        message.channel.send(this.bot.guildMailURL);
    }
}

module.exports = GuildMail;