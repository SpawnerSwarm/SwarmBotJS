'use strict';

const pkg = require('../../package.json');

class FissuresEmbed {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot, fissures) {
        this.color = fissures.length > 2 ? 0x00ff00 : 0xff0000;
        this.fields = fissures.map(a => this.parseFissure(a));
        this.title = 'Fissures';
        this.footer = {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by warframe-worldstate-parser | Warframe Community Developers',
        };
        this.thumbnail = {
            url: `${pkg.repository.replace('github', 'raw.githubusercontent')}/master/src/resources/fissure.png`,
        };
    }

    /**
     * @param {Fissure} fissure
     * @returns {MessageEmbed}
     */
    parseFissure(fissure) {
        var embed = {
            name: `${fissure.missionType} ${fissure.tier}`,
            value: `[${fissure.getETAString()}] ${fissure.node} against ${fissure.enemy}`,
        };
        return embed;
    }
}

module.exports = FissuresEmbed;