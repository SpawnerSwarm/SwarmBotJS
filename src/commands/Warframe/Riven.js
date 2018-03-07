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
            message.react('🔄').then((reaction) => {
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
                            this.bot.logger.error('Unable to connect to OCR server:');
                            message.channel.send('Unable to connect to OCR server. Please try again later.');
                            this.bot.logger.error(error.toString());
                            reaction.remove().then(() => {
                                message.react('🆘');
                            });
                        }
                        else {
                            let text = this.filterText(JSON.parse(body).ParsedResults[0].ParsedText);
                            this.bot.logger.debug(text);
                            let hasWarned = false;
                            message.channel.send(
                                '**Rank 8**'.concat(
                                    '\n\n',
                                    text.replace(/[-]?(?:[0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)(?:[eE][-+]?[0-9]+)?/g, (n) => {
                                        let m = +n * 9;
                                        if (m >= 500 && !hasWarned) {
                                            hasWarned = true;
                                            message.channel.send('These stats look a bit too high, make sure your screenshot is of a **Rank 0** mod and has no interference');
                                        }
                                        return Math.floor(m);
                                    })                            
                                )
                            );
                            reaction.remove().then(() => {
                                message.react('✅');
                            });
                        }
                    }
                );
            });
        }
        else {
            message.channel.send('Send a Rank 0 riven screenshot and be returned the stats at max rank');
        }
    }

    filterText(text) {
        let split = text.split('\n');
        let filteredText = '';
        for (var i = 0; i < split.length; i++) {
            let item = split[i];

            //add additional filters here
            let m = item.match(/[\d ]+/g);
            if (m != null && m[0] == item.match(/.+/g)) {
                //remove lines with only a number in them, usually the mastery rank requirement of the mod
                continue;
            }
            m = item.match(/MR[\d ]+/g);
            if (m != null && m[0] == item.match(/.+/g)) {
                continue;
            }
            filteredText = filteredText.concat(item, '\n');
        }
        return filteredText;
    }
}

module.exports = Riven;