import Command from "../../objects/Command";
import PlainsCycleEmbed from "../../embeds/PlainsCycleEmbed";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class PlainsCycle extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'warframe.cycle', 'cycle');
        this.regex = /^(?:cycle|plains)$/i;
    }

    async run(message: MessageWithStrippedContent) {
        //From Genesis: https://github.com/wfcd/genesis/blob/master/src/commands/Worldstate/EarthCycle.js
        try {
            const ws = await this.bot.wfws.getData();
            const cycle = ws.cetusCycle;
            const ostrons = ws.syndicateMissions.filter(mission => mission.syndicate === 'Ostrons')[0];
            if(ostrons) {
                cycle.expiry = ostrons.expiry;
            }
            message.channel.send('', {embed: new PlainsCycleEmbed(this.bot, cycle)});
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }
}