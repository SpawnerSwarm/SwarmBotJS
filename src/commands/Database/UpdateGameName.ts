import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class UpdateSK extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.updatesk', 'updateSK');

        this.regex = /^update(sk|wf) <@!?(\d+)> (.+)$/i;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    async run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;

        const game = match[1] as 'sk' | 'wf';
        let name: string;

        switch(game) {
            case 'sk': await this.bot.db.updateSK(match[2], match[3]); name = 'Spiral Knights';
            case 'wf': await this.bot.db.updateWF(match[2], match[3]); name = 'Warframe';
        }

        this.logger.info(`${message.author.username} updated ${name} ID of ${match[1]} to ${match[2]}`);
        message.channel.send(`Changed ${name} ID of ${message.author.username}!`);
        return true;
    }
}