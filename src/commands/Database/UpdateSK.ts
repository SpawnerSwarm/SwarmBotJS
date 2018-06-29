import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class UpdateSK extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.updatesk', 'updateSK');

        this.regex = /^updatesk <@!?(\d+)> (.+)$/i;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;

        this.bot.db.updateSK(match[1], match[2]);

        message.channel.send('Changed Spiral Knights ID!');

        this.logger.info(`${message.author.username} updated Spiral Knights ID of ${match[1]} to ${match[2]}`);
    }
}