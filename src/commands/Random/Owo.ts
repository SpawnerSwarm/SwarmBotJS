import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class OwO extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'random.translators.owo', 'owo', 'I\'m sorry.');

        this.regex = /^owo (.+)/i;

        this.requiredRank = 0;

        this.useStatusReactions = false;
    }

    async run(message: MessageWithStrippedContent) {
        const translate = /(l|r)/g;
        const match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;
        if(!match[1]) {
            return false;
        }
        
        const replaced = match[1].replace(translate, 'w');
        await message.channel.send(replaced);
        return true;
    }
}