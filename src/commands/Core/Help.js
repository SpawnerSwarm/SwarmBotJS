'use strict';

const Command = require('../../Command.js');
const fs = require('fs');

class Help extends Command {
    constructor(bot) {
        super(bot, 'core.help', 'help');

        this.allowDM = true;

        this.requiredRank = 1;

        this.regex = /(?:help|man(?:ual)?|docs?|what) (.+)/i;
    }

    run(message) {
        let match = message.strippedContent.match(this.regex);
        this.bot.logger.debug(match[1]);
        let name = match[1].toLowerCase();
        if (fs.existsSync(`./docs/${name}.md`)) {
            try {
                fs.readFile(`./docs/${name}.md`, function (err, data) {
                    if (err) throw err;
                    this.author.send(data.toString());
                    this.react('✅');
                }.bind(message));
            } catch (err) {
                this.bot.logger.error(err);
            }
        }
    }
}

module.exports = Help;