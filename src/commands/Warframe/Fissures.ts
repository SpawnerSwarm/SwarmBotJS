import Command from "../../objects/Command";
import FissuresEmbed from "../../embeds/FissuresEmbed";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Fissures extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'warframe.fissures', 'wffissures');

        this.regex = /^(?:warframe ?|wf ?)?fissures ?(?:list)?$/i;

        this.requiredRank = 0;
    }

    async run(message: MessageWithStrippedContent) {
        try {
            const ws = await this.bot.wfws.getData();
            const fissures = ws.fissures.sort((a, b) => {
                if(a.tierNum > b.tierNum) {
                    return 1;
                }
                else if(a.tierNum < b.tierNum) {
                    return -1;
                }
                else {
                    return 0;
                } 
            });
            message.channel.send('', {embed: new FissuresEmbed(this.bot, fissures)});
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }
}