import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class UpdateWF extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.updatewf', 'updateWF');

        this.regex = /^updatewf <@!?(\d+)> (.+)$/i;

        this.requiredRank = 5;

        this.allowDM = false;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;

        this.bot.db.updateWF(match[1], match[2]);

        message.channel.send('Changed Warframe ID!');

        this.logger.info(`${message.author.username} updated Warframe ID of ${match[1]} to ${match[2]}`);
    }
}