'use strict';

const Command = require('../../Command.js');
const NexusEmbed = require('../../embeds/NexusEmbed.js');
const request = require('request-promise');

class PriceCheck extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'warframe.priceCheck', 'priceCheck');

        this.regex = new RegExp('^(?:priceCheck|pc) ?(.+)?$');

        this.requiredRank = 0;
    }

    run(message) {
        const match = message.strippedContent.match(this.regex);
        if (!match[1]) {
            message.channel.send('Syntax incorrect. Please provide an item to price check.');
        } else {
            const item = match[1];
            message.react('🔄').then((reaction) => {
                request({
                    uri: `https://api.warframestat.us/pricecheck/attachment/${item}`,
                    json: true,
                    rejectUnauthorized: false
                }).then((res) => {
                    message.channel.send('', { embed: new NexusEmbed(this.bot, res, match[1]) });
                    reaction.remove().then(() => {
                        message.react('✅');
                    });
                }).catch((e) => {
                    this.bot.logger.error(e);
                    message.channel.send('An Error occured. Please try again later.');
                    reaction.remove().then(() => {
                        message.react('🆘');
                    });
                });
            });
        }
    }
}

module.exports = PriceCheck;