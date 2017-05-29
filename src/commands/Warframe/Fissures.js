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

        this.requiredRank = 0;
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        this.bot.worldState.getData()
        .then((ws) => {
            const fissures = ws.fissures.sort((a, b) => { return a.tierNum > b.tierNum; });
            message.channel.send('', {embed: new FissuresEmbed(this.bot, fissures)});
        })
        .catch(this.logger.error);
    }
}

module.exports = Fissures;