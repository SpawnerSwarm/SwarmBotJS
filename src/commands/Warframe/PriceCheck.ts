import Command from "../../objects/Command";
import NexusEmbed from "../../embeds/NexusEmbed";
import * as request from "request-promise";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class PriceCheck extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'warframe.priceCheck', 'priceCheck');

        this.regex = /^(?:priceCheck|pc) ?(.+)?$/i;

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        const match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;
        if (!match[1]) {
            message.channel.send('Syntax incorrect. Please provide an item to price check.');
        } else {
            const item = match[1];
            message.react('🔄').then((reaction) => {
                request({
                    uri: `https://api.warframestat.us/pricecheck/attachment/${item}`,
                    json: true,
                    rejectUnauthorized: false
                }).then((res) => {
                    message.channel.send('', { embed: new NexusEmbed(this.bot, res, match[1]) });
                    reaction.remove().then(() => {
                        message.react('✅');
                    });
                }).catch((e) => {
                    this.logger.error(e);
                    message.channel.send('An Error occured. Please try again later.');
                    reaction.remove().then(() => {
                        message.react('🆘');
                    });
                });
            });
        }
    }
}