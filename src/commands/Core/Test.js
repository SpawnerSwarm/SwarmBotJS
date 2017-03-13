'use strict';

const Command = require('../../Command.js');

const Member = require('../../Member.js');

class Test extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'core.test', 'test', 'Test');

        this.requiredRank = 7;
    }

    /**
     * @param {Message} message
     */
    run(message) {
        /**
         * @type {Member}
         */
        const member = this.bot.settings.getMember(message.author.id, this.bot).then((member) => {
            message.channel.sendMessage(`
${member.ID}
${member.Name}
${member.Rank}
${member.WarframeName}
${member.SpiralKnightsName}
${member.SteamName}
${member.FormaDonated}`);
        });
    }
}

module.exports = Test;