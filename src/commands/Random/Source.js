'use strict';

const Command = require('../../Command.js');
const pkg = require('../../../package.json');

class Source extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'random.source', 'source', 'Post a link to the bot\'s source');

        this.regex = new RegExp('^(?:source|code|sourcecode|github)$');

        this.requiredRank = 0;
    }

    run(message) {
        message.channel.send(pkg.repository);
    }
}

module.exports = Source;