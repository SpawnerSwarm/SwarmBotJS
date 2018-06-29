import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class GuildMail extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'random.debug.guildmail', 'guildmail', 'Returns guildmail.');

        this.regex = new RegExp('^(?:guildmail|mail|gm)$');

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        message.channel.send(this.bot.guildMailUrl);
    }
}