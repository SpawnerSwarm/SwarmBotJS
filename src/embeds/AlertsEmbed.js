'use strict';

class AlertsEmbed {
    /**
     * @param {Cephalon} bot
     * @param {Array.<Alert>} alerts
     */
    constructor(bot, alerts) {
        this.color = alerts.length > 2 ? 0x00ff00 : 0xff0000;
        this.fields = alerts.map(a => this.parseAlert(a));
        this.title = 'Alerts';
        this.footer = {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by api.warframestat.us | Warframe Community Developers',
        };
    }

    /**
     * @param {Alert} alert 
     * @returns {EmbedField}
     */
    parseAlert(alert) {
        var embed = {
            name: `${alert.mission.faction} ${alert.mission.type} on ${alert.mission.node}\n`,
            value: `${alert.mission.reward.asString}\n` +
            `Level ${alert.mission.minEnemyLevel} - ${alert.mission.maxEnemyLevel}\n` +
            `${alert.eta} remaining`,
        };
        return embed;
    }
}

module.exports = AlertsEmbed;