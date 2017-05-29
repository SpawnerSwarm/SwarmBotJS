'use strict';

const Command = require('../../Command.js');

const Ranks = require('../../resources/Ranks.js');

class MemberList extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'database.memberList', 'memberList');

        this.bot = bot;

        this.requiredRank = 1;
    }

    run(message) {
        let str = '```xl\n';
        this.bot.settings.getRankPopulation().then((res) => {
            for (let i = 1; i <= 7; i++) {
                str += `${Ranks[i].name}: ${res[i]} out of ${Ranks[i].max}\n`;
            }
            str += '\n```';
            message.channel.send(str);
        });
    }
}

module.exports = MemberList;