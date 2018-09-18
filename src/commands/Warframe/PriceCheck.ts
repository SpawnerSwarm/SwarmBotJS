import Command from "../../objects/Command";
import NexusEmbed from "../../embeds/NexusEmbed";
import * as request from "request-promise-native";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class PriceCheck extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'warframe.priceCheck', 'priceCheck');

        this.regex = /^(?:priceCheck|pc) ?(.+)?$/i;

        this.requiredRank = 0;
    }

    async run(message: MessageWithStrippedContent) {
        const match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;
        if (!match[1]) {
            message.channel.send('Syntax incorrect. Please provide an item to price check.');
            return false;
        }
        try {
            const item = match[1];
            const res = await request({
                uri: `https://api.warframestat.us/pricecheck/attachment/${item}`,
                json: true,
                rejectUnauthorized: false
            });
            message.channel.send('', { embed: new NexusEmbed(this.bot, res, match[1]) });
            return true;
        } catch (err) {
            this.logger.error(err);
            message.channel.send('An Error occured. Please try again later.');
            return false; 
        }
    }
}