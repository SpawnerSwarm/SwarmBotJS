'use strict';

const Command = require('../../Command.js');

const AlertsEmbed = require('../../embeds/AlertsEmbed.js');

class Alerts extends Command {
    /**
     * @param {Cephalon} bot 
     */
    constructor(bot) {
        super(bot, 'warframe.alerts', 'wfalerts');

        this.regex = new RegExp('^(?:warframe ?|wf ?)?alerts ?(?:list)?$');

        this.requiredRank = 0;
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        this.bot.worldState.getData()
        .then((ws) => {
            const alerts = ws.alerts.filter(a => !a.getExpired());
            message.channel.send('', {embed: new AlertsEmbed(this.bot, alerts)});
        })
        .catch(this.logger.error);
    }
}

module.exports = Alerts;