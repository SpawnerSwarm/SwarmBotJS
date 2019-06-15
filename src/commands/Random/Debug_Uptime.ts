import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Uptime extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'random.debug.uptime', 'uptime', 'Returns uptime.');

        this.regex = /^(?:uptime|time)$/i;

        this.requiredRank = 0;
    }

    async run(message: MessageWithStrippedContent) {
        message.channel.send(`${this.bot.client.user.username} has been online continuously for ${Math.ceil(this.bot.client.uptime / 3600000 * 100) / 100} hours.`);
        return true;
    }
}