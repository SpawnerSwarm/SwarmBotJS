import Cephalon from "../Cephalon";
import { RichEmbed } from "discord.js";
import { Alert } from "../objects/Types";

export default class AlertsEmbed extends RichEmbed {
    constructor(bot: Cephalon, alerts: Alert[]) {
        super();
        this.color = alerts.length > 2 ? 0x00ff00 : 0xff0000;
        this.fields = alerts.map(a => this.parseAlert(a));
        this.title = 'Alerts';
        this.footer = {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by api.warframestat.us | Warframe Community Developers',
        };
    }

    parseAlert(alert: Alert): {
        name: string,
        value: string,
        inline?: boolean
    } {
        var embed = {
            name: `${alert.mission.faction} ${alert.mission.type} on ${alert.mission.node}\n`,
            value: `${alert.mission.reward.asString}\n` +
            `Level ${alert.mission.minEnemyLevel} - ${alert.mission.maxEnemyLevel}\n` +
            `${alert.eta} remaining`,
        };
        return embed;
    }
}