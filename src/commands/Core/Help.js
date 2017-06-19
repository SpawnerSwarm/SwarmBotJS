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
                    this.react('✅');
                    let str = data.toString();
                    let formattedStr = str.split('\\split');
                    if(formattedStr.length > 0) {
                        for(let i = 0; i < formattedStr.length; i++) {
                            this.author.send(formattedStr[i].replace('\\split', ''));
                        }
                    }
                    else {
                        this.author.send(data.toString());
                    }
                }.bind(message));
            } catch (err) {
                this.bot.logger.error(err);
            }
        }
    }
}

module.exports = Help;