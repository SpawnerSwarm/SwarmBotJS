'use strict';

class PlainsCycleEmbed {
    //Genesis: https://github.com/WFCD/genesis/blob/master/src/embeds/EarthCycleEmbed.js
    constructor(bot, cycle) {
        this.title = `PoE Cycle - ${cycle.isDay ? 'Day' : 'Night'}`;
        this.color = cycle.isDay ? 0xB64624 : 0x000066;
        this.thumbnail = {
            url: 'https://i.imgur.com/Ph337PR.png'
        };
        this.fields = [
            {
                name: '_ _',
                value: `Time remaining until ${cycle.isDay ? 'night' : 'day'}: ${cycle.timeLeft}`
            }
        ];
        this.footer = {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by api.warframestat.us | Warframe Community Developers',
        };
    }
}

module.exports = PlainsCycleEmbed;