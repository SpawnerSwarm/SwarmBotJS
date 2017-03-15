'use strict';

const Command = require('../../Command.js');
const Nexus = require('warframe-nexus-query');
const NexusEmbed = require('../../embeds/NexusEmbed.js');

class PriceCheck extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'warframe.priceCheck', 'priceCheck');

        this.regex = new RegExp('^(?:priceCheck|pc) ?(.+)?$');

        this.nexusQuerier = new Nexus();
    }

    run(message) {
        const match = message.strippedContent.match(this.regex);
        if(!match[1]) {
            message.channel.sendMessage('Syntax incorrect. Please provide an item to price check.');
        } else {
            this.nexusQuerier.priceCheckQueryAttachment(match[1])
            .then((result) => {
                this.bot.messageManager.embed(message, new NexusEmbed(this.bot, result, match[1]));
            })
            .catch(this.logger.error);
        }
    }
}

module.exports = PriceCheck;