'use strict';

const Command = require('../../Command.js');
const PlainsCycleEmbed = require('../../embeds/PlainsCycleEmbed.js');

class PlainsCycle extends Command {
    constructor(bot) {
        super(bot, 'warframe.cycle', 'cycle');
        this.regex = /cycle|plains/i;
    }

    run(message) {
        //From Genesis: https://github.com/wfcd/genesis/blob/master/src/commands/Worldstate/EarthCycle.js
        this.bot.worldState.getData()
        .then((ws) => {
            const cycle = ws.cetusCycle;
            this.bot.logger.debug(cycle);
            const ostrons = ws.syndicateMissions.filter(mission => mission.syndicate === 'Ostrons')[0];
            if(ostrons) {
                cycle.bountyExpiry = ostrons.expiry;
            }
            message.channel.send('', {embed: new PlainsCycleEmbed(this.bot, cycle)});
        })
        .catch((err) => this.bot.logger.error(err));
    }
}

module.exports = PlainsCycle;