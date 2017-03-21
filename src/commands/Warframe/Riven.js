'use strict';

const Command = require('../../Command.js');
const request = require('request');

class Riven extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'warframe.riven', 'riven');
    }

    run(message) {
        if (message.attachments.array().length > 0) {
            message.react('🔄');
            request.post(
                'https://api.ocr.space/parse/image',
                {
                    form: {
                        url: message.attachments.array()[0].url,
                        language: 'eng',
                        apiKey: process.env.OCR_KEY,
                        isOverlayRequired: 'false'
                    }
                },
                (error, response, body) => {
                    if (error) {
                        this.bot.logger.error(error);
                    }
                    else {
                        let text = this.filterText(JSON.parse(body).ParsedResults[0].ParsedText);
                        this.bot.logger.debug(text);
                        let hasWarned = false;
                        message.channel.sendMessage(
                            '**Rank 8**'.concat(
                                '\n\n',
                                text.replace(/[-]?(?:[0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)(?:[eE][-+]?[0-9]+)?/g, (n) => {
                                    let m = +n * 9;
                                    if (m >= 500 && !hasWarned) {
                                        hasWarned = true;
                                        this.bot.messageManager.sendMessage(message, 'These stats look a bit too high, make sure your screenshot is of a **Rank 0** mod and has no interference');
                                    }
                                    return Math.floor(m);
                                })));
                    }
                }
            );
        }
        else {
            this.bot.messageManager.sendMessage(message, 'Send a Rank 0 riven screenshot and be returned the stats at max rank');
        }
    }

    filterText(text) {
        let split = text.split('\n');
        let filteredText = '';
        for (var i = 0; i < split.length; i++) {
            let item = split[i];

            //add additional filters here
            this.bot.logger.debug(item.match(/.+/g) == '05');
            let m = item.match(/[\d ]+/g);
            if (m != null && m[0] == item.match(/.+/g)) {
                //remove lines with only a number in them, usually the mastery rank requirement of the mod
                continue;
            }
            filteredText = filteredText.concat(item, '\n');
        }
        return filteredText;
    }
}

module.exports = Riven;