'use strict';

const Command = require('../../Command.js');

const FissuresEmbed = require('../../embeds/FissuresEmbed.js');

class Fissures extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'warframe.fissures', 'wffissures');

        this.regex = new RegExp('^(?:warframe ?|wf ?)?fissures ?(?:list)?$');
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        this.bot.worldState.getData()
        .then((ws) => {
            const fissures = ws.fissures.sort((a, b) => { return a.tierNum > b.tierNum; });
            this.bot.messageManager.embed(message, new FissuresEmbed(this.bot, fissures));
        })
        .catch(this.logger.error);
    }
}

module.exports = Fissures;