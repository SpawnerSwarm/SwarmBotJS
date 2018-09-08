import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Source extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'random.source', 'source', 'Post a link to the bot\'s source');

        this.regex = /^(?:source|code|sourcecode|github)$/i;

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        message.channel.send(process.env.SOURCE || "no source listed in dockerfile");
    }
}