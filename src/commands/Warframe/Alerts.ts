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

    async run(message: MessageWithStrippedContent) {
        try {
            const ws = await this.bot.wfws.getData();
            const alerts = ws.alerts.filter(a => !a.expired);
            message.channel.send('', {embed: new AlertsEmbed(this.bot, alerts)});
            return true;
        } catch (err) { 
            this.logger.error(err);
            return false;
        }
    }
}