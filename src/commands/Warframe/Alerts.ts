import Command from "../../objects/Command";
import AlertsEmbed from "../../embeds/AlertsEmbed";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Alerts extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'warframe.alerts', 'wfalerts');

        this.regex = /^(?:warframe ?|wf ?)?alerts ?(?:list)?$/i;

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        this.bot.wfws.getData().then((ws) => {
            const alerts = ws.alerts.filter(a => !a.expired);
            message.channel.send('', {embed: new AlertsEmbed(this.bot, alerts)});
        })
        .catch((err) => this.logger.error(err));
    }
}